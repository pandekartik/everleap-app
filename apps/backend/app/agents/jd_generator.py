"""
Job Description Generator Agent.
"""
import json
from langgraph.graph import END, StateGraph

from agents.base import AgentState, BaseAgent
from agents.market_research import market_research_agent
from core.llm import groq_llm


class JobDescriptionAgent(BaseAgent):
    """Agent for generating job descriptions."""
    
    def __init__(self):
        super().__init__(name="JobDescriptionAgent", llm=groq_llm)
    
    async def conduct_research(self, state: AgentState) -> AgentState:
        """Conduct market research."""
        try:
            research_result = await market_research_agent.execute(
                input_data=state["input"],
                metadata=state["agent_metadata"]
            )
            
            if research_result.success:
                state["agent_metadata"]["market_research"] = research_result.output
                state["agent_metadata"]["research_input_tokens"] = research_result.input_tokens
                state["agent_metadata"]["research_output_tokens"] = research_result.output_tokens
                state["agent_metadata"]["research_total_tokens"] = research_result.total_tokens
        except Exception as e:
            state["agent_metadata"]["research_error"] = str(e)
        
        return state
    
    async def generate_description(self, state: AgentState) -> AgentState:
        """Generate job description in HTML format for LinkedIn."""
        try:
            job_data = json.loads(state["input"])
            market_research = state["agent_metadata"].get("market_research")
            diversity_policy = state["agent_metadata"].get("diversity_policy", "")
            company_name = state["agent_metadata"].get("company_name", "Our Company")
            
            # Default diversity policy if none provided
            default_diversity = """We are an equal opportunity employer and value diversity at our company. 
We do not discriminate on the basis of race, religion, color, national origin, gender, sexual orientation, 
age, marital status, veteran status, or disability status. We encourage applications from all qualified 
individuals and are committed to creating an inclusive environment for all employees."""
            
            final_diversity = diversity_policy if diversity_policy else default_diversity
            
            research_context = ""
            if market_research:
                try:
                    research = json.loads(market_research)
                    research_context = f"""
Market Research:
- Salary: ${research.get('salary_range', {}).get('min')} - ${research.get('salary_range', {}).get('max')}
- Skills: {', '.join(research.get('key_skills', [])[:5])}
- Qualifications: {', '.join(research.get('qualifications', [])[:3])}
"""
                except:
                    pass
            
            system_prompt = f"""You are an expert HR professional creating job descriptions for LinkedIn.

OUTPUT FORMAT: Use HTML tags for proper formatting on LinkedIn:
- <h2> for section headers
- <p> for paragraphs
- <ul> and <li> for bullet points
- <strong> for emphasis

STRUCTURE (in this exact order):
1. <h2>About {company_name}</h2> - Brief intro about the company (2-3 sentences)
2. <h2>About the Role</h2> - Engaging overview of the position (2-3 sentences)
3. <h2>Key Responsibilities</h2> - 5-7 bullet points
4. <h2>Required Qualifications</h2> - 5-6 items
5. <h2>Preferred Qualifications</h2> - 3-4 items  
6. <h2>What We Offer</h2> - 5-7 benefits
7. <h2>Equal Opportunity Statement</h2> - MUST include the exact diversity policy text provided

IMPORTANT: The diversity policy section MUST be included at the end, exactly as provided."""
            
            user_prompt = f"""Create job description for {company_name}:

Position Details:
- Title: {job_data.get('job_title')}
- Department: {job_data.get('department', 'N/A')}
- Location: {job_data.get('location')}
- Type: {job_data.get('employment_type')}
- Remote: {'Yes' if job_data.get('is_remote') else 'No'}
- Salary: ${job_data.get('compensation_min')} - ${job_data.get('compensation_max')} {job_data.get('currency', 'USD')}
- Equity: {job_data.get('equity', 'TBD')}

{research_context}

DIVERSITY POLICY (include this EXACTLY in the Equal Opportunity Statement section):
{final_diversity}

Generate the complete HTML-formatted job description now."""
            
            response = await self.llm.generate_with_system(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=4000
            )
            
            result = {
                "job_description": response.content,
                "screening_questions": [
                    {"question": "What interests you most about this role?", "required": True, "order": 1},
                    {"question": "Describe your experience with similar responsibilities.", "required": True, "order": 2},
                    {"question": "What is your expected salary range?", "required": True, "order": 3},
                    {"question": "What is your availability to start?", "required": True, "order": 4}
                ],
                "tokens_used": response.total_tokens
            }
            
            # Aggregate tokens from market research + JD generation
            research_input = state["agent_metadata"].get("research_input_tokens", 0)
            research_output = state["agent_metadata"].get("research_output_tokens", 0)
            research_total = state["agent_metadata"].get("research_total_tokens", 0)
            
            total_input_tokens = research_input + response.input_tokens
            total_output_tokens = research_output + response.output_tokens
            total_tokens = research_total + response.total_tokens
            
            state["output"] = json.dumps(result, indent=2)
            state["agent_metadata"]["input_tokens"] = total_input_tokens
            state["agent_metadata"]["output_tokens"] = total_output_tokens
            state["agent_metadata"]["total_tokens"] = total_tokens
        except Exception as e:
            state["error"] = str(e)
        
        return state
    
    def create_graph(self) -> StateGraph:
        workflow = StateGraph(AgentState)
        workflow.add_node("research", self.conduct_research)
        workflow.add_node("generate", self.generate_description)
        workflow.set_entry_point("research")
        workflow.add_edge("research", "generate")
        workflow.add_edge("generate", END)
        return workflow.compile()


job_description_agent = JobDescriptionAgent()

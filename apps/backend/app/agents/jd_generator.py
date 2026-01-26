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
        """Generate job description."""
        try:
            job_data = json.loads(state["input"])
            market_research = state["agent_metadata"].get("market_research")
            diversity_policy = state["agent_metadata"].get("diversity_policy", "")
            
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
            
            system_prompt = """You are an expert HR professional. Create a compelling job description with:
1. Engaging overview (2-3 sentences)
2. Key Responsibilities (5-7 bullet points)
3. Required Qualifications (5-6 items)
4. Preferred Qualifications (3-4 items)
5. What We Offer (5-7 benefits)
6. Diversity statement

Use plain text with clear section headers. NO markdown formatting."""
            
            user_prompt = f"""Create job description for:
- Title: {job_data.get('job_title')}
- Department: {job_data.get('department', 'N/A')}
- Location: {job_data.get('location')}
- Type: {job_data.get('employment_type')}
- Remote: {'Yes' if job_data.get('is_remote') else 'No'}
- Salary: ${job_data.get('compensation_min')} - ${job_data.get('compensation_max')} {job_data.get('currency', 'USD')}
- Equity: {job_data.get('equity', 'TBD')}

{research_context}

Diversity Policy: {diversity_policy if diversity_policy else 'Equal opportunity employer'}

Create a professional, engaging job description now."""
            
            response = await self.llm.generate_with_system(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=3000
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

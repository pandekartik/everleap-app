"""
Resume Screener Agent for AI-powered candidate evaluation.
"""
import json
from langgraph.graph import END, StateGraph

from agents.base import AgentState, BaseAgent
from core.llm import groq_llm


class ResumeScreenerAgent(BaseAgent):
    """Agent for screening resumes against job requirements."""
    
    def __init__(self):
        super().__init__(name="ResumeScreenerAgent", llm=groq_llm)
    
    async def screen_resume(self, state: AgentState) -> AgentState:
        """Screen resume against job description."""
        try:
            input_data = json.loads(state["input"])
            parsed_resume = input_data.get("parsed_resume")
            job_description = input_data.get("job_description")
            job_title = input_data.get("job_title")
            
            system_prompt = """You are an expert recruiter and ATS system. Evaluate candidate fit in JSON format:
{
    "score": number (0-100),
    "summary": "2-3 sentence evaluation",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["gap 1", "gap 2"],
    "recommendation": "strong_match" | "potential_match" | "no_match",
    "key_highlights": ["highlight 1", "highlight 2"],
    "questions_for_interview": ["question 1", "question 2"]
}"""
            
            resume_text = json.dumps(parsed_resume, indent=2) if isinstance(parsed_resume, dict) else str(parsed_resume)
            
            user_prompt = f"""Evaluate this candidate for {job_title}:

JOB DESCRIPTION:
{job_description[:2000]}

CANDIDATE RESUME:
{resume_text[:2000]}

Provide detailed evaluation in JSON format."""
            
            response = await self.llm.generate_with_system(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.3,
                max_tokens=2000,
                json_mode=True
            )
            
            state["output"] = response.content
            state["agent_metadata"]["input_tokens"] = response.input_tokens
            state["agent_metadata"]["output_tokens"] = response.output_tokens
            state["agent_metadata"]["total_tokens"] = response.total_tokens
        except Exception as e:
            state["error"] = str(e)
        
        return state
    
    def create_graph(self) -> StateGraph:
        workflow = StateGraph(AgentState)
        workflow.add_node("screen", self.screen_resume)
        workflow.set_entry_point("screen")
        workflow.add_edge("screen", END)
        return workflow.compile()


resume_screener_agent = ResumeScreenerAgent()

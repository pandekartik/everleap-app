"""
Resume Parser Agent with PDF extraction.
"""
import json
from langgraph.graph import END, StateGraph

from agents.base import AgentState, BaseAgent
from core.llm import groq_llm
from services.pdf_extractor import pdf_extractor


class ResumeParserAgent(BaseAgent):
    """Agent for parsing resumes."""
    
    def __init__(self):
        super().__init__(name="ResumeParserAgent", llm=groq_llm)
    
    async def extract_text(self, state: AgentState) -> AgentState:
        """Extract text from PDF."""
        try:
            pdf_bytes = state["agent_metadata"].get("pdf_bytes")
            
            if pdf_bytes:
                text = await pdf_extractor.extract_text(pdf_bytes)
                # print(f"PDF Extracted text is:{text}")

                state["agent_metadata"]["resume_text"] = text
            else:
                state["input"] = state["input"]  # Already has text
        except Exception as e:
            state["error"] = f"PDF extraction failed: {str(e)}"
        
        return state
    
    async def parse_resume(self, state: AgentState) -> AgentState:
        """Parse resume with LLM."""
        try:
            resume_text = state["agent_metadata"].get("resume_text", state["input"])
            
            system_prompt = """Extract structured data from resume in JSON format:
{
    "personal_info": {
        "name": "Full Name",
        "email": "email or null",
        "phone": "phone or null",
        "location": "location or null",
        "linkedin": "URL or null",
        "portfolio": "URL or null"
    },
    "summary": "professional summary",
    "experience": [
        {
            "title": "Job Title",
            "company": "Company",
            "location": "Location",
            "start_date": "YYYY-MM or null",
            "end_date": "YYYY-MM or 'Present'",
            "responsibilities": ["key responsibility 1", "key responsibility 2"]
        }
    ],
    "education": [
        {
            "degree": "Degree",
            "institution": "School",
            "graduation_year": "YYYY or null",
            "gpa": "GPA or null"
        }
    ],
    "skills": {
        "technical": ["skill1", "skill2"],
        "soft": ["skill1", "skill2"]
    },
    "certifications": ["cert1", "cert2"],
    "languages": ["language1", "language2"]
}"""

            
            user_prompt = f"Extract structured data from this resume:\n\n{resume_text}"
            print("RESUME TEXT SENT TO LLM (first 500 chars):")
            print(resume_text[:500])           
            response = await self.llm.generate_with_system(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.1,
                max_tokens=12000,
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
        workflow.add_node("extract", self.extract_text)
        workflow.add_node("parse", self.parse_resume)
        workflow.set_entry_point("extract")
        workflow.add_edge("extract", "parse")
        workflow.add_edge("parse", END)
        return workflow.compile()


resume_parser_agent = ResumeParserAgent()

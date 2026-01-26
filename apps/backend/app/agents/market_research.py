"""
Market Research Agent using SearchXNG.
"""
import json
from typing import Dict

import httpx
from langgraph.graph import END, StateGraph

from agents.base import AgentState, BaseAgent
from core.config import settings
from core.llm import groq_llm


class MarketResearchAgent(BaseAgent):
    """Agent for market research using SearchXNG."""
    
    def __init__(self):
        super().__init__(name="MarketResearchAgent", llm=groq_llm)
        self.searchxng_url = settings.SEARCHXNG_URL
    
    async def search_web(self, state: AgentState) -> AgentState:
        """Search web using SearchXNG."""
        try:
            job_data = json.loads(state["input"])
            search_query = f"{job_data.get('job_title')} job description salary requirements {job_data.get('location')}"
            
            if self.searchxng_url:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        self.searchxng_url,
                        params={"q": search_query, "format": "json"},
                        timeout=30.0
                    )
                    if response.status_code == 200:
                        results = response.json().get("results", [])[:5]
                    else:
                        results = []
            else:
                results = []
            
            state["agent_metadata"]["search_results"] = results
        except Exception as e:
            state["agent_metadata"]["search_results"] = []
        
        return state
    
    async def analyze_results(self, state: AgentState) -> AgentState:
        """Analyze search results with LLM."""
        try:
            search_results = state["agent_metadata"].get("search_results", [])
            job_data = json.loads(state["input"])
            
            results_text = "\n\n".join([
                f"Source {i+1}:\n{r.get('title', '')}\n{r.get('content', '')[:500]}"
                for i, r in enumerate(search_results)
            ]) if search_results else "No market data available."
            
            system_prompt = """You are a market research analyst. Analyze job market data and provide insights in JSON format:
{
    "salary_range": {"min": number, "max": number, "currency": "USD"},
    "key_skills": [skills],
    "responsibilities": [responsibilities],
    "qualifications": [qualifications],
    "benefits": [benefits],
    "market_insights": "brief overview"
}"""
            
            user_prompt = f"""Analyze for {job_data.get('job_title')} in {job_data.get('location')}:\n\n{results_text}"""
            
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
        workflow.add_node("search", self.search_web)
        workflow.add_node("analyze", self.analyze_results)
        workflow.set_entry_point("search")
        workflow.add_edge("search", "analyze")
        workflow.add_edge("analyze", END)
        return workflow.compile()


market_research_agent = MarketResearchAgent()

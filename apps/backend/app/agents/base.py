"""
Base agent structure using LangGraph.
"""
from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import END, StateGraph
from pydantic import BaseModel

from core.llm import GroqLLM, groq_llm


class AgentState(TypedDict):
    """Base state for all agents."""
    messages: List[Dict[str, str]]
    input: str
    output: Optional[str]
    agent_metadata: Dict[str, Any]
    error: Optional[str]


class AgentResult(BaseModel):
    """Result from agent execution with detailed token tracking."""
    success: bool
    output: Any
    input_tokens: int
    output_tokens: int
    total_tokens: int
    agent_metadata: Dict[str, Any]
    error: Optional[str] = None


class BaseAgent:
    """Base class for all LangGraph agents."""
    
    def __init__(self, name: str, llm: Optional[GroqLLM] = None):
        self.name = name
        self.llm = llm or groq_llm
        self.graph = None
    
    def create_graph(self) -> StateGraph:
        """Create LangGraph StateGraph. Override in subclasses."""
        raise NotImplementedError
    
    async def execute(self, input_data: str, metadata: Optional[Dict[str, Any]] = None) -> AgentResult:
        """Execute agent workflow."""
        try:
            if self.graph is None:
                self.graph = self.create_graph()
            
            initial_state = AgentState(
                messages=[],
                input=input_data,
                output=None,
                agent_metadata=metadata or {},
                error=None
            )
            
            final_state = await self.graph.ainvoke(initial_state)
            
            if final_state.get("error"):
                return AgentResult(
                    success=False,
                    output=None,
                    input_tokens=final_state.get("agent_metadata", {}).get("input_tokens", 0),
                    output_tokens=final_state.get("agent_metadata", {}).get("output_tokens", 0),
                    total_tokens=final_state.get("agent_metadata", {}).get("total_tokens", 0),
                    agent_metadata=final_state.get("agent_metadata", {}),
                    error=final_state["error"]
                )
            
            return AgentResult(
                success=True,
                output=final_state["output"],
                input_tokens=final_state.get("agent_metadata", {}).get("input_tokens", 0),
                output_tokens=final_state.get("agent_metadata", {}).get("output_tokens", 0),
                total_tokens=final_state.get("agent_metadata", {}).get("total_tokens", 0),
                agent_metadata=final_state.get("agent_metadata", {})
            )
        except Exception as e:
            return AgentResult(
                success=False,
                output=None,
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                agent_metadata={},
                error=str(e)
            )

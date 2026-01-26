"""
Groq LLM client for AI operations.
Uses llama-3.3-70b-versatile model (120B effective parameters).
"""
import json
from typing import Any, Dict, List, Optional

from groq import AsyncGroq
from pydantic import BaseModel

from core.config import settings


class LLMMessage(BaseModel):
    """Message format for LLM conversations."""
    role: str  # 'system', 'user', 'assistant'
    content: str


class LLMResponse(BaseModel):
    """Response from LLM with detailed token usage."""
    content: str
    input_tokens: int  # Prompt tokens
    output_tokens: int  # Completion tokens
    total_tokens: int  # Total tokens
    model: str


class GroqLLM:
    """
    Groq API client using official Groq Python SDK.
    """
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize Groq LLM client.
        
        Args:
            api_key: Groq API key
            model: Model name
        """
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.client = AsyncGroq(api_key=self.api_key)
    
    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        json_mode: bool = False
    ) -> LLMResponse:
        """
        Generate completion using Groq API.
        
        Args:
            messages: List of messages
            temperature: Sampling temperature
            max_tokens: Maximum tokens
            json_mode: Force JSON output
            
        Returns:
            LLMResponse
        """
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        
        response = await self.client.chat.completions.create(**kwargs)
        
        # Groq returns: prompt_tokens, completion_tokens, total_tokens
        usage = response.usage
        
        return LLMResponse(
            content=response.choices[0].message.content,
            input_tokens=usage.prompt_tokens,
            output_tokens=usage.completion_tokens,
            total_tokens=usage.total_tokens,
            model=response.model
        )
    
    async def generate_with_system(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        json_mode: bool = False
    ) -> LLMResponse:
        """
        Generate with system and user prompts.
        
        Args:
            system_prompt: System instruction
            user_prompt: User query
            temperature: Sampling temperature
            max_tokens: Maximum tokens
            json_mode: Force JSON output
            
        Returns:
            LLMResponse
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        return await self.generate(messages, temperature, max_tokens, json_mode)
    
    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        Generate JSON response.
        
        Args:
            system_prompt: System instruction
            user_prompt: User query
            temperature: Sampling temperature
            max_tokens: Maximum tokens
            
        Returns:
            Parsed JSON dictionary
        """
        response = await self.generate_with_system(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True
        )
        
        return json.loads(response.content)


# Global LLM instance
groq_llm = GroqLLM()

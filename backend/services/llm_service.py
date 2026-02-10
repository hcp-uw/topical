"""
LLM Service for generating summaries using Groq.
"""

import os
import httpx
import asyncio
from typing import Optional, List


class LLMService:
    """
    Service for interacting with Groq's LLM to generate summaries.
    """
    
    def __init__(self, model_name: str = "llama-3.1-8b-instant"):
        """
        Initialize LLM service
        
        Args:
            model_name: Name of the Groq model to use
        """
        self.model_name = model_name
        self.api_key = os.getenv("GROQ_API_KEY")
        self.api_base_url = "https://api.groq.com/openai/v1"
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable not set. Get free API key at https://console.groq.com")
    
    def get_model_name(self) -> str:
        """Get the current model name"""
        return self.model_name
    
    async def generate_summary(self, text: str, topic: Optional[str] = None, chunk_size: int = None) -> str:
        """
        Generate a summary of the given text.
        For long texts, automatically chunks and summarizes in parts.
        
        Args:
            text: The text to summarize
            topic: Optional topic/subject tag for context
            chunk_size: Maximum characters per chunk. 
                       If None, uses a sensible default for Groq.
                       If text is longer, it will be chunked.
            
        Returns:
            Generated summary string
        """
        # Default chunk size for Groq
        if chunk_size is None:
            chunk_size = 8000  # Groq is fast, can handle larger chunks
        
        # If text is too long, chunk it
        if len(text) > chunk_size:
            return await self._generate_summary_chunked(text, topic, chunk_size)
        
        # Otherwise, summarize normally
        return await self._generate_with_api(text, topic)
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int = 200) -> List[str]:
        """
        Split text into chunks with overlap to preserve context
        
        Args:
            text: Text to chunk
            chunk_size: Maximum size of each chunk
            overlap: Number of characters to overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings near the chunk boundary
                for i in range(end, max(start + chunk_size - 500, start), -1):
                    if text[i] in '.!?\n' and i < len(text) - 1:
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start forward, accounting for overlap
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks
    
    async def _generate_summary_chunked(self, text: str, topic: Optional[str] = None, chunk_size: int = 3000) -> str:
        """
        Generate summary by chunking long text, summarizing each chunk, then combining
        
        Args:
            text: Long text to summarize
            topic: Optional topic/subject tag
            chunk_size: Size of each chunk
            
        Returns:
            Combined summary
        """
        import logging
        logger = logging.getLogger("uvicorn")
        
        chunks = self._chunk_text(text, chunk_size)
        logger.info(f"Text chunked into {len(chunks)} parts")
        
        if len(chunks) == 0:
            return "No content to summarize."
        
        # Summarize each chunk with rate limit handling
        chunk_summaries = []
        for i, chunk in enumerate(chunks):
            try:
                logger.info(f"Processing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")
                
                # Add delay between chunks for rate limit prevention (Groq free tier)
                if i > 0:
                    # Groq free tier: 6000 tokens/min = 100 tokens/sec
                    # Each chunk uses ~2000-3000 tokens, so need ~20-30 seconds between chunks
                    delay = 15.0  # 15 second delay to stay under rate limit
                    logger.info(f"Waiting {delay}s to avoid Groq rate limits (free tier: 6000 tokens/min)...")
                    await asyncio.sleep(delay)
                
                # Retry logic for rate limits
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        summary = await self._generate_with_api(chunk, topic)
                        chunk_summaries.append(summary)
                        logger.info(f"Chunk {i+1} completed")
                        break  # Success, exit retry loop
                    except Exception as e:
                        error_str = str(e).lower()
                        # Check if it's a rate limit error
                        if "rate limit" in error_str or "429" in error_str:
                            if attempt < max_retries - 1:
                                wait_time = (attempt + 1) * 2  # Exponential backoff: 2s, 4s, 6s
                                logger.warning(f"Rate limit hit on chunk {i+1}, retrying in {wait_time}s...")
                                await asyncio.sleep(wait_time)
                                continue
                        # If not rate limit or out of retries, raise
                        raise
                        
            except Exception as e:
                logger.error(f"Chunk {i+1} failed after retries: {str(e)}")
                # If a chunk fails, continue with others
                chunk_summaries.append(f"[Chunk {i+1} summary unavailable: {str(e)}]")
        
        # Combine all chunk summaries
        combined_summaries = "\n\n".join(chunk_summaries)
        
        # If we have multiple chunks, create a final summary of the summaries
        if len(chunks) > 1:
            # Build a special prompt for combining summaries
            combined_text = (
                "Section Summaries from a longer document:\n\n"
                f"{combined_summaries}\n\n"
                "Please provide a unified summary that synthesizes all these sections."
            )
            
            try:
                final_summary = await self._generate_with_api(combined_text, topic)
                return final_summary
            except Exception:
                # If final summary fails, return combined summaries
                return f"Summary of {len(chunks)} sections:\n\n{combined_summaries}"
        
        return combined_summaries
    
    async def _generate_with_api(self, text: str, topic: Optional[str] = None) -> str:
        """
        Generate summary using Groq API
        """
        return await self._generate_with_openai_compatible(text, topic)
    
    async def _generate_with_openai_compatible(self, text: str, topic: Optional[str] = None) -> str:
        """Generate using Groq API (OpenAI-compatible)"""
        prompt = self._build_prompt(text, topic)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Groq model
        api_model = self.model_name  # Fast and free model configured at initialization
        
        # Longer timeout for Groq since it's fast but might need time for large requests
        timeout = 120.0
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.post(
                    f"{self.api_base_url}/chat/completions",
                    headers=headers,
                    json={
                        "model": api_model,
                        "messages": [
                            {"role": "system", "content": "You are a helpful assistant that summarizes academic papers and educational content."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 2000,
                        "temperature": 0.7
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
            except httpx.HTTPStatusError as e:
                error_text = e.response.text if hasattr(e.response, 'text') else str(e)
                # Check for rate limit (429)
                if e.response.status_code == 429:
                    raise Exception(f"Rate limit exceeded: {error_text}")
                raise Exception(f"Groq API error (status {e.response.status_code}): {error_text}")
    
    def _build_prompt(self, text: str, topic: Optional[str] = None) -> str:
        """Build the prompt for the LLM"""
        topic_context = f"Topic: {topic}\n\n" if topic else ""
        
        prompt = f"""Please provide a concise summary of the following educational content.

{topic_context}Content:
{text}

Please provide:
1. A brief headline summary (1-2 sentences)
2. A more detailed summary (3-5 bullet points or 2-3 paragraphs)

Summary:"""
        
        return prompt


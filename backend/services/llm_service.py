"""
LLM Service for generating summaries
Supports Ollama (free, local) and Groq (fast, free tier)

Changes from original:
- Switched default Groq model to llama-3.3-70b-versatile (much less hallucination)
- Lowered temperature to 0.2 for factual faithfulness
- Rewrote system prompt and user prompt to be strict about source-grounded summarization
- Added optional verification step to catch hallucinated claims
"""

import os
import httpx
import asyncio
import logging
from typing import Optional, List
from enum import Enum

logger = logging.getLogger("uvicorn")


class APIProvider(str, Enum):
    """Supported API providers"""
    OLLAMA = "ollama"
    GROQ = "groq"  # Recommended: Very fast, free tier (14,400 req/day)


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are an academic summarization assistant. Your ONLY job is to "
    "summarize the source text you are given. Follow these rules strictly:\n"
    "1. Include ONLY facts, claims, and findings that are explicitly stated "
    "in the provided text.\n"
    "2. NEVER add background knowledge, speculation, or information not "
    "present in the source.\n"
    "3. If something in the text is ambiguous or unclear, say so rather "
    "than guessing.\n"
    "4. Use simple, accessible language so a non-expert can understand.\n"
    "5. Preserve the meaning of the original — do not exaggerate or "
    "downplay results."
)

USER_PROMPT_TEMPLATE = """Summarize the following academic paper. Use ONLY information contained in the title and text below — do not add outside knowledge.

{topic_line}{title_line}Source text:
\"\"\"
{text}
\"\"\"

Respond in EXACTLY this format (keep the labels):

FRIENDLY_TITLE: [A short, catchy, plain-English title that a non-expert would understand — max 12 words]
HEADLINE: [One sentence capturing the main finding or contribution]
SUMMARY: [3-5 sentence summary covering key points, methods, and conclusions found in the text]"""

COMBINE_PROMPT_TEMPLATE = """Below are summaries of consecutive sections from a single document. Combine them into one coherent summary. Use ONLY information present in these section summaries — do not add outside knowledge.

{topic_line}{title_line}Section summaries:
\"\"\"
{combined_summaries}
\"\"\"

Respond in EXACTLY this format (keep the labels):

FRIENDLY_TITLE: [A short, catchy, plain-English title that a non-expert would understand — max 12 words]
HEADLINE: [One sentence capturing the main finding or contribution]
SUMMARY: [3-5 sentence summary that synthesizes all sections into a unified overview]"""

VERIFY_SYSTEM_PROMPT = (
    "You are a fact-checking assistant. Your job is to compare a summary "
    "against its source text and identify any claims in the summary that "
    "are NOT supported by the source."
)

VERIFY_USER_PROMPT_TEMPLATE = """Compare the following summary against its source text. List any claims in the summary that are NOT explicitly supported by the source. If all claims are supported, respond with exactly: "VERIFIED"

Source text:
\"\"\"
{source}
\"\"\"

Summary:
\"\"\"
{summary}
\"\"\"

Unsupported claims (or "VERIFIED"):"""


class LLMService:
    """
    Service for interacting with LLMs to generate summaries.
    Supports Ollama (local, free) and Groq (fast, free tier).
    """

    def __init__(self, model_name: str = "mistral", provider: str = "ollama"):
        """
        Initialize LLM service

        Args:
            model_name: Name of the model to use
            provider: API provider - "ollama" or "groq"
        """
        self.model_name = model_name
        self.provider = APIProvider(provider.lower())
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        # Whether to run a verification pass on each summary
        self.verify_summaries = os.getenv("TOPICAL_VERIFY_SUMMARIES", "0").lower() in ("1", "true", "yes")

        # Get API keys based on provider
        if self.provider == APIProvider.GROQ:
            self.api_key = os.getenv("GROQ_API_KEY")
            self.api_base_url = "https://api.groq.com/openai/v1"
            if not self.api_key:
                raise ValueError(
                    "GROQ_API_KEY environment variable not set. "
                    "Get free API key at https://console.groq.com"
                )
        else:  # OLLAMA
            self.api_key = None
            self.api_base_url = None

    def get_model_name(self) -> str:
        """Get the current model name"""
        return self.model_name

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    async def generate_summary(
        self,
        text: str,
        topic: Optional[str] = None,
        chunk_size: int = None,
        title: Optional[str] = None,
    ) -> dict:
        """
        Generate a summary of the given text.
        For long texts, automatically chunks and summarizes in parts.

        Args:
            text: The text to summarize
            topic: Optional topic/subject tag for context
            chunk_size: Maximum characters per chunk.
                       If None, uses smart defaults based on provider.
            title: Optional original paper title (included in prompt for context)

        Returns:
            dict with keys:
                - friendly_title: Plain-English title for non-experts
                - summary: The full summary text (headline + body)
            Falls back to a plain string wrapped in a dict if parsing fails.
        """
        # Smart chunk size based on provider
        if chunk_size is None:
            if self.provider == APIProvider.GROQ:
                chunk_size = 8000  # Groq is fast, can handle larger chunks
            else:
                chunk_size = 3000  # Default for Ollama

        # If text is too long, chunk it
        if len(text) > chunk_size:
            raw = await self._generate_summary_chunked(text, topic, chunk_size, title)
        else:
            raw = await self._summarize_single(text, topic, title)

        # Optional verification pass
        if self.verify_summaries:
            raw = await self._verify_and_fix(text, raw, topic)

        return self._parse_response(raw)

    # ------------------------------------------------------------------
    # Response parsing
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_response(raw: str) -> dict:
        """
        Parse the structured LLM response into a dict.

        Expected format from the LLM:
            FRIENDLY_TITLE: ...
            HEADLINE: ...
            SUMMARY: ...

        Returns:
            {
                "friendly_title": str,
                "summary": str   # headline + summary body combined
            }
        If parsing fails, returns the raw text as the summary with no
        friendly_title so callers can degrade gracefully.
        """
        import re

        friendly_title = ""
        headline = ""
        summary_body = ""

        # Try to extract each labeled section
        ft_match = re.search(r"FRIENDLY_TITLE:\s*(.+)", raw)
        hl_match = re.search(r"HEADLINE:\s*(.+)", raw)
        # SUMMARY may be multi-line — grab everything after the label
        sm_match = re.search(r"SUMMARY:\s*(.+)", raw, re.DOTALL)

        if ft_match:
            friendly_title = ft_match.group(1).strip().strip("[]")
        if hl_match:
            headline = hl_match.group(1).strip()
        if sm_match:
            summary_body = sm_match.group(1).strip()

        # Combine headline and body into one summary string
        if headline and summary_body:
            combined_summary = f"{headline}\n\n{summary_body}"
        elif summary_body:
            combined_summary = summary_body
        elif headline:
            combined_summary = headline
        else:
            # Parsing failed — return raw text
            combined_summary = raw

        return {
            "friendly_title": friendly_title,
            "summary": combined_summary,
        }

    # ------------------------------------------------------------------
    # Single-chunk summarization
    # ------------------------------------------------------------------

    async def _summarize_single(
        self, text: str, topic: Optional[str] = None, title: Optional[str] = None
    ) -> str:
        """Summarize a single chunk of text."""
        topic_line = f"Topic/category: {topic}\n\n" if topic else ""
        title_line = f"Original paper title: {title}\n\n" if title else ""
        user_prompt = USER_PROMPT_TEMPLATE.format(
            topic_line=topic_line, title_line=title_line, text=text
        )

        if self.provider == APIProvider.OLLAMA:
            return await self._generate_with_ollama(user_prompt)
        else:
            return await self._generate_with_groq(user_prompt)

    # ------------------------------------------------------------------
    # Chunked summarization
    # ------------------------------------------------------------------

    def _chunk_text(self, text: str, chunk_size: int, overlap: int = 200) -> List[str]:
        """
        Split text into chunks with overlap to preserve context.
        Tries to break at sentence boundaries.
        """
        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # Try to break at sentence boundary
            if end < len(text):
                for i in range(end, max(start + chunk_size - 500, start), -1):
                    if text[i] in ".!?\n" and i < len(text) - 1:
                        end = i + 1
                        break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap
            if start >= len(text):
                break

        return chunks

    async def _generate_summary_chunked(
        self,
        text: str,
        topic: Optional[str] = None,
        chunk_size: int = 3000,
        title: Optional[str] = None,
    ) -> str:
        """Chunk long text, summarize each chunk, then combine."""
        chunks = self._chunk_text(text, chunk_size)
        logger.info(f"Text chunked into {len(chunks)} parts")

        if len(chunks) == 0:
            return "No content to summarize."

        # Summarize each chunk — parse out just the summary text so
        # the combine prompt doesn't see competing FRIENDLY_TITLE/HEADLINE labels
        chunk_summaries = []
        for i, chunk in enumerate(chunks):
            try:
                logger.info(f"Processing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")

                if i > 0 and self.provider == APIProvider.GROQ:
                    delay = 15.0
                    logger.info(f"Waiting {delay}s for Groq rate limits...")
                    await asyncio.sleep(delay)

                raw = await self._summarize_with_retries(chunk, topic, title=title)
                parsed = self._parse_response(raw)
                chunk_summaries.append(parsed["summary"])
                logger.info(f"Chunk {i+1} completed")

            except Exception as e:
                logger.error(f"Chunk {i+1} failed after retries: {str(e)}")
                chunk_summaries.append(f"[Chunk {i+1} summary unavailable: {str(e)}]")

        combined_summaries = "\n\n".join(chunk_summaries)

        # If multiple chunks, create a final unified summary
        if len(chunks) > 1:
            try:
                topic_line = f"Topic/category: {topic}\n\n" if topic else ""
                title_line = f"Original paper title: {title}\n\n" if title else ""
                combine_prompt = COMBINE_PROMPT_TEMPLATE.format(
                    topic_line=topic_line,
                    title_line=title_line,
                    combined_summaries=combined_summaries,
                )

                if self.provider == APIProvider.OLLAMA:
                    return await self._generate_with_ollama(combine_prompt)
                else:
                    return await self._generate_with_groq(combine_prompt)

            except Exception:
                return f"Summary of {len(chunks)} sections:\n\n{combined_summaries}"

        return combined_summaries

    async def _summarize_with_retries(
        self,
        text: str,
        topic: Optional[str] = None,
        max_retries: int = 3,
        title: Optional[str] = None,
    ) -> str:
        """Summarize with retry logic for rate limits."""
        for attempt in range(max_retries):
            try:
                return await self._summarize_single(text, topic, title)
            except Exception as e:
                error_str = str(e).lower()
                if ("rate limit" in error_str or "429" in error_str) and attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.warning(f"Rate limit hit, retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
                raise

    # ------------------------------------------------------------------
    # Verification step (optional — enable with TOPICAL_VERIFY_SUMMARIES=1)
    # ------------------------------------------------------------------

    async def _verify_and_fix(
        self, source_text: str, summary: str, topic: Optional[str] = None
    ) -> str:
        """
        Run a second LLM call to check the summary against the source.
        If unsupported claims are found, regenerate with a stricter prompt.
        """
        try:
            verify_prompt = VERIFY_USER_PROMPT_TEMPLATE.format(
                source=source_text[:6000],  # cap to avoid token overflow
                summary=summary,
            )

            if self.provider == APIProvider.OLLAMA:
                result = await self._generate_with_ollama(
                    verify_prompt, system_prompt=VERIFY_SYSTEM_PROMPT
                )
            else:
                result = await self._generate_with_groq(
                    verify_prompt, system_prompt=VERIFY_SYSTEM_PROMPT
                )

            if "VERIFIED" in result.upper():
                logger.info("Summary verification passed")
                return summary

            # Found unsupported claims — regenerate with extra warning
            logger.warning(f"Verification flagged issues: {result[:200]}")
            stricter_text = (
                f"[IMPORTANT: A previous summary contained unsupported claims. "
                f"Be extra careful to ONLY state facts from the source.]\n\n{source_text}"
            )
            return await self._summarize_single(stricter_text, topic)

        except Exception as e:
            logger.warning(f"Verification step failed, returning original summary: {e}")
            return summary

    # ------------------------------------------------------------------
    # Provider-specific generation
    # ------------------------------------------------------------------

    async def _generate_with_ollama(
        self, user_prompt: str, system_prompt: str = SYSTEM_PROMPT
    ) -> str:
        """Generate using Ollama (local)."""
        # Ollama /api/generate uses a single prompt string
        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "num_predict": 2000,
                        },
                    },
                )
                response.raise_for_status()
                result = response.json()
                response_text = result.get("response", "").strip()
                if not response_text:
                    raise Exception("Ollama returned empty response.")
                return response_text
            except httpx.ConnectError:
                raise Exception(
                    f"Could not connect to Ollama at {self.ollama_base_url}. "
                    "Make sure Ollama is running. Install from https://ollama.ai"
                )
            except httpx.TimeoutException:
                raise Exception(
                    "Request to Ollama timed out after 300 seconds. "
                    "The text may be too long or the model is too slow."
                )
            except httpx.HTTPStatusError as e:
                error_text = e.response.text if hasattr(e.response, "text") else str(e)
                raise Exception(
                    f"Ollama API error (status {e.response.status_code}): {error_text}"
                )

    async def _generate_with_groq(
        self, user_prompt: str, system_prompt: str = SYSTEM_PROMPT
    ) -> str:
        """Generate using Groq API (OpenAI-compatible)."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    f"{self.api_base_url}/chat/completions",
                    headers=headers,
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "max_tokens": 2000,
                        "temperature": 0.2,
                    },
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
            except httpx.HTTPStatusError as e:
                error_text = e.response.text if hasattr(e.response, "text") else str(e)
                if e.response.status_code == 429:
                    raise Exception(f"Rate limit exceeded: {error_text}")
                raise Exception(
                    f"Groq API error (status {e.response.status_code}): {error_text}"
                )
"""
FastAPI backend for Topical - Academic Paper Summarization App
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Union
from dotenv import load_dotenv

from services.llm_service import LLMService
from services.file_reader import FileReaderService

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Topical API", version="1.0.0")

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React Native app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
# Change provider to use different APIs:
# - "ollama" (default, local, free)
# - "groq" (recommended: very fast, free tier 14,400 req/day)
# - "gemini" (Google, free tier: 15 RPM, 1500 RPD)
# - "huggingface" (free tier available)
# - "together" (free credits)
# - "openai" (paid)

provider = os.getenv("LLM_PROVIDER", "groq")
llm_service = LLMService(provider=provider)
file_reader = FileReaderService()


class SummaryRequest(BaseModel):
    text: str
    topic: Optional[str] = None


class ImageInfo(BaseModel):
    data: str  # base64 data URI
    format: str  # image format (png, jpeg, etc.)
    page: int  # page number (1-indexed)
    index: int  # image index on the page

class SummaryResponse(BaseModel):
    summary: str
    model: str
    images: Optional[List[ImageInfo]] = None


class FileSummaryRequest(BaseModel):
    filename: str
    topic: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "Topical API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/generate-summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Accepts scraped educational text and returns an LLM-generated summary
    
    Status Codes:
    - 200: Summary generated successfully
    - 400: Invalid or missing input text
    - 500: Internal server error (model or backend issues)
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Invalid or missing input text")
    
    try:
        summary = await llm_service.generate_summary(request.text, request.topic)
        model_name = llm_service.get_model_name()
        return SummaryResponse(summary=summary, model=model_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/summarize-file", response_model=SummaryResponse)
async def summarize_file(request: FileSummaryRequest):
    """
    Reads a text file or PDF from the data directory and generates a summary.
    For PDF files, also extracts and returns images/graphs.
    """
    import logging
    logger = logging.getLogger("uvicorn")
    
    try:
        file_path = file_reader.get_data_dir_path() / request.filename
        logger.info(f"Processing file: {request.filename}")
        
        # Check if it's a PDF file
        if file_path.suffix.lower() == ".pdf":
            logger.info("PDF detected, extracting text and images...")
            # Read PDF with images
            try:
                text, images = file_reader.read_pdf_with_images(request.filename)
                logger.info(f"PDF extracted: {len(text)} characters, {len(images)} images")
            except ImportError as e:
                raise HTTPException(
                    status_code=500, 
                    detail=f"PDF processing libraries not installed: {str(e)}. Please run: pip install -r requirements.txt"
                )
            
            if not text:
                raise HTTPException(status_code=404, detail=f"PDF '{request.filename}' is empty or could not be read")
            
            logger.info(f"Generating summary with {llm_service.provider.value}...")
            summary = await llm_service.generate_summary(text, request.topic)
            model_name = llm_service.get_model_name()
            logger.info(f"Summary generated: {len(summary)} characters")
            return SummaryResponse(summary=summary, model=model_name, images=images if images else [])
        else:
            # Read regular text file
            text = file_reader.read_file(request.filename)
            if not text:
                raise HTTPException(status_code=404, detail=f"File '{request.filename}' not found or empty")
            
            summary = await llm_service.generate_summary(text, request.topic)
            model_name = llm_service.get_model_name()
            return SummaryResponse(summary=summary, model=model_name, images=None)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File '{request.filename}' not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        import traceback
        # Include traceback for debugging, but keep main message clear
        error_msg = str(e)
        if "No module named" in error_msg or "cannot import" in error_msg.lower():
            error_msg = f"Missing required library: {error_msg}. Please install dependencies with: pip install -r requirements.txt"
        raise HTTPException(status_code=500, detail=f"Internal server error: {error_msg}")


@app.get("/api/list-files")
async def list_files():
    """List all available text and PDF files in the data directory"""
    try:
        files = file_reader.list_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


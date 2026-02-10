"""
FastAPI backend for Topical - Academic Paper Summarization App
"""

import os
import sys
import random
import datetime
import re
from pathlib import Path
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Union

from services.llm_service import LLMService
from services.file_reader import FileReaderService

# Add web_scraper to Python path
backend_dir = Path(__file__).parent
scraper_path = backend_dir / "services" / "web_scraper"
if str(scraper_path) not in sys.path:
    sys.path.insert(0, str(scraper_path))

# Import scraper
try:
    from scraper import ArxivScraper
    SCRAPER_AVAILABLE = True
except ImportError:
    ArxivScraper = None
    SCRAPER_AVAILABLE = False

app = FastAPI(title="Topical API", version="1.0.0")

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React Native app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (Groq only)
llm_service = LLMService()
file_reader = FileReaderService()

# Initialize scraper if available
scraper = None
if SCRAPER_AVAILABLE:
    scraper = ArxivScraper()
    # Set geckodriver path
    geckodriver_path = scraper_path / "geckodriver.exe"
    if geckodriver_path.exists():
        current_path = os.environ.get("PATH", "")
        if str(scraper_path) not in current_path:
            os.environ["PATH"] = str(scraper_path) + os.pathsep + current_path


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


class FetchArticlesRequest(BaseModel):
    subject: str = "cs"  # arXiv subject category
    year: Optional[int] = None
    month: Optional[int] = None
    max_papers: int = 10
    download_pdfs: bool = True


class RandomArticleResponse(BaseModel):
    filename: str
    summary: str
    model: str
    images: Optional[List[ImageInfo]] = None


def _extract_abstract(text: str, max_chars: int = 4000) -> str:
    """
    Heuristically extract the abstract section from a paper's full text.
    Falls back to the first part of the document if no explicit abstract is found.
    """
    if not text:
        return text

    # Normalize newlines
    normalized = text.replace("\r\n", "\n")

    # Try to find 'Abstract' header near the beginning
    abstract_pattern = re.compile(r"\babstract\b[:.]?\s*", re.IGNORECASE)
    match = abstract_pattern.search(normalized)

    if match and match.start() < len(normalized) * 0.3:
        start_idx = match.end()
    else:
        # Fallback: start from the beginning
        start_idx = 0

    following = normalized[start_idx:]

    # Look for common section headers that typically follow the abstract
    end_pattern = re.compile(
        r"\n\s*(?:keywords?|index terms|1\.?\s+introduction|i\.?\s+introduction)\b",
        re.IGNORECASE,
    )
    end_match = end_pattern.search(following)

    if end_match:
        end_idx = start_idx + end_match.start()
    else:
        end_idx = min(len(normalized), start_idx + max_chars)

    abstract_text = normalized[start_idx:end_idx].strip()

    # If the extracted region is suspiciously short, fall back to the start of the document
    if len(abstract_text) < 200:
        abstract_text = normalized[:max_chars].strip()

    return abstract_text


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
            
            # Only summarize the abstract portion of the paper
            abstract_text = _extract_abstract(text)
            logger.info(f"Using abstract-only text for summary ({len(abstract_text)} characters)...")
            
            summary = await llm_service.generate_summary(abstract_text, request.topic)
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


@app.post("/api/fetch-articles")
async def fetch_articles(request: FetchArticlesRequest):
    """
    Fetch articles from arXiv using the web scraper and optionally download PDFs.
    This may take several minutes depending on max_papers.
    """
    import logging
    logger = logging.getLogger("uvicorn")
    
    if not SCRAPER_AVAILABLE or not scraper:
        raise HTTPException(
            status_code=500,
            detail="Scraper not available. Make sure selenium is installed: pip install -r requirements.txt"
        )
    
    try:
        # Set year/month defaults
        year = request.year if request.year else datetime.datetime.now().year
        month = request.month if request.month else datetime.datetime.now().month
        
        logger.info(f"Fetching articles: subject={request.subject}, year={year}, month={month}, max_papers={request.max_papers}")
        
        # Run scraper (this is synchronous, so we run it in a thread pool)
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        def _fetch_articles():
            # Initialize driver if needed
            if scraper.driver is None:
                scraper.init_driver()
            
            # Scrape PDF links (pass max_papers to stop early)
            pdf_links = scraper.scrape_monthly_arxiv(request.subject, year, month, max_papers=request.max_papers)
            
            downloaded_files = []
            
            if request.download_pdfs and pdf_links:
                # Download PDFs to data directory
                data_dir = str(file_reader.get_data_dir_path())
                successful, failed = scraper.download_all_pdfs(pdf_links, data_dir, delay=1)
                
                # Get list of downloaded filenames
                for link in pdf_links:
                    parsed_url = urlparse(link)
                    filename = os.path.basename(parsed_url.path)
                    if not filename.endswith('.pdf'):
                        filename += '.pdf'
                    filepath = file_reader.get_data_dir_path() / filename
                    if filepath.exists():
                        downloaded_files.append(filename)
            
            # Clean up driver
            scraper.quit_driver()
            
            return {
                "status": "success",
                "total_found": len(pdf_links),
                "downloaded": len(downloaded_files),
                "files": downloaded_files,
                "links": pdf_links[:10]  # Return first 10 links as sample
            }
        
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            result = await loop.run_in_executor(executor, _fetch_articles)
        
        return result
        
    except Exception as e:
        # Make sure to clean up driver on error
        if scraper and scraper.driver:
            try:
                scraper.quit_driver()
            except:
                pass
        logger.error(f"Error fetching articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching articles: {str(e)}")


@app.get("/api/random-article", response_model=RandomArticleResponse)
async def get_random_article(topic: Optional[str] = None):
    """
    Get a random article from the data directory with its summary.
    Returns a random PDF file with pre-generated summary.
    """
    import logging
    logger = logging.getLogger("uvicorn")
    
    try:
        # Get random article filename from data directory
        data_dir = file_reader.get_data_dir_path()
        pdf_files = list(data_dir.glob("*.pdf"))
        
        if not pdf_files:
            raise HTTPException(
                status_code=404,
                detail="No articles found. Please fetch articles first using /api/fetch-articles"
            )
        
        # Pick a random file
        random_file = random.choice(pdf_files)
        filename = random_file.name
        
        
        logger.info(f"Getting random article: {filename}")
        
        # Read the file and generate summary
        file_path = file_reader.get_data_dir_path() / filename
        
        # Check if it's a PDF
        if file_path.suffix.lower() == ".pdf":
            try:
                text, images = file_reader.read_pdf_with_images(filename)
                logger.info(f"PDF extracted: {len(text)} characters, {len(images)} images")
            except ImportError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"PDF processing libraries not installed: {str(e)}. Please run: pip install -r requirements.txt"
                )
            
            if not text:
                raise HTTPException(status_code=404, detail=f"PDF '{filename}' is empty or could not be read")
            
            # Generate summary using only the abstract portion of the paper
            abstract_text = _extract_abstract(text)
            logger.info(f"Using abstract-only text for summary ({len(abstract_text)} characters)...")
            
            summary = await llm_service.generate_summary(abstract_text, topic)
            model_name = llm_service.get_model_name()
            
            return RandomArticleResponse(
                filename=filename,
                summary=summary,
                model=model_name,
                images=images if images else []
            )
        else:
            # Regular text file
            text = file_reader.read_file(filename)
            if not text:
                raise HTTPException(status_code=404, detail=f"File '{filename}' not found or empty")
            
            summary = await llm_service.generate_summary(text, topic)
            model_name = llm_service.get_model_name()
            
            return RandomArticleResponse(
                filename=filename,
                summary=summary,
                model=model_name,
                images=None
            )
            
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Article file not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting random article: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting random article: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


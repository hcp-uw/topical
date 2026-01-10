"""
Test script to measure PDF processing and summarization times
"""

import time
import asyncio
from pathlib import Path
from services.file_reader import FileReaderService
from services.llm_service import LLMService
import fitz

def analyze_pdf(filename: str):
    """Analyze PDF file characteristics"""
    file_reader = FileReaderService()
    file_path = file_reader.get_data_dir_path() / filename
    
    print(f"Analyzing PDF: {filename}")
    print("=" * 60)
    
    # Get file size
    file_size_mb = file_path.stat().st_size / (1024 * 1024)
    print(f"File size: {file_size_mb:.2f} MB")
    
    # Get page count and basic info
    doc = fitz.open(str(file_path))
    print(f"Number of pages: {len(doc)}")
    doc.close()
    
    # Extract text and measure time
    print("\n1. Text Extraction:")
    start = time.time()
    text = file_reader.read_file(filename)
    text_time = time.time() - start
    print(f"   Time: {text_time:.2f} seconds")
    print(f"   Text length: {len(text):,} characters")
    print(f"   Text length: {len(text.split()):,} words")
    print(f"   Estimated tokens: ~{len(text.split()) * 1.3:.0f} tokens (rough estimate)")
    
    # Extract images and measure time
    print("\n2. Image Extraction:")
    start = time.time()
    images = file_reader.extract_pdf_images(filename)
    image_time = time.time() - start
    print(f"   Time: {image_time:.2f} seconds")
    print(f"   Images found: {len(images)}")
    if images:
        total_image_size = sum(len(img['data']) for img in images)
        print(f"   Total image data size: {total_image_size / 1024:.2f} KB (base64 encoded)")
    
    total_extraction_time = text_time + image_time
    print(f"\n   Total extraction time: {total_extraction_time:.2f} seconds")
    
    return text, images, text_time, image_time

async def test_summarization(text: str, model_name: str = "mistral"):
    """Test summarization with different models"""
    print(f"\n3. Summarization with {model_name}:")
    print("-" * 60)
    
    llm_service = LLMService(model_name=model_name)
    
    # Warm-up (first call is often slower)
    print("   Warming up (first call may be slower)...")
    try:
        start = time.time()
        summary = await llm_service.generate_summary(text[:1000], None)  # Small test
        warmup_time = time.time() - start
        print(f"   Warm-up time: {warmup_time:.2f} seconds")
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e) if str(e) else "No error message available"
        print(f"   Warm-up failed:")
        print(f"   Error type: {error_type}")
        print(f"   Error message: {error_msg}")
        # Don't return None here - continue to try full summarization anyway
    
    # Actual summarization
    print(f"   Summarizing full PDF text ({len(text):,} chars)...")
    start = time.time()
    try:
        summary = await llm_service.generate_summary(text, None)
        summary_time = time.time() - start
        print(f"   Time: {summary_time:.2f} seconds")
        print(f"   Summary length: {len(summary):,} characters")
        print(f"   Summary preview (first 200 chars):")
        print(f"   {summary[:200]}...")
        return summary, summary_time
    except Exception as e:
        elapsed = time.time() - start
        error_type = type(e).__name__
        error_msg = str(e) if str(e) else "No error message available"
        print(f"   Error after {elapsed:.2f} seconds:")
        print(f"   Error type: {error_type}")
        print(f"   Error message: {error_msg}")
        import traceback
        print(f"   Full traceback:")
        traceback.print_exc()
        return None, None

async def run_full_test(filename: str, model_name: str = "mistral"):
    """Run complete timing test"""
    print("\n" + "=" * 60)
    print("PDF PROCESSING TIMING TEST")
    print("=" * 60 + "\n")
    
    # Step 1: Analyze and extract
    text, images, text_time, image_time = analyze_pdf(filename)
    
    # Step 2: Summarize
    summary, summary_time = await test_summarization(text, model_name)
    
    # Summary
    print("\n" + "=" * 60)
    print("TIMING SUMMARY")
    print("=" * 60)
    print(f"Text extraction:     {text_time:6.2f} seconds")
    print(f"Image extraction:    {image_time:6.2f} seconds")
    if summary_time:
        print(f"Summarization:       {summary_time:6.2f} seconds")
        total_time = text_time + image_time + summary_time
        print(f"TOTAL TIME:          {total_time:6.2f} seconds ({total_time/60:.2f} minutes)")
    else:
        total_time = text_time + image_time
        print(f"TOTAL (no summary):  {total_time:6.2f} seconds")
    
    print("\nBreakdown:")
    if summary_time:
        print(f"  - Extraction: {((text_time + image_time) / total_time * 100):.1f}%")
        print(f"  - Summarization: {(summary_time / total_time * 100):.1f}%")
    
    return {
        'text_time': text_time,
        'image_time': image_time,
        'summary_time': summary_time,
        'total_time': total_time if summary_time else text_time + image_time
    }

async def compare_models(filename: str, models: list):
    """Compare multiple models"""
    print("\n" + "=" * 60)
    print("MODEL COMPARISON")
    print("=" * 60 + "\n")
    
    # Extract text once
    file_reader = FileReaderService()
    text = file_reader.read_file(filename)
    
    results = {}
    for model in models:
        print(f"\nTesting {model}...")
        try:
            summary, summary_time = await test_summarization(text, model)
            if summary_time:
                results[model] = summary_time
                print(f"✓ {model}: {summary_time:.2f} seconds")
            else:
                print(f"✗ {model}: Failed")
        except Exception as e:
            print(f"✗ {model}: Error - {e}")
    
    if results:
        print("\n" + "=" * 60)
        print("SPEED COMPARISON")
        print("=" * 60)
        sorted_results = sorted(results.items(), key=lambda x: x[1])
        fastest = sorted_results[0]
        for model, time_taken in sorted_results:
            speedup = time_taken / fastest[1] if fastest[1] > 0 else 1
            marker = "🏆" if model == fastest[0] else "  "
            print(f"{marker} {model:20s}: {time_taken:6.2f}s ({speedup:.2f}x)")

if __name__ == "__main__":
    import sys
    
    filename = "lecture22.pdf"
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    
    # Single model test
    model = "mistral"
    if len(sys.argv) > 2:
        model = sys.argv[2]
    
    print(f"Testing with: {filename}")
    print(f"Model: {model}\n")
    
    # Run test
    asyncio.run(run_full_test(filename, model))
    
    # Optional: Compare multiple models
    if len(sys.argv) > 3 and sys.argv[3] == "--compare":
        models_to_test = ["mistral", "llama3.2:3b", "phi3:mini"]
        print("\n" + "=" * 60)
        print("Would you like to compare models?")
        print("Run: python test_timing.py lecture22.pdf mistral --compare")
        print("Or test individually by changing the model name")


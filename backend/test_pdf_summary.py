"""
Test PDF summarization step by step to find where it hangs
"""

import asyncio
import time
from services.file_reader import FileReaderService
from services.llm_service import LLMService

async def test_pdf_summary():
    print("="*60)
    print("PDF SUMMARY TEST")
    print("="*60)
    
    file_reader = FileReaderService()
    llm_service = LLMService(provider="groq")
    
    filename = "lecture22.pdf"
    
    # Step 1: Extract text
    print("\n1. Extracting PDF text...")
    start = time.time()
    try:
        text, images = file_reader.read_pdf_with_images(filename)
        elapsed = time.time() - start
        print(f"   [OK] Extracted {len(text)} characters, {len(images)} images in {elapsed:.2f}s")
    except Exception as e:
        print(f"   [ERROR] {e}")
        return
    
    # Step 2: Test summarization with first 1000 chars
    print("\n2. Testing summarization with first 1000 chars...")
    start = time.time()
    try:
        summary = await llm_service.generate_summary(text[:1000], None)
        elapsed = time.time() - start
        print(f"   [OK] Summary generated in {elapsed:.2f}s")
        print(f"   Summary preview: {summary[:100]}...")
    except Exception as e:
        print(f"   [ERROR] {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Step 3: Test full PDF
    print(f"\n3. Testing full PDF summarization ({len(text)} chars)...")
    print("   This may take 30-60 seconds...")
    start = time.time()
    try:
        summary = await llm_service.generate_summary(text, None)
        elapsed = time.time() - start
        print(f"   [OK] Full summary generated in {elapsed:.2f}s")
        print(f"   Summary length: {len(summary)} characters")
        print(f"\n   Summary preview:")
        print(f"   {summary[:300]}...")
    except Exception as e:
        elapsed = time.time() - start
        print(f"   [ERROR] Failed after {elapsed:.2f}s: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_pdf_summary())


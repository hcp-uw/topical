"""
Quick test script to diagnose PDF processing issues
Run this to check if PDF libraries are installed and working
"""

import sys
from pathlib import Path

print("Checking PDF dependencies...\n")

# Check PyMuPDF
try:
    import fitz
    print("[OK] PyMuPDF (fitz) is installed")
    print(f"  Version: {fitz.version}")
except ImportError as e:
    print("[FAIL] PyMuPDF (fitz) is NOT installed")
    print(f"  Error: {e}")
    print("  Install with: pip install PyMuPDF")

# Check pdfplumber
try:
    import pdfplumber
    print("[OK] pdfplumber is installed")
except ImportError as e:
    print("[FAIL] pdfplumber is NOT installed")
    print(f"  Error: {e}")
    print("  Install with: pip install pdfplumber")

# Check Pillow
try:
    from PIL import Image
    print("[OK] Pillow (PIL) is installed")
except ImportError as e:
    print("[FAIL] Pillow (PIL) is NOT installed")
    print(f"  Error: {e}")
    print("  Install with: pip install Pillow")

print("\n" + "="*50)
print("Testing file_reader service...\n")

try:
    from services.file_reader import FileReaderService
    
    file_reader = FileReaderService()
    data_dir = file_reader.get_data_dir_path()
    print(f"Data directory: {data_dir}")
    print(f"Data directory exists: {data_dir.exists()}")
    
    if data_dir.exists():
        pdf_files = [f for f in data_dir.iterdir() if f.suffix.lower() == ".pdf"]
        print(f"\nPDF files found: {len(pdf_files)}")
        for pdf_file in pdf_files:
            print(f"  - {pdf_file.name}")
            
            # Try to read it
            try:
                print(f"    Attempting to read text...")
                text = file_reader.read_file(pdf_file.name)
                print(f"    [OK] Text extracted: {len(text)} characters")
                
                print(f"    Attempting to extract images...")
                images = file_reader.extract_pdf_images(pdf_file.name)
                print(f"    [OK] Images extracted: {len(images)} images")
                for img in images:
                    print(f"      - Page {img['page']}, Format: {img['format']}")
            except Exception as e:
                print(f"    [ERROR] Error: {e}")
                import traceback
                traceback.print_exc()
    else:
        print("Data directory does not exist!")
        
except Exception as e:
    print(f"[ERROR] Error importing or using FileReaderService: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50)
print("Test complete!")


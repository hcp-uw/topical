"""
Test the API endpoint with a PDF file
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_pdf_summary():
    """Test PDF file summarization"""
    print("Testing PDF file summarization...")
    print(f"URL: {BASE_URL}/api/summarize-file")
    
    # Test with the PDF file we found
    response = requests.post(
        f"{BASE_URL}/api/summarize-file",
        json={"filename": "lecture22.pdf", "topic": "Computer Science"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n[SUCCESS]")
        print(f"Model: {result.get('model')}")
        print(f"Summary length: {len(result.get('summary', ''))} characters")
        print(f"Images found: {len(result.get('images', []))}")
        if result.get('images'):
            for img in result['images']:
                print(f"  - Page {img.get('page')}, Format: {img.get('format')}")
        print(f"\nSummary preview (first 500 chars):")
        print(result.get('summary', '')[:500])
    else:
        print(f"\n[ERROR] Status {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Error text: {response.text}")

if __name__ == "__main__":
    try:
        test_pdf_summary()
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to the API server.")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()


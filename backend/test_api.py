#!/usr/bin/env python3
"""
Quick test script for the Topical API
Run this after starting the server to test the endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_list_files():
    """Test list files endpoint"""
    print("Testing list files...")
    response = requests.get(f"{BASE_URL}/api/list-files")
    print(f"Status: {response.status_code}")
    print(f"Files: {response.json()}\n")

def test_summarize_file():
    """Test file summarization"""
    print("Testing file summarization...")
    response = requests.post(
        f"{BASE_URL}/api/summarize-file",
        json={"filename": "sample_paper.txt", "topic": "Machine Learning"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Model: {result['model']}")
        print(f"Summary:\n{result['summary']}\n")
    else:
        print(f"Error: {response.text}\n")

def test_generate_summary():
    """Test direct text summarization"""
    print("Testing direct text summarization...")
    sample_text = """
    Artificial intelligence is transforming many industries. 
    In healthcare, AI can help diagnose diseases, predict patient outcomes, 
    and personalize treatment plans. The technology shows great promise 
    but requires careful validation and ethical considerations.
    """
    response = requests.post(
        f"{BASE_URL}/api/generate-summary",
        json={"text": sample_text, "topic": "AI in Healthcare"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Model: {result['model']}")
        print(f"Summary:\n{result['summary']}\n")
    else:
        print(f"Error: {response.text}\n")

if __name__ == "__main__":
    print("=" * 50)
    print("Topical API Test Script")
    print("=" * 50)
    print()
    
    try:
        test_health()
        test_list_files()
        test_summarize_file()
        test_generate_summary()
        print("All tests completed!")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API.")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"Error: {e}")


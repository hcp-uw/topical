"""
Quick check to see if the server has the Groq API key
"""

import os
import requests

print("Checking server configuration...")
print("="*60)

# Check environment variable
api_key = os.getenv("GROQ_API_KEY")
if api_key:
    print(f"[OK] GROQ_API_KEY is set: {api_key[:10]}...{api_key[-10:]}")
else:
    print("[ERROR] GROQ_API_KEY is NOT set in this environment")
    print("\nTo fix:")
    print("1. Stop the server (Ctrl+C)")
    print("2. Set the environment variable:")
    print('   $env:GROQ_API_KEY="your-key-here"')
    print("3. Start the server again:")
    print("   python main.py")

# Test the server
print("\n" + "="*60)
print("Testing server endpoint...")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        print("[OK] Server is running")
    else:
        print(f"[ERROR] Server returned status {response.status_code}")
except Exception as e:
    print(f"[ERROR] Cannot connect to server: {e}")
    print("Make sure the server is running: python main.py")

print("\n" + "="*60)
print("To test the API directly, run:")
print("  python test_groq.py")


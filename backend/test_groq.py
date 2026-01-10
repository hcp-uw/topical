"""
Quick test to verify Groq API is working
"""

import os
import asyncio
import httpx

async def test_groq_api():
    """Test Groq API connection"""
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("[ERROR] GROQ_API_KEY environment variable not set!")
        print("\nTo set it in PowerShell:")
        print('  $env:GROQ_API_KEY="your-api-key-here"')
        return False
    
    print(f"[OK] API Key found: {api_key[:10]}...{api_key[-10:]}")
    print("\nTesting Groq API connection...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Say 'Hello, Groq is working!' in one sentence."}
                    ],
                    "max_tokens": 50,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                message = result["choices"][0]["message"]["content"]
                print(f"\n[SUCCESS] Groq API is working!")
                print(f"Response: {message}")
                print(f"\n[OK] API Key is valid")
                print(f"[OK] Connection successful")
                print(f"[OK] Model responding correctly")
                return True
            else:
                print(f"\n[ERROR] API returned status code {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except httpx.ConnectError:
        print("\n[ERROR] Could not connect to Groq API")
        print("Check your internet connection")
        return False
    except httpx.TimeoutException:
        print("\n[ERROR] Request timed out")
        return False
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        return False

async def test_llm_service():
    """Test the LLMService with Groq"""
    print("\n" + "="*60)
    print("Testing LLMService with Groq...")
    print("="*60)
    
    try:
        from services.llm_service import LLMService
        
        llm_service = LLMService(provider="groq")
        print("[OK] LLMService initialized with Groq")
        
        test_text = "Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed."
        print(f"\nTesting summarization with sample text...")
        
        summary = await llm_service.generate_summary(test_text, "Computer Science")
        print(f"\n[SUCCESS] Summary generated:")
        print(f"{summary}")
        return True
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*60)
    print("GROQ API TEST")
    print("="*60)
    
    # Test 1: Direct API test
    result1 = asyncio.run(test_groq_api())
    
    if result1:
        # Test 2: LLMService test
        result2 = asyncio.run(test_llm_service())
        
        if result2:
            print("\n" + "="*60)
            print("[SUCCESS] ALL TESTS PASSED!")
            print("="*60)
            print("\nYour Groq API is set up correctly!")
            print("You can now run your server with:")
            print("  python main.py")
        else:
            print("\n[WARNING] API works but LLMService has issues")
    else:
        print("\n[ERROR] API test failed. Please check your API key.")


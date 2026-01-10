# API Setup Guide - Free/Cheap LLM Providers

This guide shows you how to set up free or cheap LLM APIs for your Topical app.

## 🏆 Recommended: Groq (Best for Speed & Free Tier)

**Why Groq?**
- ⚡ **Extremely fast** (10-100x faster than Ollama)
- 🆓 **Generous free tier**: 14,400 requests per day
- 💰 **Free forever** for reasonable usage
- ✅ **Perfect for mobile apps** - low latency

### Setup Steps:

1. **Get API Key**:
   - Go to https://console.groq.com
   - Sign up (free)
   - Create an API key
   - Copy your API key

2. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:GROQ_API_KEY="your-api-key-here"
   
   # Windows CMD
   set GROQ_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GROQ_API_KEY=your-api-key-here
   ```

3. **Update main.py** (or set environment variable):
   ```python
   # In main.py, change:
   provider = os.getenv("LLM_PROVIDER", "groq")  # Changed from "ollama"
   ```

4. **Restart your server**:
   ```bash
   python main.py
   ```

**Cost**: FREE (14,400 requests/day)

---

## Option 2: Google Gemini (Good Free Tier)

**Why Gemini?**
- 🆓 **Free tier**: 15 requests/minute, 1,500 requests/day
- 🚀 **Fast and reliable**
- 📚 **Good for academic content**

### Setup Steps:

1. **Get API Key**:
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key
   - Copy your API key

2. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:GEMINI_API_KEY="your-api-key-here"
   
   # Windows CMD
   set GEMINI_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GEMINI_API_KEY=your-api-key-here
   ```

3. **Update main.py**:
   ```python
   provider = os.getenv("LLM_PROVIDER", "gemini")
   ```

**Cost**: FREE (1,500 requests/day)

---

## Option 3: Hugging Face (Free Tier)

**Why Hugging Face?**
- 🆓 **Free tier available**
- 🤗 **Open source models**
- 📊 **Many model options**

### Setup Steps:

1. **Get API Token**:
   - Go to https://huggingface.co
   - Sign up (free)
   - Go to https://huggingface.co/settings/tokens
   - Create a token
   - Copy your token

2. **Set Environment Variable**:
   ```bash
   $env:HUGGINGFACE_API_KEY="your-token-here"
   ```

3. **Update main.py**:
   ```python
   provider = os.getenv("LLM_PROVIDER", "huggingface")
   ```

**Cost**: FREE (with rate limits)

---

## Option 4: Together AI (Free Credits)

**Why Together AI?**
- 🎁 **Free credits** for new users
- 🚀 **Fast inference**
- 💰 **Pay-as-you-go** after free credits

### Setup Steps:

1. **Get API Key**:
   - Go to https://together.ai
   - Sign up
   - Get free credits
   - Create API key

2. **Set Environment Variable**:
   ```bash
   $env:TOGETHER_API_KEY="your-api-key-here"
   ```

3. **Update main.py**:
   ```python
   provider = os.getenv("LLM_PROVIDER", "together")
   ```

**Cost**: FREE credits, then pay-as-you-go

---

## Comparison Table

| Provider | Free Tier | Speed | Best For |
|----------|-----------|-------|----------|
| **Groq** ⭐ | 14,400 req/day | ⚡⚡⚡ Very Fast | Mobile apps, production |
| **Gemini** | 1,500 req/day | ⚡⚡ Fast | General use |
| **HuggingFace** | Rate limited | ⚡ Medium | Experimentation |
| **Together AI** | Free credits | ⚡⚡ Fast | Testing, then paid |
| **Ollama** | Unlimited (local) | ⚡ Slow | Development only |

---

## Quick Start (Groq - Recommended)

```bash
# 1. Get API key from https://console.groq.com
# 2. Set environment variable
$env:GROQ_API_KEY="your-key-here"

# 3. Update main.py to use groq
# Change: provider = os.getenv("LLM_PROVIDER", "groq")

# 4. Run server
python main.py
```

That's it! Your API will now use Groq instead of Ollama.

---

## Testing

After setting up, test with:
```bash
python test_timing.py lecture22.pdf
```

You should see much faster response times (seconds instead of minutes)!

---

## Troubleshooting

**Error: "API key not set"**
- Make sure you set the environment variable before running the server
- Check that the variable name matches exactly (e.g., `GROQ_API_KEY`)

**Error: "Rate limit exceeded"**
- You've hit the free tier limit
- Wait for the limit to reset (usually daily)
- Or switch to a different provider

**Still using Ollama?**
- Check that `LLM_PROVIDER` environment variable is set
- Or update the default in `main.py`


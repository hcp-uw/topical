# Topical Backend

Backend API for the Topical academic paper summarization app. Supports text files and PDFs with automatic image extraction.

## Features

- 📄 **PDF Support**: Extract text and images/graphs from PDF files
- 🚀 **Fast Summarization**: Multiple LLM provider options (Groq, Ollama, Gemini, etc.)
- 🔄 **Automatic Chunking**: Handles long documents by splitting and summarizing in parts
- 🖼️ **Image Extraction**: Extracts and returns images/graphs from PDFs as base64 data URIs
- ⚡ **Rate Limit Handling**: Automatic retries and delays for API rate limits

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- FastAPI and Uvicorn (web server)
- PyMuPDF (PDF text and image extraction)
- pdfplumber (PDF text extraction)
- Pillow (image processing)
- httpx (HTTP client)

### 2. Choose Your LLM Option

#### Option A: Groq (Recommended - Fast & Free) ⭐

Groq offers extremely fast inference with a generous free tier (14,400 requests/day).

1. **Get API Key**: 
   - Go to https://console.groq.com
   - Sign up (free)
   - Create an API key
   - Copy your key

2. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:GROQ_API_KEY="your-api-key-here"
   
   # Windows CMD
   set GROQ_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GROQ_API_KEY=your-api-key-here
   ```

3. **Verify Setup**:
   ```bash
   python test_groq.py
   ```

**Note**: Groq free tier has rate limits (6000 tokens/minute). The backend automatically handles this with delays between chunks.

#### Option B: Ollama (Free, Local)

Ollama runs locally on your machine - completely free, no API keys needed.

1. **Install Ollama**: https://ollama.ai
   - **Windows**: Download `OllamaSetup.exe` from https://ollama.ai/download, run the installer, then **restart your terminal/PowerShell**
   - **Mac/Linux**: `curl https://ollama.ai/install.sh | sh`

2. **Pull a model**:
   ```bash
   ollama pull mistral
   # Or for faster processing:
   ollama pull llama3.2:3b
   ```

3. **Start Ollama** (usually runs automatically):
   ```bash
   ollama serve
   ```

4. **Verify it's working**:
   ```bash
   ollama run mistral "Hello, how are you?"
   ```

#### Option C: Google Gemini (Free Tier)

1. Get API key from https://makersuite.google.com/app/apikey
2. Set environment variable:
   ```bash
   export GEMINI_API_KEY=your-key-here
   ```
3. Change provider in `main.py` to `"gemini"`

#### Option D: Other Providers

See `API_SETUP.md` for detailed setup instructions for:
- Hugging Face Inference API
- Together AI
- OpenAI API

### 3. Configure Provider

Edit `main.py` line 34 to set your preferred provider:

```python
provider = os.getenv("LLM_PROVIDER", "groq")  # Options: "groq", "ollama", "gemini", etc.
```

Or set via environment variable:
```bash
export LLM_PROVIDER=groq
```

### 4. Create Data Directory

The backend reads files from a `data` directory:

```bash
mkdir -p backend/data
```

Place your files in the `backend/data` directory:
- `.txt` files (plain text)
- `.md` files (Markdown)
- `.pdf` files (PDFs with text and images)

### 4. Run the Server

```bash
cd backend
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

## API Endpoints

### Health Check
```
GET /health
```

### Generate Summary from Text
```
POST /api/generate-summary
Content-Type: application/json

{
    "text": "Your text content here...",
    "topic": "Optional topic/subject"
}
```

### Summarize a File

Supports `.txt`, `.md`, and `.pdf` files. For PDFs, also extracts and returns images.

```
POST /api/summarize-file
Content-Type: application/json

{
    "filename": "example.pdf",
    "topic": "Optional topic/subject"
}
```

**Response** (for PDFs):
```json
{
    "summary": "Generated summary text...",
    "model": "groq",
    "images": [
        {
            "data": "data:image/png;base64,...",
            "format": "png",
            "page": 1,
            "index": 0
        }
    ]
}
```

**Response** (for text files):
```json
{
    "summary": "Generated summary text...",
    "model": "groq",
    "images": null
}
```

### List Available Files
```
GET /api/list-files
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

### Test with curl:

```bash
# List files
curl http://localhost:8000/api/list-files

# Summarize a file
curl -X POST http://localhost:8000/api/summarize-file \
  -H "Content-Type: application/json" \
  -d '{"filename": "example.txt"}'

# Generate summary from text
curl -X POST http://localhost:8000/api/generate-summary \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here...", "topic": "Machine Learning"}'
```

## LLM Provider Comparison

| Provider | Cost | Speed | Free Tier | Best For |
|----------|------|-------|-----------|----------|
| **Groq** ⭐ | Free | ⚡⚡⚡ Very Fast | 14,400 req/day | Production, mobile apps |
| Ollama | Free | ⚡ Medium | Unlimited (local) | Development, privacy |
| Gemini | Free | ⚡⚡ Fast | 1,500 req/day | General use |
| Hugging Face | Free | ⚡ Medium | Rate limited | Experimentation |
| Together AI | Free credits | ⚡⚡ Fast | Free credits | Testing |
| OpenAI | Paid | ⚡⚡⚡ Very Fast | $5 credit | Production (paid) |

**Recommendation**: 
- **Development**: Use Ollama (no rate limits, completely free)
- **Production/Mobile Apps**: Use Groq (very fast, generous free tier)
- **Long Documents**: Groq or Gemini (better context handling)

## How It Works

### PDF Processing

1. **Text Extraction**: Uses `pdfplumber` to extract text from PDFs
2. **Image Extraction**: Uses `PyMuPDF` to extract images/graphs
3. **Chunking**: Long PDFs are automatically split into chunks (8000 chars for Groq, 3000 for others)
4. **Summarization**: Each chunk is summarized, then combined into a final summary
5. **Rate Limiting**: Automatic delays and retries for API rate limits

### Supported File Types

- **Text Files** (`.txt`, `.md`): Direct text summarization
- **PDF Files** (`.pdf`): Text extraction + image extraction + summarization

## Testing

### Quick Tests

```bash
# Test Groq API setup
python test_groq.py

# Test PDF processing
python test_pdf.py

# Test timing and performance
python test_timing.py lecture22.pdf groq
```

### Test with curl:

```bash
# List files
curl http://localhost:8000/api/list-files

# Summarize a PDF file
curl -X POST http://localhost:8000/api/summarize-file \
  -H "Content-Type: application/json" \
  -d '{"filename": "lecture22.pdf", "topic": "Computer Science"}'

# Generate summary from text
curl -X POST http://localhost:8000/api/generate-summary \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here...", "topic": "Machine Learning"}'
```

## Troubleshooting

### Rate Limit Errors (Groq)

If you see rate limit errors:
- The backend automatically retries with delays
- For very long PDFs, processing may take 20-30 seconds
- Consider using Ollama for unlimited local processing

### PDF Processing Issues

- Make sure `PyMuPDF`, `pdfplumber`, and `Pillow` are installed
- Check that PDF files are not corrupted
- Large PDFs (>50 pages) may take longer to process

### API Key Issues

- Environment variables only persist in the current terminal session
- Set the key before starting the server
- Or set it permanently (see `API_SETUP.md`)

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── services/
│   ├── __init__.py
│   ├── llm_service.py     # LLM integration (Groq, Ollama, Gemini, etc.)
│   └── file_reader.py     # File reading and PDF processing
├── data/                   # Place .txt, .md, or .pdf files here
├── requirements.txt        # Python dependencies
├── API_SETUP.md           # Detailed API setup guide
├── test_groq.py           # Test Groq API setup
├── test_pdf.py            # Test PDF processing
├── test_timing.py         # Performance testing
└── README.md              # This file
```

## Additional Resources

- **API Setup Guide**: See `API_SETUP.md` for detailed provider setup
- **API Documentation**: Visit http://localhost:8000/docs when server is running
- **Troubleshooting**: Check server logs for detailed error messages


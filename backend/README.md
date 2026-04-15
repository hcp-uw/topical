# Summary LLM

### Setup
Install dependencies: From project root run `pip install -r backend/requirements.txt` OR `cd backend` then `pip install -r requirements.txt`

### Run Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### Environment Variables

Create a `.env` file inside `backend/`:

```env
# Required for Groq (recommended)
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Or use Ollama instead (no API key needed, must be running locally)
# LLM_PROVIDER=ollama
# OLLAMA_BASE_URL=http://localhost:11434

# Optional: save summaries to Supabase
# TOPICAL_SAVE_TO_DB=true
# SUPABASE_KEY=your_supabase_anon_key

# Optional: enable hallucination-check verification pass (doubles API calls)
# TOPICAL_VERIFY_SUMMARIES=true
```

### LLM Setup

#### Groq (recommended)
- Get a free API key at: https://console.groq.com
- Set `LLM_PROVIDER=groq` and `GROQ_API_KEY=your_key` in your `.env`
- Default model: `llama-3.3-70b-versatile`

#### Ollama
- Requires Ollama to be installed — https://ollama.ai
- Pull a model: `ollama pull mistral`
- Set `LLM_PROVIDER=ollama` in your `.env`
- Default model: `mistral`

**To change the provider:**
- Set `LLM_PROVIDER=groq` or `LLM_PROVIDER=ollama` in your `.env`
- Or edit `backend/main.py`: Change the `provider` variable and corresponding `model_name`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/generate-summary` | Summarize raw text |
| `POST` | `/api/summarize-file` | Summarize a file from the data directory |
| `POST` | `/api/fetch-and-summarize-url` | Fetch an arXiv abstract by URL and summarize |
| `POST` | `/api/fetch-articles` | Bulk-fetch arXiv abstracts and summarize |
| `GET` | `/api/random-article` | Get a random article with its summary |
| `GET` | `/api/list-files` | List available files in the data directory |

### Example Requests

```bash
# Health check
curl http://localhost:8000/health

# Summarize an arXiv paper by URL
curl -X POST http://localhost:8000/api/fetch-and-summarize-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://arxiv.org/abs/2401.00001", "topic": "Computer Science"}'

# Fetch and summarize multiple arXiv abstracts
curl -X POST http://localhost:8000/api/fetch-articles \
  -H "Content-Type: application/json" \
  -d '{"subject": "cs", "max_papers": 5, "summarize_after_fetch": true}'

# Get a random article summary (after fetching some articles)
curl http://localhost:8000/api/random-article
```

### Deploying to Railway

1. Set your environment variables (`GROQ_API_KEY`, `LLM_PROVIDER=groq`, etc.) in Railway's dashboard.
2. Set the start command to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. Railway will auto-detect `requirements.txt` and install dependencies.

### TODO
* Configure environment variables
* Set up proper authentication and security

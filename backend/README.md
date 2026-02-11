# Summary LLM

### Setup
Install dependencies: From project root run `pip install -r backend/requirements.txt` OR `cd backend` then `pip install -r requirements.txt`

### Run Backend
Run `python backend/main.py` to start the API server on http://localhost:8000

### Run Frontend
Run `python -m http.server 5173` from `backend/frontend/` to serve the web interface on http://localhost:5173

### LLM Setup

#### Ollama
- Requires Ollama to be installed - Install from: https://ollama.ai
- Pull a model: `ollama pull mistral:7b-instruct`
- To change the Ollama model: Edit `backend/main.py` - Change the `model_name` parameter when initializing `LLMService` (e.g. when provider is ollama, use `model_name="llama2"`)

#### Groq
- Recommended for faster responses - Get API key at: https://console.groq.com
- Set environment variable: `GROQ_API_KEY=your_api_key_here`
- Set provider: `LLM_PROVIDER=groq` (or edit `backend/main.py`)
- To change the Groq model: Edit `backend/main.py` - Change the `model_name` when provider is groq (e.g. `model_name="mixtral-8x7b-32768"`)

**To change the provider:**
- Set environment variable: `LLM_PROVIDER=groq` or `LLM_PROVIDER=ollama`
- Or edit `backend/main.py`: Change the `provider` variable and corresponding `model_name`

### TODO
* Configure environment variables
* Set up proper authentication and security

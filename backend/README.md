# Summary LLM

### Setup
Install dependencies: From project root run `pip install -r backend/requirements.txt` OR `cd backend` then `pip install -r requirements.txt`

### Run Backend
Run `python backend/main.py` to start the API server on http://localhost:8000

### Run Frontend
Run `python -m http.server 5173` from `backend/frontend/` to serve the web interface on http://localhost:5173

### LLM Setup

The backend now uses **Groq** exclusively for summarization.

- Get an API key at: `https://console.groq.com`
- Set environment variable: `GROQ_API_KEY=your_api_key_here`
- To change the Groq model used, update the `model_name` argument when initializing `LLMService` in `backend/services/llm_service.py`.

### TODO
* Configure environment variables
* Set up proper authentication and security

# Topical Frontend

Simple web interface for the Topical summarization backend. It lets you:

- See which text files are available in `backend/data`
- Generate summaries for those files via `/api/summarize-file`
- Paste custom text and call `/api/generate-summary`

## Prerequisites

1. Backend running at `http://localhost:8000` (`python main.py` inside `backend/`)
2. Ollama (or another configured LLM) running so the backend can generate summaries

## Run the Frontend

This frontend is pure HTML/CSS/JS. Serve it with any static file server or even open directly:

### Option A: Use Python's built-in server

```bash
cd frontend
python -m http.server 5173
```

Visit http://localhost:5173 in your browser.

### Option B: Use `npx serve` (requires Node.js)

```bash
cd frontend
npx serve .
```

### Option C: Open the file directly

Open `frontend/index.html` in your browser. (Note: Some browsers block `fetch` from `file://` origins. If requests fail, use one of the servers above.)

## Configuration

- API base URL defaults to `http://localhost:8000`. To override, set `window.API_BASE_URL` before loading `app.js`:

```html
<script>
  window.API_BASE_URL = "http://192.168.1.50:8000";
</script>
<script src="app.js" type="module"></script>
```

## Features

- Refresh button to reload available files from the backend
- File summary form with optional topic hint
- Custom text summary form
- Shows which model generated the latest summary
- Status messages for loading, errors, and success

## Folder Contents

```
frontend/
├── index.html    # UI markup
├── styles.css    # Styling
├── app.js        # Fetch logic + interactions
└── README.md
```


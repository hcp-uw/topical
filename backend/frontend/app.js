const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000";

const fileSelect = document.getElementById("file-select");
const refreshFilesBtn = document.getElementById("refresh-files");
const summarizeFileBtn = document.getElementById("summarize-file");
const fileTopicInput = document.getElementById("file-topic");
const summaryOutput = document.getElementById("summary-output");
const statusMessage = document.getElementById("status-message");
const modelNameBadge = document.getElementById("model-name");
const apiBaseUrlLabel = document.getElementById("api-base-url");
const fetchArticlesBtn = document.getElementById("fetch-articles");
const fetchAndSummarizeUrlBtn = document.getElementById("fetch-and-summarize-url");
const randomArticleBtn = document.getElementById("random-article");
const articleSubjectSelect = document.getElementById("article-subject");
const maxPapersInput = document.getElementById("max-papers");
const articleUrlInput = document.getElementById("article-url");
const urlTopicInput = document.getElementById("url-topic");
const bulkTopicInput = document.getElementById("bulk-topic");
const randomTopicInput = document.getElementById("random-topic");
const tabSingle = document.getElementById("tab-single");
const tabMultiple = document.getElementById("tab-multiple");
const panelSingle = document.getElementById("panel-single");
const panelMultiple = document.getElementById("panel-multiple");

apiBaseUrlLabel.textContent = API_BASE_URL;

function switchFetchTab(toMultiple) {
  const isMultiple = toMultiple === true;
  tabSingle.classList.toggle("active", !isMultiple);
  tabMultiple.classList.toggle("active", isMultiple);
  tabSingle.setAttribute("aria-selected", !isMultiple ? "true" : "false");
  tabMultiple.setAttribute("aria-selected", isMultiple ? "true" : "false");
  panelSingle.classList.toggle("active", !isMultiple);
  panelMultiple.classList.toggle("active", isMultiple);
}

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.classList.add("hidden");
}

function showPlaceholder() {
  summaryOutput.innerHTML =
    '<p class="placeholder">Choose a file to generate a summary.</p>';
  modelNameBadge.textContent = "";
}

function renderSummary(summary, model) {
  if (!summary) {
    showPlaceholder();
    return;
  }
  
  summaryOutput.innerHTML = summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p>${line}</p>`)
    .join("");
  modelNameBadge.textContent = model ? `Model: ${model}` : "";
}

function renderSummaryWithImages(summary, model, images) {
  if (!summary) {
    showPlaceholder();
    return;
  }
  
  let html = summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p>${line}</p>`)
    .join("");
  
  // Add images section
  if (images && images.length > 0) {
    html += '<div class="images-section"><h3>Images from PDF:</h3>';
    images.forEach((img, index) => {
      html += `<div class="pdf-image">
        <p><strong>Page ${img.page}</strong></p>
        <img src="${img.data}" alt="PDF image ${index + 1} from page ${img.page}" />
      </div>`;
    });
    html += '</div>';
  }
  
  summaryOutput.innerHTML = html;
  modelNameBadge.textContent = model ? `Model: ${model}` : "";
}

function renderBulkSummaries(summaries) {
  if (!summaries || summaries.length === 0) {
    showPlaceholder();
    return;
  }
  const model = summaries[0] && summaries[0].model ? summaries[0].model : "";
  modelNameBadge.textContent = model ? `Model: ${model}` : "";
  const html = summaries
    .map((s) => {
      const summaryHtml = (s.summary || "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => `<p>${line}</p>`)
        .join("");
      return `<div class="bulk-summary-item"><div class="article-header"><h3>${escapeHtml(s.title || s.filename)}</h3><p class="article-filename">${escapeHtml(s.filename)}</p></div>${summaryHtml}</div>`;
    })
    .join("");
  summaryOutput.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function fetchJSON(endpoint, options = {}) {
  // Add timeout (2 minutes for PDF processing)
  const timeout = 120000; // 2 minutes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The PDF may be too large or the server is taking too long.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to backend. Make sure the server is running at ' + API_BASE_URL);
    }
    throw error;
  }
}

async function loadFiles() {
  const dataPathEl = document.getElementById("data-path-display");
  setStatus("Loading files...", "info");
  try {
    const data = await fetchJSON("/api/list-files");
    fileSelect.innerHTML = "";

    if (data.data_path && dataPathEl) {
      dataPathEl.textContent = data.data_path;
    }

    if (!data.files || data.files.length === 0) {
      fileSelect.disabled = true;
      const option = document.createElement("option");
      option.textContent = "No text files found";
      fileSelect.appendChild(option);
      setStatus("Add .txt, .md, or *_abstract.txt files to the data folder and refresh.", "warning");
      return;
    }

    fileSelect.disabled = false;
    data.files.forEach((file) => {
      const option = document.createElement("option");
      option.value = file;
      option.textContent = file;
      fileSelect.appendChild(option);
    });
    setStatus(`Loaded ${data.files.length} file(s).`, "success");
    statusMessage.classList.remove("hidden");
  } catch (error) {
    setStatus(`Failed to load files: ${error.message}`, "error");
    statusMessage.classList.remove("hidden");
  }
}

async function handleFileSummary() {
  if (fileSelect.disabled) {
    setStatus("No files available. Add files to backend/data.", "warning");
    statusMessage.classList.remove("hidden");
    return;
  }

  const filename = fileSelect.value;
  const topic = fileTopicInput.value.trim() || null;

  // Disable button during processing
  summarizeFileBtn.disabled = true;
  summarizeFileBtn.textContent = "Processing...";
  
  setStatus("Generating summary from file... This may take 2-5 minutes for large PDFs.", "info");
  statusMessage.classList.remove("hidden");
  
  // Use longer timeout for file summary (5 minutes for large PDFs)
  const timeout = 300000; // 5 minutes
  const controller = new AbortController();
  let timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/summarize-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ filename, topic }),
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }
    
    const result = await response.json();
    
    // Handle images if present
    if (result.images && result.images.length > 0) {
      renderSummaryWithImages(result.summary, result.model, result.images);
    } else {
      renderSummary(result.summary, result.model);
    }
    
    setStatus("Summary ready.", "success");
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      setStatus('Request timed out. The PDF may be too large. Try a smaller PDF or wait longer.', "error");
    } else {
      setStatus(`Error: ${error.message}`, "error");
    }
    renderSummary("", "");
    showPlaceholder();
    console.error("Summary error:", error);
  } finally {
    // Re-enable button
    summarizeFileBtn.disabled = false;
    summarizeFileBtn.textContent = "Summarize File";
  }
}

async function handleFetchArticles() {
  const subject = articleSubjectSelect.value;
  const maxPapers = parseInt(maxPapersInput.value, 10) || 10;

  fetchArticlesBtn.disabled = true;
  fetchArticlesBtn.textContent = "Fetching...";
  setStatus(`Fetching ${maxPapers} arXiv abstracts (${subject}), then summarizing all in parallel... This may take a few minutes.`, "info");
  statusMessage.classList.remove("hidden");

  const timeout = 600000; // 10 minutes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}/api/fetch-articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        subject,
        max_papers: maxPapers,
        summarize_after_fetch: true,
      }),
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }
    const result = await response.json();
    const count = result.total_fetched || 0;
    const summaries = result.summaries || [];
    if (summaries.length > 0) {
      setStatus(`Fetched and summarized ${summaries.length} articles.`, "success");
      renderBulkSummaries(summaries);
    } else if (count > 0) {
      setStatus(`Fetched ${count} abstracts, but summarization did not run or failed. Check that the LLM (Ollama or Groq) is running.`, "warning");
      summaryOutput.innerHTML = `<p class="placeholder">${count} abstract file(s) were saved. Use "Summarize a Local File" or "Get Random Article" to summarize them.</p>`;
    } else {
      setStatus(`No new abstracts fetched.`, "info");
      await loadFiles();
    }
    await loadFiles();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      setStatus("Request timed out.", "warning");
    } else {
      setStatus(`Error: ${error.message}`, "error");
    }
    console.error("Fetch articles error:", error);
  } finally {
    fetchArticlesBtn.disabled = false;
    fetchArticlesBtn.textContent = "Fetch & Summarize";
  }
}

async function handleFetchAndSummarizeUrl() {
  const url = articleUrlInput.value.trim();
  const topic = urlTopicInput.value.trim() || null;

  if (!url) {
    setStatus("Please enter an article URL.", "warning");
    statusMessage.classList.remove("hidden");
    return;
  }

  fetchAndSummarizeUrlBtn.disabled = true;
  fetchAndSummarizeUrlBtn.textContent = "Fetching...";

  setStatus("Fetching article and generating summary...", "info");
  statusMessage.classList.remove("hidden");

  const timeout = 300000; // 5 minutes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}/api/fetch-and-summarize-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ url, topic }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }

    const result = await response.json();

    let summaryHtml = result.summary
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `<p>${line}</p>`)
      .join("");
    let html = `<div class="article-header"><h3>${result.title}</h3><p class="article-url"><a href="${result.url}" target="_blank" rel="noopener">${result.url}</a></p></div>${summaryHtml}`;

    summaryOutput.innerHTML = html;
    modelNameBadge.textContent = result.model ? `Model: ${result.model}` : "";
    setStatus("Article fetched and summarized.", "success");
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      setStatus("Request timed out. Try a shorter page or try again.", "error");
    } else {
      setStatus(`Error: ${error.message}`, "error");
    }
    showPlaceholder();
    console.error("Fetch and summarize error:", error);
  } finally {
    fetchAndSummarizeUrlBtn.disabled = false;
    fetchAndSummarizeUrlBtn.textContent = "Fetch & Summarize";
  }
}

async function handleRandomArticle() {
  const topic = randomTopicInput.value.trim() || null;
  
  // Disable button during processing
  randomArticleBtn.disabled = true;
  randomArticleBtn.textContent = "Loading...";
  
  setStatus("Getting random article and generating summary... This may take 2-5 minutes for large PDFs.", "info");
  statusMessage.classList.remove("hidden");
  
  // Use longer timeout for random article (5 minutes for large PDFs)
  const timeout = 300000; // 5 minutes
  const controller = new AbortController();
  let timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const topicParam = topic ? `?topic=${encodeURIComponent(topic)}` : "";
    
    const response = await fetch(`${API_BASE_URL}/api/random-article${topicParam}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }
    
    const result = await response.json();
    
    // Check if summary exists
    if (!result.summary || !result.summary.trim()) {
      throw new Error("Summary is empty. The PDF may be too large or the LLM failed to generate a summary.");
    }
    
    // Build HTML with filename and summary (same approach as file summary)
    let summaryHtml = result.summary
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `<p>${line}</p>`)
      .join("");
    
    // Add filename header
    let html = `<div class="article-header"><h3>${result.filename}</h3></div>${summaryHtml}`;
    
    // Add images if present
    if (result.images && result.images.length > 0) {
      html += '<div class="images-section"><h3>Images from PDF:</h3>';
      result.images.forEach((img, index) => {
        html += `<div class="pdf-image">
          <p><strong>Page ${img.page}</strong></p>
          <img src="${img.data}" alt="PDF image ${index + 1} from page ${img.page}" />
        </div>`;
      });
      html += '</div>';
    }
    
    // Display the summary
    summaryOutput.innerHTML = html;
    modelNameBadge.textContent = result.model ? `Model: ${result.model}` : "";
    
    setStatus("Random article loaded!", "success");
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      setStatus('Request timed out. The PDF may be too large. Try a smaller PDF or wait longer.', "error");
    } else {
      setStatus(`Error: ${error.message}`, "error");
    }
    renderSummary("", "");
    showPlaceholder();
    console.error("Random article error:", error);
  } finally {
    randomArticleBtn.disabled = false;
    randomArticleBtn.textContent = "Get Random Article";
  }
}

refreshFilesBtn.addEventListener("click", loadFiles);
summarizeFileBtn.addEventListener("click", handleFileSummary);
fetchArticlesBtn.addEventListener("click", handleFetchArticles);
fetchAndSummarizeUrlBtn.addEventListener("click", handleFetchAndSummarizeUrl);
randomArticleBtn.addEventListener("click", handleRandomArticle);

window.addEventListener("DOMContentLoaded", () => {
  loadFiles();
  showPlaceholder();
  switchFetchTab(false);
  if (tabSingle) tabSingle.addEventListener("click", () => switchFetchTab(false));
  if (tabMultiple) tabMultiple.addEventListener("click", () => switchFetchTab(true));
});


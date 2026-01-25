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
const randomArticleBtn = document.getElementById("random-article");
const articleSubjectSelect = document.getElementById("article-subject");
const maxPapersInput = document.getElementById("max-papers");
const randomTopicInput = document.getElementById("random-topic");

apiBaseUrlLabel.textContent = API_BASE_URL;

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
  setStatus("Loading files...", "info");
  try {
    const data = await fetchJSON("/api/list-files");
    fileSelect.innerHTML = "";

    if (!data.files || data.files.length === 0) {
      fileSelect.disabled = true;
      const option = document.createElement("option");
      option.textContent = "No text files found";
      fileSelect.appendChild(option);
      setStatus("Add .txt files to backend/data and refresh.", "warning");
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
  const maxPapers = parseInt(maxPapersInput.value) || 10;
  
  // Disable button during processing
  fetchArticlesBtn.disabled = true;
  fetchArticlesBtn.textContent = "Fetching...";
  
  setStatus(`Fetching ${maxPapers} articles from arXiv (${subject})... This may take several minutes.`, "info");
  statusMessage.classList.remove("hidden");
  
  try {
    // Use longer timeout for article fetching (10 minutes)
    const timeout = 600000; // 10 minutes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE_URL}/api/fetch-articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        subject: subject,
        max_papers: maxPapers,
        download_pdfs: true
      }),
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }
    
    const result = await response.json();
    
    setStatus(
      `Successfully fetched ${result.downloaded || result.total_found} articles!`, 
      "success"
    );
    
    // Refresh file list
    await loadFiles();
    
  } catch (error) {
    if (error.name === 'AbortError') {
      setStatus('Request timed out. The scraping may still be running on the server.', "warning");
    } else {
      setStatus(`Error: ${error.message}`, "error");
    }
    console.error("Fetch articles error:", error);
  } finally {
    fetchArticlesBtn.disabled = false;
    fetchArticlesBtn.textContent = "Fetch Articles";
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
randomArticleBtn.addEventListener("click", handleRandomArticle);

window.addEventListener("DOMContentLoaded", () => {
  loadFiles();
  showPlaceholder();
});


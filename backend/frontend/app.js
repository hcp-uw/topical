const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000";

const fileSelect = document.getElementById("file-select");
const refreshFilesBtn = document.getElementById("refresh-files");
const summarizeFileBtn = document.getElementById("summarize-file");
const summarizeTextBtn = document.getElementById("summarize-text");
const fileTopicInput = document.getElementById("file-topic");
const textTopicInput = document.getElementById("text-topic");
const textInput = document.getElementById("text-input");
const summaryOutput = document.getElementById("summary-output");
const statusMessage = document.getElementById("status-message");
const modelNameBadge = document.getElementById("model-name");
const apiBaseUrlLabel = document.getElementById("api-base-url");

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
    '<p class="placeholder">Choose a file or enter text to generate a summary.</p>';
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
  
  setStatus("Generating summary from file... This may take 30-60 seconds for PDFs.", "info");
  statusMessage.classList.remove("hidden");
  
  try {
    const result = await fetchJSON("/api/summarize-file", {
      method: "POST",
      body: JSON.stringify({ filename, topic }),
    });
    
    // Handle images if present
    if (result.images && result.images.length > 0) {
      renderSummaryWithImages(result.summary, result.model, result.images);
    } else {
      renderSummary(result.summary, result.model);
    }
    
    setStatus("Summary ready.", "success");
  } catch (error) {
    renderSummary("", "");
    showPlaceholder();
    setStatus(`Error: ${error.message}`, "error");
    console.error("Summary error:", error);
  } finally {
    // Re-enable button
    summarizeFileBtn.disabled = false;
    summarizeFileBtn.textContent = "Summarize File";
  }
}

async function handleTextSummary() {
  const text = textInput.value.trim();
  if (!text) {
    setStatus("Please paste text to summarize.", "warning");
    statusMessage.classList.remove("hidden");
    return;
  }

  const topic = textTopicInput.value.trim() || null;
  setStatus("Generating summary from custom text...", "info");
  statusMessage.classList.remove("hidden");
  try {
    const result = await fetchJSON("/api/generate-summary", {
      method: "POST",
      body: JSON.stringify({ text, topic }),
    });
    renderSummary(result.summary, result.model);
    setStatus("Summary ready.", "success");
  } catch (error) {
    renderSummary("", "");
    showPlaceholder();
    setStatus(`Error: ${error.message}`, "error");
  }
}

refreshFilesBtn.addEventListener("click", loadFiles);
summarizeFileBtn.addEventListener("click", handleFileSummary);
summarizeTextBtn.addEventListener("click", handleTextSummary);

window.addEventListener("DOMContentLoaded", () => {
  loadFiles();
  showPlaceholder();
});


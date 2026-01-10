# Ollama Troubleshooting Guide

## Common Issues with `ollama pull`

### Issue: Model name error

**Problem**: `ollama pull mistral:7b-instruct` gives an error

**Solution**: Try these correct model names:

```bash
# Option 1: Base Mistral model (recommended, ~4GB)
ollama pull mistral

# Option 2: Mistral 7B with tag
ollama pull mistral:7b

# Option 3: Mistral Instruct variant
ollama pull mistral:instruct

# Option 4: List all available Mistral models
ollama list | grep mistral
```

### Issue: Ollama not installed or not running

**Check if Ollama is installed:**
```bash
ollama --version
```

**If not installed:**
- Windows: Download from https://ollama.ai/download
- Mac/Linux: `curl https://ollama.ai/install.sh | sh`

**Check if Ollama is running:**
```bash
# Start Ollama (if not running)
ollama serve

# In another terminal, test it
ollama list
```

### Issue: Network/Connection errors

**Check your internet connection:**
```bash
# Test if you can reach Ollama servers
curl https://ollama.ai
```

**If behind a proxy:**
- Configure proxy settings for Ollama
- Check firewall settings

### Issue: Disk space

**Check available disk space:**
- Mistral models are ~4-8GB
- Ensure you have at least 10-15GB free space

### Issue: File system limitations

**If using external drive:**
- FAT32 has 4GB file limit - use NTFS (Windows) or exFAT/APFS (Mac)

## Verify Installation

After pulling a model, verify it works:

```bash
# List installed models
ollama list

# Test the model
ollama run mistral "Hello, can you summarize this: Machine learning is..."
```

## Update Code to Use Correct Model Name

The default model name in the code has been updated to `mistral` (the base model). If you want to use a different variant, you can:

1. **Change in code**: Edit `backend/services/llm_service.py` line 18
2. **Or use environment variable**: Set `OLLAMA_MODEL=mistral:instruct` before running

## Alternative: Use Smaller Models

If Mistral is too large, try these smaller models:

```bash
# TinyLlama (~637MB) - Fast but less capable
ollama pull tinyllama

# Phi-2 (~1.6GB) - Good balance
ollama pull phi

# Llama 3.2 (~2GB) - Very capable
ollama pull llama3.2
```

Then update the model name in `llm_service.py` accordingly.


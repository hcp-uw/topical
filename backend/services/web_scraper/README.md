# ArXiv Scraper Class

A Python class for scraping academic papers from arXiv.org and downloading PDFs.

## Features

- Scrape PDF links from arXiv subject categories by month/year
- Download PDFs automatically with error handling
- Save links to text files

## Requirements

- Python 3.6+
- Selenium WebDriver
- Firefox browser
- geckodriver.exe (included in this directory)
- requests library

## Installation

```bash
pip install selenium requests
```

## Usage

### Basic Usage

```python
from scraper import ArxivScraper
import os

# Create scraper instance
scraper = ArxivScraper()

# Scrape papers from astro-ph for January 2026
pdf_links = scraper.scrape_monthly_arxiv("astro-ph", 2026, 1)

# Save links to file
scraper.save_links_to_file(pdf_links, "links.txt")

# Download PDFs - delay is in seconds
scraper.download_all_pdfs(pdf_links, "pdfs/", delay=100)

# Download single pdf (if needed)
scraper.download_pdf("https://arxiv.org/pdf/1234.56789.pdf", "pdfs/", None)

# Always clean up
scraper.quit_driver()
```

### Available Methods

#### `__init__()`
Initialize the scraper instance.

#### `init_driver()`
Initialize the Firefox WebDriver. Called automatically when needed.

#### `scrape_monthly_arxiv(subject, year, month)`
Scrape all papers from a specific arXiv subject for a given month.

**Parameters:**
- `subject` (str): arXiv subject (e.g., "astro-ph", "cs", "math", "physics")
- `year` (int): Year to scrape (e.g., 2026)
- `month` (int): Month to scrape (1-12)

**Returns:**
- List of PDF URLs

#### `save_links_to_file(links, filepath)`
Save PDF links to a text file.

**Parameters:**
- `links` (list): List of PDF URLs
- `filepath` (str): Path where to save the file

#### `download_all_pdfs(pdf_links, output_dir, delay=True)`
Download all PDFs from a list of URLs.

**Parameters:**
- `pdf_links` (list): List of PDF URLs
- `output_dir` (str): Directory to save PDFs
- `delay` (bool): Whether to add delays between downloads

**Returns:**
- Tuple of (successful_downloads, failed_downloads)

#### `quit_driver()`
Safely quit the WebDriver.

### ArXiv Subject Categories

Common subject categories you can use:
- `astro-ph`: Astrophysics
- `cs`: Computer Science
- `math`: Mathematics
- `physics`: Physics
- `q-bio`: Quantitative Biology
- `q-fin`: Quantitative Finance
- `stat`: Statistics

## Error Handling

The class includes comprehensive error handling:
- Automatic driver cleanup on exit
- File creation if directories don't exist
- Skip already downloaded files
- Retry mechanisms for failed downloads
- Detailed error messages

## Example Scripts

- `scraper.py`: The main scraper class
- `example_usage.py`: Simple example of how to use the class
- Run `python example_usage.py` for automated example

## File Structure

```
webscraper/
├── scraper.py              # Main scraper class
├── example_usage.py     # Usage example
├── geckodriver.exe      # Firefox WebDriver
├── README.md           # This file
└── scraped data/       # Output directory
    ├── links.txt       # Saved PDF links
    └── pdfs/          # Downloaded PDFs
```

## Notes

- The scraper is designed to be respectful to arXiv's servers with built-in delays
- PDFs are saved with their arXiv ID as filename
- Already downloaded files are automatically skipped
- The driver is automatically cleaned up when the script exits

## Troubleshooting

**"geckodriver not found"**: Make sure geckodriver.exe is in your PATH or current directory
**Connection errors**: Check your internet connection and try again
**Download failures**: Some PDFs may be temporarily unavailable, the scraper will continue with others

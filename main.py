from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import requests
from urllib.parse import urlparse

link_to_pdfs = []

# Initialize driver as None - will be created when needed
driver = None

def init_driver():
    """Initialize the Firefox driver"""
    global driver
    if driver is None:
        try:
            driver = webdriver.Firefox()
        except Exception as e:
            print(f"Error initializing Firefox driver: {e}")
            print("Make sure geckodriver.exe is in your PATH or in the current directory")
            raise

def ensure_dir(path):
    """Create directory if it doesn't exist"""
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def save_links_to_file(links, filepath):
    """Save PDF links to a text file"""
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, 'w') as f:
        for link in links:
            f.write(link + '\n')
    print(f"Saved {len(links)} links to {filepath}")

def download_pdf(url, output_dir, session=None):
    """Download a single PDF from URL"""
    try:
        # Create session if not provided
        if session is None:
            session = requests.Session()
        
        # Extract filename from URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        if not filename.endswith('.pdf'):
            filename += '.pdf'
        
        filepath = os.path.join(output_dir, filename)
        
        # Skip if file already exists
        if os.path.exists(filepath):
            print(f"File already exists: {filename}")
            return filepath
        
        # Download the PDF
        print(f"Downloading: {filename}")
        response = session.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        # Save to file
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"Successfully downloaded: {filename}")
        return filepath
        
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def download_all_pdfs(pdf_links, output_dir, delay=1):
    """Download all PDFs from a list of links"""
    ensure_dir(output_dir)
    session = requests.Session()
    
    # Set a user agent to avoid blocking
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    successful_downloads = 0
    failed_downloads = 0
    
    for i, link in enumerate(pdf_links, 1):
        print(f"Processing {i}/{len(pdf_links)}: {link}")
        
        result = download_pdf(link, output_dir, session)
        if result:
            successful_downloads += 1
        else:
            failed_downloads += 1
        
        # Be nice to the server
        time.sleep(delay)
    
    print(f"\nDownload complete!")
    print(f"Successful: {successful_downloads}")
    print(f"Failed: {failed_downloads}")
    
    return successful_downloads, failed_downloads

def page_scrape(link):
    """Extract PDF links from a single arXiv list page"""
    global driver
    if driver is None:
        init_driver()
        
    driver.get(link)
    time.sleep(2)  # Wait for page to load
    
    pdf_links = []
    
    try:
        # Find all paper entries on the page
        paper_elements = driver.find_elements(By.CSS_SELECTOR, "dt")
        
        for dt in paper_elements:
            try:
                # Get the arXiv ID from the dt element
                arxiv_id_element = dt.find_element(By.CSS_SELECTOR, "a[title='Abstract']")
                arxiv_id_link = arxiv_id_element.get_attribute("href")
                
                # Extract arXiv ID and convert to PDF link
                if "/abs/" in arxiv_id_link:
                    arxiv_id = arxiv_id_link.split("/abs/")[-1]
                    pdf_link = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                    pdf_links.append(pdf_link)
                    
            except Exception as e:
                continue  # Skip if we can't find the link
                
    except Exception as e:
        print(f"Error scraping page {link}: {e}")
    
    return pdf_links

def scrape_monthly_arxiv(subj, year=2026, month=1):
    """Iteratively scrape all astro-ph pages for a given month"""
    all_pdf_links = []
    page_num = 0
    skip = 0
    show = 50  # Number of results per page
    
    while True:
        # Construct URL for current page
        url = f"https://arxiv.org/list/{subj}/{year:04d}-{month:02d}?skip={skip}&show={show}"
        print(f"Scraping page: {url}")
        
        # Get PDF links from current page
        pdf_links = page_scrape(url)
        
        # If no links found, we've reached the end
        if not pdf_links:
            print("No more papers found, stopping.")
            break
            
        # Add links to our master list
        all_pdf_links.extend(pdf_links)
        print(f"Found {len(pdf_links)} papers on page {page_num + 1}")
        
        # Check if we've reached the end by looking for "Next" button or similar
        try:
            # Try to find if there are more pages
            next_elements = driver.find_elements(By.PARTIAL_LINK_TEXT, "next")
            if not next_elements and len(pdf_links) < show:
                # No "next" link and fewer results than expected = last page
                break
        except:
            # If we can't determine, check if we got fewer results than expected
            if len(pdf_links) < show:
                break
        
        # Move to next page
        skip += show
        page_num += 1
        
        # Be nice to the server
        time.sleep(2)
    
    print(f"Total papers found: {len(all_pdf_links)}")
    return all_pdf_links

# Example usage
if __name__ == "__main__":
    # TODO: Implement supabase stuff
    base_dir = r"c:\Users\Arnav\Downloads\topical\scraped data"
    links_file = os.path.join(base_dir, "links.txt")
    pdfs_dir = os.path.join(base_dir, "pdfs")
    
    # Example with Astrophysics
    print("Scraping Links")
    link_to_pdfs = scrape_monthly_arxiv(subj = "astro-ph", year = 2026, month = 1)
    
    # Save links to file
    save_links_to_file(link_to_pdfs, links_file)
    
    if link_to_pdfs:
        response = input(f"\nFound {len(link_to_pdfs)} PDF links. Download PDFs? (y/n): ")
        if response.lower() == 'y':
            print("\nStarting PDF downloads...")
            download_all_pdfs(link_to_pdfs, pdfs_dir, delay=1)
        else:
            print("Download Cancelled")
    else:
        print("No PDF links found.")
    
    driver.quit()
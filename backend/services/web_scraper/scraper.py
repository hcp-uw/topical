from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import requests
from urllib.parse import urlparse

class ArxivScraper:
    def __init__(self):
        """Initialize the ArxivScraper class"""
        self.driver = None
        
    def init_driver(self):
        """Initialize the Firefox driver"""
        if self.driver is None:
            try:
                self.driver = webdriver.Firefox()
                print("Firefox driver initialized successfully")
            except Exception as e:
                print(f"Error initializing Firefox driver: {e}")
                print("Make sure geckodriver.exe is in your PATH or in the current directory")
                raise

    def ensure_dir(self,path):
        """Create directory if it doesn't exist"""
        if not os.path.exists(path):
            os.makedirs(path, exist_ok=True)

    def save_links_to_file(self,links, filepath):
        """Save PDF links to a text file"""
        self.ensure_dir(os.path.dirname(filepath))
        with open(filepath, 'w') as f:
            for link in links:
                f.write(link + '\n')
        print(f"Saved {len(links)} links to {filepath}")

    def download_pdf(self, url, output_dir, session):
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

    def download_all_pdfs(self, pdf_links, output_dir, delay):
        """Download all PDFs from a list of links"""
        self.ensure_dir(output_dir)
        session = requests.Session()
        
        # Set a user agent to avoid blocking
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        successful_downloads = 0
        failed_downloads = 0
        
        for i, link in enumerate(pdf_links, 1):
            print(f"Processing {i}/{len(pdf_links)}: {link}")
            
            result = self.download_pdf(link, output_dir, session)
            if result:
                successful_downloads += 1
            else:
                failed_downloads += 1
            
            # Be nice to the server
            if delay>0: time.sleep(delay)
        
        print(f"\nDownload complete!")
        print(f"Successful: {successful_downloads}")
        print(f"Failed: {failed_downloads}")
        
        return successful_downloads, failed_downloads

    def page_scrape(self, link):
        """Extract PDF links from a single arXiv list page"""
        if self.driver is None:
            self.init_driver()
            
        self.driver.get(link)
        self.driver.implicitly_wait(2)  # Wait for page to load
        
        pdf_links = []
        
        try:
            # Find all paper entries on the page
            paper_elements = self.driver.find_elements(By.CSS_SELECTOR, "dt")
            
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

    def scrape_monthly_arxiv(self, subj, year, month, max_papers=None):
        """Iteratively scrape arXiv pages for a given month"""
        #######################################################################
        # MODIFIED: Added max_papers parameter to stop early when enough papers found
        #######################################################################
        all_pdf_links = []
        page_num = 0
        skip = 0
        show = 2000  # Number of results per page
        
        while True:
            # Construct URL for current page
            url = f"https://arxiv.org/list/{subj}/{year:04d}-{month:02d}?skip={skip}&show={show}"
            print(f"Scraping page: {url}")
            
            # Get PDF links from current page
            pdf_links = self.page_scrape(url)
            
            # If no links found, we've reached the end
            if not pdf_links:
                print("No more papers found, stopping.")
                break
                
            # Add links to our master list
            all_pdf_links.extend(pdf_links)
            #######################################################################
            # MODIFIED: Added total count to progress message
            #######################################################################
            print(f"Found {len(pdf_links)} papers on page {page_num + 1}. Total so far: {len(all_pdf_links)}")
            
            #######################################################################
            # MODIFIED: Stop early if we have enough papers (prevents scraping all pages)
            #######################################################################
            # Stop if we have enough papers
            if max_papers and len(all_pdf_links) >= max_papers:
                print(f"Reached max_papers limit ({max_papers}), stopping.")
                break
            
            #######################################################################
            # MODIFIED: Removed problematic "next" button check that was causing hangs
            # Simplified to just check if fewer results than expected = last page
            #######################################################################
            # Check if we've reached the end - simpler check
            if len(pdf_links) < show:
                # Fewer results than expected = last page
                print("Reached last page (fewer results than expected).")
                break
            
            # Move to next page
            skip += show
            page_num += 1
            
            # Be nice to the server
            time.sleep(0.2)
        
        #######################################################################
        # MODIFIED: Limit to max_papers if specified (safety check)
        #######################################################################
        # Limit to max_papers if specified
        if max_papers and len(all_pdf_links) > max_papers:
            all_pdf_links = all_pdf_links[:max_papers]
        
        print(f"Total papers found: {len(all_pdf_links)}")
        return all_pdf_links
        #######################################################################
    def quit_driver(self):
        """Safely quit the driver"""
        if self.driver is not None:
            try:
                self.driver.quit()
                self.driver = None
                print("Driver quit successfully")
            except Exception as e:
                print(f"Error quitting driver: {e}")
    
    def __del__(self):
        """Destructor to ensure driver is properly closed"""
        self.quit_driver()


# Example usage when run as main script
if __name__ == "__main__":
    # Define paths
    base_dir = r"c:\Users\Arnav\Downloads\topical\webscraper\scraped data"
    links_file = os.path.join(base_dir, "links.txt")
    pdfs_dir = os.path.join(base_dir, "pdfs")
    
    # Create scraper instance
    scraper = ArxivScraper()
    
    try:
        # Scrape all PDF links for astro-ph category
        print("Starting scraping process...")
        link_to_pdfs = scraper.scrape_monthly_arxiv("astro-ph", 2026, 1)
        
        # Save links to file
        scraper.save_links_to_file(link_to_pdfs, links_file)
        
        # Print first 10 links as example
        print("\nFirst 10 PDF links:")
        for i, link in enumerate(link_to_pdfs[:10]):
            print(f"{i+1}: {link}")
        
        # Ask user if they want to download PDFs
        if link_to_pdfs:
            response = input(f"\nFound {len(link_to_pdfs)} PDF links. Download all PDFs? (y/n): ")
            if response.lower() == 'y':
                print("\nStarting PDF downloads...")
                scraper.download_all_pdfs(link_to_pdfs, pdfs_dir, delay=True)
            else:
                print("Skipping PDF downloads.")
                
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Clean up
        scraper.quit_driver()

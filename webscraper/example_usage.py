#!/usr/bin/env python3
"""
Example usage of the ArxivScraper class
This demonstrates how to import and use the scraper from another file
"""

from scraper import ArxivScraper
import os

def main():
    """Example usage of the ArxivScraper class"""
    
    # Create an instance of the scraper
    scraper = ArxivScraper()
    
    
    # Define output paths
    base_dir = r"c:\Users\Arnav\Downloads\topical\webscraper\scraped data"
    links_file = os.path.join(base_dir, "example_links.txt")
    pdfs_dir = os.path.join(base_dir, "example_pdfs")
    
    # Example 1: Scrape a specific month/year
    print("\n1. Scraping astro-ph papers for January 2026...")
    pdf_links = scraper.scrape_monthly_arxiv("astro-ph", 2026, 1)
    print(f"Found {len(pdf_links)} papers")
    
    # Example 2: Save links to file
    print("\n2. Saving links to file...")
    scraper.save_links_to_file(pdf_links, links_file)
    
    # Example 3: Show first few links
    print("\n3. First 5 links:")
    for i, link in enumerate(pdf_links[:5]):
        print(f"   {i+1}: {link}")
    
    # Example 4: Download a few PDFs (optional)
    if pdf_links:
        response = input(f"\nDownload first 3 PDFs as example? (y/n): ")
        if response.lower() == 'y':
            print("\n4. Downloading first 3 PDFs...")
            scraper.download_all_pdfs(pdf_links[:3], pdfs_dir, delay = 1)
    
    # Always clean up the driver
    scraper.quit_driver()

if __name__ == "__main__":
    main()

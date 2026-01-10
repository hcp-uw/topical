# Copyright ©2025 Muhammadbager Al-Ali.
# CSE or UW email address: [your-email@cs.washington.edu or your-email@uw.edu]

"""
File Reader Service for reading text files and PDFs from the data directory
"""

import base64
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from io import BytesIO

# Try to import PDF libraries, handle gracefully if not installed
try:
    import fitz  # PyMuPDF
    FITZ_AVAILABLE = True
except ImportError:
    FITZ_AVAILABLE = False
    fitz = None

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    pdfplumber = None

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    Image = None


class FileReaderService:
    """
    Service for reading text files from a designated data directory
    """
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize file reader service
        
        Args:
            data_dir: Directory containing text files to read
        """
        # Get the backend directory (parent of services)
        backend_dir = Path(__file__).parent.parent
        self.data_dir = backend_dir / data_dir
        
        # Create data directory if it doesn't exist
        self.data_dir.mkdir(exist_ok=True)
    
    def read_file(self, filename: str) -> str:
        """
        Read a text file from the data directory
        
        Args:
            filename: Name of the file to read (must be in data directory)
            
        Returns:
            Contents of the file as a string
            
        Raises:
            FileNotFoundError: If file doesn't exist
        """
        # Security: Ensure filename doesn't contain path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise ValueError("Invalid filename: path traversal not allowed")
        
        file_path = self.data_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"File '{filename}' not found in data directory")
        
        if not file_path.is_file():
            raise ValueError(f"'{filename}' is not a file")
        
        # Check if it's a PDF file
        if file_path.suffix.lower() == ".pdf":
            return self._read_pdf_text(file_path)
        
        # Read as text file
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            return content.strip()
        except UnicodeDecodeError:
            # Try with different encoding if UTF-8 fails
            with open(file_path, "r", encoding="latin-1") as f:
                content = f.read()
            return content.strip()
    
    def _read_pdf_text(self, file_path: Path) -> str:
        """
        Extract text from a PDF file using pdfplumber
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text as a string
        """
        if not PDFPLUMBER_AVAILABLE:
            raise ImportError(
                "pdfplumber is not installed. Please install it with: pip install pdfplumber"
            )
        
        text_parts = []
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        
        return "\n\n".join(text_parts).strip()
    
    def extract_pdf_images(self, filename: str) -> List[Dict[str, str]]:
        """
        Extract images and graphs from a PDF file
        
        Args:
            filename: Name of the PDF file (must be in data directory)
            
        Returns:
            List of dictionaries containing base64-encoded images and metadata
            Each dict has: {'data': base64_string, 'format': 'png/jpeg', 'page': page_number}
        """
        if not FITZ_AVAILABLE:
            raise ImportError(
                "PyMuPDF (fitz) is not installed. Please install it with: pip install PyMuPDF"
            )
        
        if not PIL_AVAILABLE:
            raise ImportError(
                "Pillow (PIL) is not installed. Please install it with: pip install Pillow"
            )
        
        # Security: Ensure filename doesn't contain path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise ValueError("Invalid filename: path traversal not allowed")
        
        file_path = self.data_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"File '{filename}' not found in data directory")
        
        if file_path.suffix.lower() != ".pdf":
            raise ValueError(f"'{filename}' is not a PDF file")
        
        images = []
        pdf_document = None
        try:
            pdf_document = fitz.open(str(file_path))
            
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                
                # Extract images from the page
                image_list = page.get_images(full=True)
                
                for img_index, img in enumerate(image_list):
                    try:
                        # Get image data
                        xref = img[0]
                        base_image = pdf_document.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        
                        # Convert to PIL Image for processing
                        pil_image = Image.open(BytesIO(image_bytes))
                        
                        # Convert to PNG format for consistency (if not already)
                        if image_ext.lower() not in ["png", "jpg", "jpeg"]:
                            # Convert to PNG
                            output = BytesIO()
                            pil_image.save(output, format="PNG")
                            image_bytes = output.getvalue()
                            image_ext = "png"
                        
                        # Encode to base64
                        base64_data = base64.b64encode(image_bytes).decode("utf-8")
                        
                        # Create data URI
                        mime_type = f"image/{image_ext.lower()}" if image_ext.lower() != "jpg" else "image/jpeg"
                        data_uri = f"data:{mime_type};base64,{base64_data}"
                        
                        images.append({
                            "data": data_uri,
                            "format": image_ext.lower(),
                            "page": page_num + 1,  # 1-indexed page numbers
                            "index": img_index
                        })
                    except Exception as e:
                        # Skip images that can't be extracted
                        continue
            
        except Exception as e:
            raise ValueError(f"Error extracting images from PDF: {str(e)}")
        finally:
            if pdf_document:
                pdf_document.close()
        
        return images
    
    def read_pdf_with_images(self, filename: str) -> Tuple[str, List[Dict[str, str]]]:
        """
        Read a PDF file and extract both text and images
        
        Args:
            filename: Name of the PDF file (must be in data directory)
            
        Returns:
            Tuple of (text_content, images_list)
        """
        text = self.read_file(filename)
        images = self.extract_pdf_images(filename)
        return text, images
    
    def list_files(self) -> List[str]:
        """
        List all text and PDF files in the data directory
        
        Returns:
            List of filenames
        """
        supported_extensions = {".txt", ".md", ".text", ".pdf"}
        files = []
        
        if not self.data_dir.exists():
            return files
        
        for file_path in self.data_dir.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
                files.append(file_path.name)
        
        return sorted(files)
    
    def get_data_dir_path(self) -> Path:
        """Get the path to the data directory"""
        return self.data_dir


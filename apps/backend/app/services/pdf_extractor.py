"""
PDF text extraction service supporting multilingual documents.
Uses multilingual-pdf2text as primary extractor with PyMuPDF and pdfplumber as fallbacks.
"""
import io
import tempfile
import os
from typing import Optional

import fitz  # PyMuPDF
import pdfplumber


class PDFExtractor:
    """
    Service for extracting text from PDF files.
    Supports multilingual documents with fallback strategies.
    """
    
    @staticmethod
    def extract_text_multilingual(pdf_bytes: bytes) -> str:
        """
        Extract text using multilingual-pdf2text (best for multilingual PDFs).
        
        Args:
            pdf_bytes: PDF file content
            
        Returns:
            Extracted text
        """
        try:
            from multilingual_pdf2text.pdf2text import PDF2Text
            from multilingual_pdf2text.models.document_model.document import Document
            
            # Write bytes to temp file (library requires file path)
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
                tmp_file.write(pdf_bytes)
                tmp_path = tmp_file.name
            
            try:
                # Create document and extract
                document = Document(
                    document_path=tmp_path,
                    language='eng'  # Default to English, library auto-detects
                )
                pdf2text = PDF2Text(document=document)
                content = pdf2text.extract()
                
                # Extract text from content list
                text_parts = []
                for page_content in content:
                    if isinstance(page_content, dict) and 'text' in page_content:
                        text_parts.append(page_content['text'])
                    elif isinstance(page_content, str):
                        text_parts.append(page_content)
                
                return '\n'.join(text_parts).strip()
            finally:
                # Cleanup temp file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                
        except Exception as e:
            raise Exception(f"multilingual-pdf2text extraction failed: {str(e)}")
    
    @staticmethod
    def extract_text_pymupdf(pdf_bytes: bytes) -> str:
        """
        Extract text using PyMuPDF (fallback method).
        
        Args:
            pdf_bytes: PDF file content
            
        Returns:
            Extracted text
        """
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text()
            
            pdf_document.close()
            return text.strip()
            
        except Exception as e:
            raise Exception(f"PyMuPDF extraction failed: {str(e)}")
    
    @staticmethod
    def extract_text_pdfplumber(pdf_bytes: bytes) -> str:
        """
        Extract text using pdfplumber (secondary fallback method).
        
        Args:
            pdf_bytes: PDF file content
            
        Returns:
            Extracted text
        """
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                return text.strip()
                
        except Exception as e:
            raise Exception(f"pdfplumber extraction failed: {str(e)}")
    
    @staticmethod
    async def extract_text(pdf_bytes: bytes, fallback: bool = True) -> str:
        """
        Extract text from PDF with automatic fallback.
        Uses multilingual-pdf2text as primary, with PyMuPDF and pdfplumber as fallbacks.
        
        Args:
            pdf_bytes: PDF file content
            fallback: Use fallback methods if primary fails
            
        Returns:
            Extracted text
            
        Raises:
            Exception: If extraction fails with all methods
        """
        errors = []
        
        # Try multilingual-pdf2text first (best for multilingual documents)
        try:
            text = PDFExtractor.extract_text_multilingual(pdf_bytes)
            if text and len(text.strip()) > 50:
                return text
        except Exception as e:
            errors.append(f"multilingual-pdf2text: {str(e)}")
        
        # Fallback to PyMuPDF (fast and reliable)
        if fallback:
            try:
                text = PDFExtractor.extract_text_pymupdf(pdf_bytes)
                if text and len(text.strip()) > 50:
                    return text
            except Exception as e:
                errors.append(f"PyMuPDF: {str(e)}")
        
        # Final fallback to pdfplumber (handles complex layouts)
        if fallback:
            try:
                text = PDFExtractor.extract_text_pdfplumber(pdf_bytes)
                if text and len(text.strip()) > 0:
                    return text
            except Exception as e:
                errors.append(f"pdfplumber: {str(e)}")
        
        # If we got some text but it was short, return it anyway
        if text:
            return text
        
        raise Exception(f"Failed to extract text from PDF. Errors: {'; '.join(errors)}")
    
    @staticmethod
    def is_valid_pdf(pdf_bytes: bytes) -> bool:
        """
        Check if bytes represent a valid PDF.
        
        Args:
            pdf_bytes: File content
            
        Returns:
            True if valid PDF
        """
        try:
            fitz.open(stream=pdf_bytes, filetype="pdf")
            return True
        except:
            return False


# Global PDF extractor instance
pdf_extractor = PDFExtractor()

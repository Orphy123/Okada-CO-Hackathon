import io
import os
from typing import List, Tuple
from PyPDF2 import PdfReader
from docx import Document
import chardet

def detect_encoding(file_content: bytes) -> str:
    """Detect file encoding"""
    result = chardet.detect(file_content)
    return result['encoding'] or 'utf-8'

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end > len(text):
            end = len(text)
        
        chunk = text[start:end]
        chunks.append(chunk)
        
        if end == len(text):
            break
        
        start = end - overlap
    
    return chunks

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF"""
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error processing PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX"""
    try:
        doc_file = io.BytesIO(file_content)
        doc = Document(doc_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error processing DOCX: {str(e)}")

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT file"""
    try:
        encoding = detect_encoding(file_content)
        return file_content.decode(encoding)
    except Exception as e:
        raise ValueError(f"Error processing TXT: {str(e)}")

def process_document(filename: str, file_content: bytes) -> Tuple[str, List[str]]:
    """Process a document and return extracted text and chunks"""
    file_ext = os.path.splitext(filename)[1].lower()
    
    if file_ext == '.pdf':
        text = extract_text_from_pdf(file_content)
    elif file_ext == '.docx':
        text = extract_text_from_docx(file_content)
    elif file_ext == '.txt':
        text = extract_text_from_txt(file_content)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")
    
    if not text.strip():
        raise ValueError("No text content found in document")
    
    # Create chunks for large documents
    chunks = chunk_text(text, chunk_size=1000, overlap=200)
    
    return text, chunks 
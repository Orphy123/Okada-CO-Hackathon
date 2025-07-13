from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import pandas as pd
import json
import io
from app.rag import add_documents, get_documents_list, delete_document, clear_knowledge_base

upload_router = APIRouter()

def extract_text_from_file(file: UploadFile) -> List[str]:
    """Extract text content from uploaded file based on file type"""
    ext = os.path.splitext(file.filename)[1].lower()
    contents = file.file.read()

    if ext == ".txt":
        text = contents.decode("utf-8")
        return [line.strip() for line in text.split("\n") if line.strip()]
    elif ext == ".csv":
        # Reset file pointer for pandas
        file.file.seek(0)
        df = pd.read_csv(file.file)
        return [row.to_json() for _, row in df.iterrows()]
    elif ext == ".json":
        data = json.loads(contents.decode("utf-8"))
        if isinstance(data, list):
            return [json.dumps(entry) for entry in data]
        elif isinstance(data, dict):
            return [json.dumps(data)]
        else:
            raise HTTPException(status_code=400, detail="Unsupported JSON format.")
    elif ext == ".pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(contents))
            text_chunks = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_chunks.extend([line.strip() for line in text.split("\n") if line.strip()])
            return text_chunks
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF parsing error: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

@upload_router.post("/upload_docs")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process multiple documents into the knowledge base"""
    all_chunks = []
    failed_files = []
    processed_files = []
    
    for file in files:
        try:
            chunks = extract_text_from_file(file)
            # Get file size
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset to beginning
            
            # Add documents with metadata
            add_documents(chunks, filename=file.filename, file_size=file_size)
            processed_files.append({
                "filename": file.filename,
                "chunks": len(chunks),
                "size": file_size
            })
            all_chunks.extend(chunks)
        except Exception as e:
            failed_files.append(f"{file.filename}: {str(e)}")

    if processed_files:
        return {
            "message": f"Successfully processed {len(processed_files)} files",
            "files_processed": len(processed_files),
            "chunks_added": len(all_chunks),
            "failed_files": failed_files,
            "processed_files": processed_files
        }
    else:
        raise HTTPException(status_code=400, detail="No valid text extracted from files.")

@upload_router.post("/add-documents")
async def add_text_documents(documents: dict):
    """Add text documents directly via JSON payload"""
    if "documents" not in documents:
        raise HTTPException(status_code=400, detail="Missing 'documents' field")
    
    docs = documents["documents"]
    if not isinstance(docs, list):
        raise HTTPException(status_code=400, detail="Documents must be a list")
    
    add_documents(docs, filename="manual_input.json")
    return {"message": f"Added {len(docs)} documents to knowledge base"}

@upload_router.get("/documents")
async def list_documents():
    """Get list of all uploaded documents"""
    documents = get_documents_list()
    return {"documents": documents}

@upload_router.delete("/documents/{document_id}")
async def delete_document_endpoint(document_id: int):
    """Delete a specific document from the knowledge base"""
    try:
        result = delete_document(document_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@upload_router.delete("/documents")
async def clear_all_documents():
    """Clear all documents from the knowledge base"""
    try:
        result = clear_knowledge_base()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing knowledge base: {str(e)}") 
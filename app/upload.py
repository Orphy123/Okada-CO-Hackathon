from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import pandas as pd
import json
import io
from app.rag import add_documents

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
    
    for file in files:
        try:
            chunks = extract_text_from_file(file)
            all_chunks.extend(chunks)
        except Exception as e:
            failed_files.append(f"{file.filename}: {str(e)}")

    if all_chunks:
        add_documents(all_chunks)
        return {
            "message": f"Successfully processed {len(files)} files",
            "files_processed": len(files) - len(failed_files),
            "chunks_added": len(all_chunks),
            "failed_files": failed_files
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
    
    add_documents(docs)
    return {"message": f"Added {len(docs)} documents to knowledge base"} 
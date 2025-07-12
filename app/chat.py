from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from app.rag import query_knowledge_base, add_documents
from app.document_processor import process_document
from typing import List, Optional

load_dotenv()

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

chat_endpoint = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    use_rag: bool = True  # Optional flag to enable/disable RAG

class ChatResponse(BaseModel):
    response: str
    context_used: bool = False  # Indicates if RAG context was used

class DocumentRequest(BaseModel):
    documents: List[str]

class DocumentResponse(BaseModel):
    message: str
    documents_added: int

class UploadResponse(BaseModel):
    message: str
    files_processed: int
    chunks_added: int
    failed_files: List[str]

@chat_endpoint.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Initialize the messages for the chat completion
        messages = []
        context_used = False
        
        # If RAG is enabled, query the knowledge base
        if request.use_rag:
            relevant_docs = query_knowledge_base(request.message, top_k=3)
            if relevant_docs:
                # Create a context from the relevant documents
                context = "\n".join([f"- {doc}" for doc in relevant_docs])
                system_message = f"""You are a helpful assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, you can use your general knowledge but mention that you're supplementing with general knowledge.

Context from knowledge base:
{context}

Please provide a helpful and accurate response based on this context."""
                messages.append({"role": "system", "content": system_message})
                context_used = True
        
        # Add the user's message
        messages.append({"role": "user", "content": request.message})
        
        # Get response from OpenAI
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        response = completion.choices[0].message.content.strip()
        
        return {
            "response": response,
            "context_used": context_used
        }
    except Exception as e:
        return {
            "response": f"Error: {str(e)}",
            "context_used": False
        }

@chat_endpoint.post("/add-documents", response_model=DocumentResponse)
async def add_documents_endpoint(request: DocumentRequest):
    try:
        add_documents(request.documents)
        return {
            "message": "Documents added successfully to knowledge base",
            "documents_added": len(request.documents)
        }
    except Exception as e:
        return {
            "message": f"Error adding documents: {str(e)}",
            "documents_added": 0
        }

@chat_endpoint.post("/upload_docs", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process multiple documents"""
    processed_files = 0
    total_chunks = 0
    failed_files = []
    all_chunks = []
    
    for file in files:
        try:
            # Read file content
            file_content = await file.read()
            
            # Process document
            text, chunks = process_document(file.filename, file_content)
            
            # Add metadata to chunks
            enhanced_chunks = []
            for i, chunk in enumerate(chunks):
                enhanced_chunk = f"[Source: {file.filename}, Part {i+1}]\n{chunk}"
                enhanced_chunks.append(enhanced_chunk)
            
            all_chunks.extend(enhanced_chunks)
            processed_files += 1
            total_chunks += len(chunks)
            
        except Exception as e:
            failed_files.append(f"{file.filename}: {str(e)}")
    
    # Add all chunks to knowledge base
    if all_chunks:
        add_documents(all_chunks)
    
    return {
        "message": f"Successfully processed {processed_files} files",
        "files_processed": processed_files,
        "chunks_added": total_chunks,
        "failed_files": failed_files
    }

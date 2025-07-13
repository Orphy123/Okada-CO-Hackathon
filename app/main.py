from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.chat import chat_endpoint
from app.chat_history import history_router
from app.crm_routes import crm_router
from app.upload import upload_router
from app.analyze import analyze_router
from app.rag import load_knowledge_base

app = FastAPI(
    title="RAG-Enabled Real Estate AI Assistant",
    description="A conversational AI chatbot with RAG capabilities and natural language portfolio analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load knowledge base on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the knowledge base when the app starts"""
    try:
        load_knowledge_base()
        print("Knowledge base loaded successfully")
    except Exception as e:
        print(f"Warning: Failed to load knowledge base: {e}")

app.include_router(chat_endpoint, prefix="/chat", tags=["Chat"])
app.include_router(history_router, prefix="/history", tags=["Chat History"])
app.include_router(crm_router, tags=["CRM"])
app.include_router(upload_router, prefix="/chat", tags=["Upload"])
app.include_router(analyze_router, prefix="/analyze", tags=["Portfolio Analysis"])

@app.get("/")
async def root():
    return {
        "message": "RAG-Enabled Real Estate AI Assistant", 
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat/",
            "chat_history": "/history/sessions/",
            "portfolio_analysis": "/analyze/analyze_portfolio",
            "portfolio_stats": "/analyze/portfolio_stats",
            "upload_docs": "/chat/upload_docs",
            "list_docs": "/chat/documents",
            "delete_doc": "/chat/documents/{doc_id}",
            "api_docs": "/docs"
        }
    }

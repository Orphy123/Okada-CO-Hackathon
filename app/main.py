from fastapi import FastAPI
from app.chat import chat_endpoint
from app.crm_routes import crm_router

app = FastAPI()

app.include_router(chat_endpoint, prefix="/chat", tags=["Chat"])
app.include_router(crm_router, tags=["CRM"])

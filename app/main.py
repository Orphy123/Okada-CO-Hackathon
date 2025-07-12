from fastapi import FastAPI
from app.chat import chat_endpoint

app = FastAPI()

app.include_router(chat_endpoint, prefix="/chat", tags=["Chat"])

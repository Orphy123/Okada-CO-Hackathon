from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.crm import SessionLocal, Conversation
from app.rag import query_knowledge_base

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

chat_endpoint = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str

@chat_endpoint.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Step 1: Retrieve past conversation (last 5 messages per role)
    previous_messages = (
        db.query(Conversation)
        .filter(Conversation.user_id == request.user_id)
        .order_by(Conversation.timestamp.desc())
        .limit(10)
        .all()
    )
    history = [
        {"role": msg.role, "content": msg.message}
        for msg in reversed(previous_messages)
    ]

    # Step 2: Add current user message
    history.append({"role": "user", "content": request.message})

    # Step 3: Add relevant context from RAG
    context_docs = query_knowledge_base(request.message)
    context = "\n".join(context_docs)
    history.insert(0, {"role": "system", "content": "Use the following context if helpful:\n" + context})

    # Step 4: Get LLM response
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=history
        )
        response = completion.choices[0].message["content"].strip()
    except Exception as e:
        response = f"Error: {str(e)}"

    # Step 5: Log both user and assistant messages
    db.add(Conversation(user_id=request.user_id, message=request.message, role="user"))
    db.add(Conversation(user_id=request.user_id, message=response, role="assistant"))
    db.commit()

    return {"response": response}

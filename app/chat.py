from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional
from app.crm import SessionLocal, User, Conversation, ChatSession
from app.rag import query_knowledge_base

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

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
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

def auto_tag_response(text: str) -> str:
    keywords = ["the rent is", "you can find it at", "is available at", "it is located", "yes", "no", "sure", "certainly"]
    text_lower = text.lower()
    if any(kw in text_lower for kw in keywords):
        return "Resolved"
    return "Inquiring"

def generate_session_title(first_message: str) -> str:
    """Generate a session title from the first user message"""
    # Take first 50 characters and add ellipsis if longer
    if len(first_message) > 50:
        return first_message[:50] + "..."
    return first_message

@chat_endpoint.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Step 1: Ensure user exists
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            # Auto-create user if they don't exist
            user = User(
                id=request.user_id,
                name=f"User {request.user_id}",
                email=f"{request.user_id}@example.com"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Step 2: Get or create session
        session = None
        if request.session_id:
            session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
        
        if not session:
            # Create a new session
            session_title = generate_session_title(request.message)
            session = ChatSession(
                user_id=request.user_id,
                title=session_title
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        else:
            # Update session timestamp
            session.updated_at = datetime.utcnow()
            db.commit()

        # Step 3: Retrieve past conversation from this session (last 10 messages)
        previous_messages = (
            db.query(Conversation)
            .filter(Conversation.session_id == session.id)
            .order_by(Conversation.timestamp.desc())
            .limit(10)
            .all()
        )
        history = [
            {"role": msg.role, "content": msg.message}
            for msg in reversed(previous_messages)
        ]

        # Step 4: Add current user message
        history.append({"role": "user", "content": request.message})

        # Step 5: Add relevant context from RAG (with error handling)
        try:
            context_docs = query_knowledge_base(request.message)
            context = "\n".join(context_docs)
            if context:
                history.insert(0, {"role": "system", "content": "Use the following context if helpful:\n" + context})
        except Exception as e:
            print(f"RAG query error: {e}")
            # Continue without context if RAG fails

        # Step 6: Get LLM response
        try:
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=history
            )
            response = completion.choices[0].message.content.strip()
        except Exception as e:
            response = f"Error: {str(e)}"

        # Step 7: Log user message and assistant response with session_id
        db.add(Conversation(
            user_id=request.user_id, 
            session_id=session.id,
            message=request.message, 
            role="user", 
            tag="Inquiring"
        ))
        assistant_tag = auto_tag_response(response)
        db.add(Conversation(
            user_id=request.user_id, 
            session_id=session.id,
            message=response, 
            role="assistant", 
            tag=assistant_tag
        ))
        db.commit()

        return {"response": response, "session_id": session.id}
    
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        import traceback
        traceback.print_exc()
        raise e

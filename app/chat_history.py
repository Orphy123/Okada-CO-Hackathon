from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid

from app.crm import SessionLocal, User, ChatSession, Conversation

history_router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for request/response
class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int

class ConversationResponse(BaseModel):
    id: str
    message: str
    role: str
    timestamp: datetime
    tag: str

class SessionWithConversations(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    conversations: List[ConversationResponse]

class CreateSessionRequest(BaseModel):
    user_id: str
    title: Optional[str] = None

class UpdateSessionRequest(BaseModel):
    title: str

def generate_session_title(first_message: str) -> str:
    """Generate a session title from the first user message"""
    # Take first 50 characters and add ellipsis if longer
    if len(first_message) > 50:
        return first_message[:50] + "..."
    return first_message

@history_router.get("/sessions/{user_id}", response_model=List[SessionResponse])
async def get_user_sessions(user_id: str, db: Session = Depends(get_db)):
    """Get all chat sessions for a user, ordered by most recent first"""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(desc(ChatSession.updated_at))
        .all()
    )
    
    session_responses = []
    for session in sessions:
        message_count = (
            db.query(Conversation)
            .filter(Conversation.session_id == session.id)
            .count()
        )
        
        session_responses.append(SessionResponse(
            id=session.id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=message_count
        ))
    
    return session_responses

@history_router.get("/current/{user_id}")
async def get_current_session(user_id: str, db: Session = Depends(get_db)):
    """Get the user's current active session or create a new one"""
    # Check if user exists, create if not
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Auto-create user if they don't exist
        user = User(
            id=user_id,
            name=f"User {user_id}",
            email=f"{user_id}@example.com"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Get the most recent session
    session = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(desc(ChatSession.updated_at))
        .first()
    )
    
    if not session:
        # Create a new session if none exists
        session = ChatSession(
            user_id=user_id,
            title="New Chat"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    
    return {"session_id": session.id, "title": session.title}

@history_router.get("/sessions/{user_id}/{session_id}", response_model=SessionWithConversations)
async def get_session_with_conversations(user_id: str, session_id: str, db: Session = Depends(get_db)):
    """Get a specific session with all its conversations"""
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
        .first()
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    conversations = (
        db.query(Conversation)
        .filter(Conversation.session_id == session_id)
        .order_by(Conversation.timestamp)
        .all()
    )
    
    conversation_responses = [
        ConversationResponse(
            id=conv.id,
            message=conv.message,
            role=conv.role,
            timestamp=conv.timestamp,
            tag=conv.tag
        )
        for conv in conversations
    ]
    
    return SessionWithConversations(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        conversations=conversation_responses
    )

@history_router.post("/sessions/create", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest, db: Session = Depends(get_db)):
    """Create a new chat session"""
    # Check if user exists, create if not
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
    
    session = ChatSession(
        user_id=request.user_id,
        title=request.title or "New Chat"
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return SessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0
    )

@history_router.put("/sessions/{session_id}/title")
async def update_session_title(session_id: str, request: UpdateSessionRequest, db: Session = Depends(get_db)):
    """Update a session's title"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.title = request.title
    session.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Session title updated successfully"}

@history_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a chat session and all its conversations"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete all conversations in this session
    db.query(Conversation).filter(Conversation.session_id == session_id).delete()
    
    # Delete the session
    db.delete(session)
    db.commit()
    
    return {"message": "Session deleted successfully"} 
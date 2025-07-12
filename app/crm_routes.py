from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.crm import SessionLocal, User, Conversation

crm_router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    preferences: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    preferences: Optional[str] = None

class ConversationResponse(BaseModel):
    message: str
    role: str
    timestamp: str

# Create User
@crm_router.post("/crm/create_user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        name=user.name,
        email=user.email,
        company=user.company,
        preferences=user.preferences
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"user_id": db_user.id, "message": "User created successfully."}

# Update User
@crm_router.put("/crm/update_user/{user_id}")
def update_user(user_id: str, updates: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    return {"message": "User updated successfully."}

# Get conversations for a user
@crm_router.get("/crm/conversations/{user_id}", response_model=List[ConversationResponse])
def get_conversations(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return [
        {"message": conv.message, "role": conv.role, "timestamp": conv.timestamp.isoformat()}
        for conv in user.conversations
    ]

# Reset (optional): clears all users and conversations
@crm_router.post("/crm/reset")
def reset_database(db: Session = Depends(get_db)):
    db.query(Conversation).delete()
    db.query(User).delete()
    db.commit()
    return {"message": "CRM reset successful."} 
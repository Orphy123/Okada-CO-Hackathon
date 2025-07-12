from pathlib import Path
import os

# Define a base project structure for Phase 1: Core Chatbot with RAG
project_structure = {
    "app": [
        "main.py",  # FastAPI app entry point
        "chat.py",  # Chat endpoint and logic
        "rag.py",   # RAG logic
        "__init__.py"
    ],
    "data": [],  # Placeholder for knowledge base documents
    "models": [],  # Future model files
    "requirements.txt": None,
    ".env": None,
    "README.md": None
}

def create_project_structure():
    """Create the project structure in the current directory."""
    base_path = Path(".")
    
    for folder, files in project_structure.items():
        if isinstance(files, list):
            dir_path = base_path / folder
            dir_path.mkdir(parents=True, exist_ok=True)
            for file in files:
                (dir_path / file).touch()
        else:
            (base_path / folder).touch()
    
    print("Project structure created successfully!")
    print("\nCreated files and directories:")
    for path in sorted(base_path.rglob("*")):
        if path.name != "setup_project.py":  # Don't include the setup script itself
            print(f"  {path}")
    
    return base_path.exists()

if __name__ == "__main__":
    create_project_structure() 
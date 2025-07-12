import os
import pickle
import json
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Knowledge base path
DOCS_FILE = "data/documents.pkl"
VECTORIZER_FILE = "data/vectorizer.pkl"
TFIDF_MATRIX_FILE = "data/tfidf_matrix.pkl"

# Global in-memory storage
document_chunks = []
vectorizer = None
tfidf_matrix = None

def load_knowledge_base():
    """Load the knowledge base from disk"""
    global document_chunks, vectorizer, tfidf_matrix
    
    if os.path.exists(DOCS_FILE) and os.path.exists(VECTORIZER_FILE) and os.path.exists(TFIDF_MATRIX_FILE):
        # Load documents
        with open(DOCS_FILE, "rb") as f:
            document_chunks = pickle.load(f)
        
        # Load vectorizer
        with open(VECTORIZER_FILE, "rb") as f:
            vectorizer = pickle.load(f)
        
        # Load TF-IDF matrix
        with open(TFIDF_MATRIX_FILE, "rb") as f:
            tfidf_matrix = pickle.load(f)
    else:
        # Initialize empty knowledge base
        document_chunks = []
        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        tfidf_matrix = None

def save_knowledge_base():
    """Save the knowledge base to disk"""
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    # Save documents
    with open(DOCS_FILE, "wb") as f:
        pickle.dump(document_chunks, f)
    
    # Save vectorizer
    with open(VECTORIZER_FILE, "wb") as f:
        pickle.dump(vectorizer, f)
    
    # Save TF-IDF matrix
    if tfidf_matrix is not None:
        with open(TFIDF_MATRIX_FILE, "wb") as f:
            pickle.dump(tfidf_matrix, f)

def add_documents(texts: List[str]):
    """Add documents to the knowledge base"""
    global document_chunks, vectorizer, tfidf_matrix
    
    # Add new documents
    document_chunks.extend(texts)
    
    # Refit vectorizer and compute TF-IDF matrix
    if len(document_chunks) > 0:
        tfidf_matrix = vectorizer.fit_transform(document_chunks)
        save_knowledge_base()

def query_knowledge_base(query: str, top_k: int = 3) -> List[str]:
    """Query the knowledge base for relevant documents"""
    global document_chunks, vectorizer, tfidf_matrix
    
    if not document_chunks or tfidf_matrix is None:
        return []
    
    try:
        # Transform query using the same vectorizer
        query_vector = vectorizer.transform([query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
        
        # Get top-k most similar documents
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Filter out documents with very low similarity (threshold: 0.1)
        relevant_docs = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Only include if similarity > 0.1
                relevant_docs.append(document_chunks[idx])
        
        return relevant_docs
    except Exception as e:
        print(f"Error querying knowledge base: {e}")
        return []

def get_knowledge_base_stats():
    """Get statistics about the knowledge base"""
    return {
        "total_documents": len(document_chunks),
        "has_vectorizer": vectorizer is not None,
        "has_tfidf_matrix": tfidf_matrix is not None
    }

# Load knowledge base on import
load_knowledge_base()

import os
import pickle
import json
import re
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

def extract_numerical_criteria(query: str):
    """Extract numerical criteria from query"""
    criteria = {}
    
    # Extract size criteria (SF)
    size_patterns = [
        r'above\s+(\d+,?\d*)\s*SF',
        r'over\s+(\d+,?\d*)\s*SF',
        r'larger\s+than\s+(\d+,?\d*)\s*SF',
        r'more\s+than\s+(\d+,?\d*)\s*SF',
        r'>\s*(\d+,?\d*)\s*SF'
    ]
    
    for pattern in size_patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            criteria['min_size'] = int(match.group(1).replace(',', ''))
            break
    
    # Extract rent criteria ($/SF)
    rent_patterns = [
        r'below\s+\$(\d+)(?:/SF)?',
        r'under\s+\$(\d+)(?:/SF)?',
        r'less\s+than\s+\$(\d+)(?:/SF)?',
        r'<\s*\$(\d+)(?:/SF)?'
    ]
    
    for pattern in rent_patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            criteria['max_rent'] = int(match.group(1))
            break
    
    return criteria

def filter_by_criteria(documents: List[str], criteria: dict) -> List[str]:
    """Filter documents based on numerical criteria"""
    filtered_docs = []
    
    for doc in documents:
        # Extract size from document
        size_match = re.search(r'offers\s+(\d+,?\d*)\s*SF', doc)
        if size_match:
            size = int(size_match.group(1).replace(',', ''))
            
            # Check size criteria
            if 'min_size' in criteria and size <= criteria['min_size']:
                continue
        
        # Extract rent from document  
        rent_match = re.search(r'at\s+\$(\d+\.?\d*)\s*per\s+year', doc)
        if rent_match:
            rent = float(rent_match.group(1))
            
            # Check rent criteria
            if 'max_rent' in criteria and rent >= criteria['max_rent']:
                continue
        
        filtered_docs.append(doc)
    
    return filtered_docs

def query_knowledge_base(query: str, top_k: int = 3) -> List[str]:
    """Query the knowledge base for relevant documents with improved numerical handling"""
    global document_chunks, vectorizer, tfidf_matrix
    
    if not document_chunks or tfidf_matrix is None:
        return []
    
    try:
        # Extract numerical criteria from query
        criteria = extract_numerical_criteria(query)
        
        # Transform query using the same vectorizer
        query_vector = vectorizer.transform([query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
        
        # For numerical queries, search through a much larger pool
        if criteria:
            # Search through top 50% of documents for numerical queries
            search_k = min(len(document_chunks) // 2, 100)
            top_indices = np.argsort(similarities)[-search_k:][::-1]
            
            # Get all candidate documents with very low threshold for numerical queries
            candidate_docs = []
            for idx in top_indices:
                if similarities[idx] > 0.01:  # Very low threshold for numerical queries
                    candidate_docs.append(document_chunks[idx])
            
            # Apply numerical filtering
            filtered_docs = filter_by_criteria(candidate_docs, criteria)
            if filtered_docs:
                return filtered_docs[:top_k]
            
            # If no exact matches, return closest matches with explanation
            # Let the AI know these are close matches, not exact matches
            return candidate_docs[:top_k]
        else:
            # For non-numerical queries, use standard approach
            search_k = top_k
            top_indices = np.argsort(similarities)[-search_k:][::-1]
        
        # If no numerical criteria or no matches, return top similarity matches
        relevant_docs = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Standard threshold for non-numerical queries
                relevant_docs.append(document_chunks[idx])
                if len(relevant_docs) >= top_k:
                    break
        
        # If we found good matches, return them
        if relevant_docs:
            return relevant_docs
        
        # If no good matches found, use lower threshold to get some results
        # This helps with queries like "high GCI potential" that might not match well
        for idx in top_indices:
            if similarities[idx] > 0.05:  # Lower threshold for fallback
                relevant_docs.append(document_chunks[idx])
                if len(relevant_docs) >= top_k:
                    break
        
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

import sys
import os

# Add the app directory to the path so we can import rag
sys.path.append('app')
from rag import query_knowledge_base, get_knowledge_base_stats

def test_rag_queries():
    """Test various queries to verify the RAG system is working correctly"""
    
    print("Current knowledge base stats:")
    stats = get_knowledge_base_stats()
    print(f"  Total documents: {stats['total_documents']}")
    print(f"  Has vectorizer: {stats['has_vectorizer']}")
    print(f"  Has TF-IDF matrix: {stats['has_tfidf_matrix']}")
    
    # Test queries
    test_queries = [
        "Properties in Times Square",
        "Suites handled by Jack Sparrow",
        "Properties with monthly rent over $150,000",
        "Broadway properties",
        "Properties on 5th Avenue",
        "What properties are available in Midtown?"
    ]
    
    print("\n" + "="*60)
    print("Testing RAG Knowledge Base Queries")
    print("="*60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\nQuery {i}: {query}")
        print("-" * 50)
        
        try:
            results = query_knowledge_base(query, top_k=3)
            
            if results:
                print(f"Found {len(results)} relevant results:")
                for j, result in enumerate(results, 1):
                    print(f"\nResult {j}:")
                    print(result)
            else:
                print("No relevant results found.")
                
        except Exception as e:
            print(f"Error querying knowledge base: {e}")
    
    print("\n" + "="*60)
    print("RAG testing completed!")

if __name__ == "__main__":
    test_rag_queries() 
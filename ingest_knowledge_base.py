import pandas as pd
import random
import sys
import os

# Add the app directory to the path so we can import rag
sys.path.append('app')
from rag import add_documents, get_knowledge_base_stats

def format_row(row):
    """Convert each row into a descriptive text chunk for the RAG knowledge base"""
    return (
        f"Suite {row['Suite']} at {row['Property Address']} (Floor {row['Floor']}) "
        f"offers {row['Size (SF)']} SF at {row['Rent/SF/Year']} per year. "
        f"Monthly rent is {row['Monthly Rent']}. "
        f"Annual rent is {row['Annual Rent']}. "
        f"GCI on 3 years is {row['GCI On 3 Years']}. "
        f"Handled by {row['Associate 1']} (Email: {row['BROKER Email ID']}), "
        f"with support from {row['Associate 2']}, {row['Associate 3']}, and {row['Associate 4']}."
    )

def main():
    print("Loading CSV data...")
    
    # Load the CSV file
    csv_path = "data/HackathonInternalKnowledgeBase.csv"
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
    
    try:
        df = pd.read_csv(csv_path)
        print(f"Successfully loaded {len(df)} rows from CSV")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return
    
    # Get initial knowledge base stats
    initial_stats = get_knowledge_base_stats()
    print(f"Initial knowledge base stats: {initial_stats}")
    
    # Generate formatted knowledge chunks
    print("Formatting data into knowledge chunks...")
    knowledge_chunks = []
    
    for _, row in df.iterrows():
        try:
            formatted_chunk = format_row(row)
            knowledge_chunks.append(formatted_chunk)
        except Exception as e:
            print(f"Error formatting row {row.get('unique_id', 'unknown')}: {e}")
            continue
    
    print(f"Successfully formatted {len(knowledge_chunks)} knowledge chunks")
    
    # Preview a few sample chunks
    print("\nSample knowledge chunks:")
    sample_preview = random.sample(knowledge_chunks, min(3, len(knowledge_chunks)))
    for i, chunk in enumerate(sample_preview, 1):
        print(f"\nSample {i}:")
        print(chunk)
    
    # Ingest the chunks into the RAG system with metadata
    print(f"\nIngesting {len(knowledge_chunks)} chunks into RAG system...")
    try:
        # Calculate approximate file size based on text content
        total_text = '\n'.join(knowledge_chunks)
        file_size = len(total_text.encode('utf-8'))
        
        add_documents(
            knowledge_chunks, 
            filename="HackathonInternalKnowledgeBase.csv",
            file_size=file_size
        )
        print("Successfully ingested all chunks into RAG system!")
    except Exception as e:
        print(f"Error ingesting chunks: {e}")
        return
    
    # Get final knowledge base stats
    final_stats = get_knowledge_base_stats()
    print(f"\nFinal knowledge base stats: {final_stats}")
    
    print("\nKnowledge base ingestion completed successfully!")

if __name__ == "__main__":
    main() 
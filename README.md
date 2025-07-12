# RAG-Enabled Conversational AI Chatbot

A modern, fast conversational AI chatbot built with FastAPI that implements Retrieval-Augmented Generation (RAG) to provide context-aware responses based on your knowledge base.

## Features

### 🚀 Core Functionality
- **FastAPI Backend**: High-performance API with automatic interactive documentation
- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
- **RAG System**: Retrieval-Augmented Generation for context-aware answers
- **Multi-format Document Support**: Upload PDF, DOCX, and TXT files
- **Smart Document Processing**: Automatic text extraction and chunking
- **Semantic Search**: TF-IDF vectorization for efficient document retrieval

### 🏢 **Natural Language Portfolio Analyzer** (NEW!)
- **Natural Language Queries**: "Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years"
- **Intelligent Data Filtering**: Automatically parses queries and applies structured filters
- **AI-Generated Summaries**: Comprehensive insights and analysis of filtered results
- **Real Estate Data Integration**: Works with commercial property CSV data
- **Portfolio Statistics**: Overview metrics and performance indicators

### 📋 API Endpoints
- `POST /chat/` - Chat with the AI (with optional RAG)
- `POST /chat/upload_docs` - Upload documents to knowledge base
- `POST /chat/add-documents` - Add text documents via JSON
- `POST /analyze/analyze_portfolio` - **NEW!** Natural language portfolio analysis
- `GET /analyze/portfolio_stats` - **NEW!** Portfolio statistics and metrics
- `GET /docs` - Interactive API documentation

### 🔧 Technical Stack
- **Backend**: FastAPI + Uvicorn
- **AI**: OpenAI GPT-3.5-turbo
- **RAG**: scikit-learn TF-IDF + cosine similarity
- **Document Processing**: PyPDF2, python-docx, chardet
- **Data Storage**: Pickle files for persistent knowledge base

## Installation

### Prerequisites
- Python 3.7+
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Orphy123/OkadaHackathon.git
   cd OkadaHackathon
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
   ```

4. **Start the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Access the application**
   - API: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs

## Usage

### Chat with AI

```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "What is FastAPI?",
    "use_rag": true
  }'
```

### Upload Documents

```bash
# Single file
curl -X POST "http://localhost:8000/chat/upload_docs" \
  -F "files=@document.pdf"

# Multiple files
curl -X POST "http://localhost:8000/chat/upload_docs" \
  -F "files=@doc1.pdf" \
  -F "files=@doc2.docx" \
  -F "files=@doc3.txt"
```

### Add Documents via JSON

```bash
curl -X POST "http://localhost:8000/chat/add-documents" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      "FastAPI is a modern web framework for building APIs with Python.",
      "RAG combines information retrieval with language generation."
    ]
  }'
```

### Portfolio Analysis (NEW!)

```bash
# Natural language portfolio query
curl -X POST "http://localhost:8000/analyze/analyze_portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "investor_123",
    "query": "Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years"
  }'

# Get portfolio statistics
curl -X GET "http://localhost:8000/analyze/portfolio_stats"
```

## Project Structure

```
okadaHack/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── chat.py                    # Chat and upload endpoints
│   ├── rag.py                     # RAG system implementation
│   └── document_processor.py      # Document processing utilities
├── data/                          # Knowledge base storage
│   ├── documents.pkl              # Stored documents
│   ├── vectorizer.pkl             # TF-IDF vectorizer
│   └── tfidf_matrix.pkl           # Document vectors
├── requirements.txt               # Python dependencies
├── .env                          # Environment variables (not in repo)
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## API Reference

### Chat Endpoint

**POST** `/chat/`

**Request Body:**
```json
{
  "user_id": "string",
  "message": "string",
  "use_rag": true
}
```

**Response:**
```json
{
  "response": "string",
  "context_used": true
}
```

### Upload Documents Endpoint

**POST** `/chat/upload_docs`

**Request:** `multipart/form-data`
- `files`: Array of files (PDF, DOCX, TXT)

**Response:**
```json
{
  "message": "Successfully processed 2 files",
  "files_processed": 2,
  "chunks_added": 4,
  "failed_files": []
}
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

### RAG Configuration

The RAG system can be configured in `app/rag.py`:
- `chunk_size`: Size of text chunks (default: 1000)
- `overlap`: Overlap between chunks (default: 200)
- `top_k`: Number of documents to retrieve (default: 3)
- `similarity_threshold`: Minimum similarity score (default: 0.1)


## Development

### Running in Development Mode

```bash
uvicorn app.main:app --reload --port 8000
```

### Adding New Document Types

1. Add extraction function in `app/document_processor.py`
2. Update `process_document()` function
3. Add file extension to supported formats

### Testing

Access the interactive API documentation at http://localhost:8000/docs to test all endpoints.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using FastAPI, OpenAI, and modern Python practices.

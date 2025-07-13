# 🏢 AI Real Estate Portfolio Assistant

A modern, intelligent conversational AI chatbot built with FastAPI that combines Retrieval-Augmented Generation (RAG) with natural language portfolio analysis for commercial real estate.


## ✨ Features

### 🤖 Core AI Capabilities
- **RAG-Powered Chat**: Context-aware responses using uploaded documents
- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent conversations
- **Multi-format Document Support**: PDF, DOCX, TXT, CSV, JSON
- **Semantic Search**: TF-IDF vectorization for efficient document retrieval

### 🏢 Portfolio Analysis
- **Natural Language Queries**: "Show me properties above 15,000 SF with rent below $90/SF"
- **Intelligent Data Filtering**: Automatic query parsing and structured filtering
- **AI-Generated Insights**: Comprehensive analysis and summaries
- **Portfolio Statistics**: Performance metrics and overview data

### 💼 CRM Integration
- **Conversation Logging**: All interactions stored in SQLite database
- **User Management**: Complete user tracking and session management
- **Message Tagging**: Automatic categorization of conversations
- **History Persistence**: Conversation continuity across sessions

### 📊 Analytics Dashboard
- **Portfolio Statistics**: Real-time property metrics
- **Interactive Charts**: Visual data representation
- **Export Capabilities**: Data export in multiple formats
- **Performance Tracking**: Investment analysis tools

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance async API framework
- **SQLAlchemy**: Database ORM with SQLite
- **OpenAI API**: GPT-3.5-turbo for AI responses
- **scikit-learn**: Machine learning for document similarity
- **Pandas**: Data manipulation and analysis
- **Uvicorn**: ASGI server for production

### Frontend


### AI & ML
- **OpenAI GPT-3.5**: Language model for conversations
- **TF-IDF Vectorization**: Document similarity search
- **Natural Language Processing**: Query parsing and analysis
- **RAG Architecture**: Retrieval-Augmented Generation

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- OpenAI API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Orphy123/okadatrial.git
   cd okadatrial
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
   ```

4. **Initialize the database**
   ```bash
   python setup_project.py
   ```

5. **Load sample data**
   ```bash
   python ingest_knowledge_base.py
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

7. **Open your browser**
   - Frontend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🐳 Docker Deployment

### Using Docker Compose 
```bash
# Clone and setup
git clone https://github.com/Orphy123/okadatrial.git
cd okadatrial

# Create .env file
echo "OPENAI_API_KEY=your-key-here" > .env

# Build and run
docker-compose up --build
```


## 📋 API Reference

### Chat Endpoints
- `POST /chat/` - Chat with AI assistant
- `POST /chat/upload_docs` - Upload documents for RAG
- `POST /chat/add-documents` - Add documents via JSON

### Portfolio Analysis
- `POST /analyze/analyze_portfolio` - Natural language portfolio queries
- `GET /analyze/portfolio_stats` - Portfolio statistics

### CRM Management
- `POST /crm/create_user` - Create new user
- `GET /crm/conversations/{user_id}` - Get conversation history
- `PUT /crm/tag_message` - Tag messages

## 📊 Example Usage

### Chat with RAG
```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "What properties do you recommend for investment?",
    "use_rag": true
  }'
```

### Portfolio Analysis
```bash
curl -X POST "http://localhost:8000/analyze/analyze_portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "investor_123",
    "query": "Show me all properties above 15,000 SF with rent below $90/SF"
  }'
```

### Document Upload
```bash
curl -X POST "http://localhost:8000/chat/upload_docs" \
  -F "files=@property_analysis.pdf" \
  -F "files=@market_report.docx"
```

## 🧪 Testing

### Run All Tests
```bash
python test_project.py
```

### Run Specific Tests
```bash
# Test portfolio analysis
python test_analyze.py

# Test RAG functionality
python test_rag_query.py

# Quick health check
python quick_test.py
```

### Verify Setup
```bash
python verify_setup.py
```


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/feature_a`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Orphy123/okadatrial/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Orphy123/okadatrial/discussions)
- **Email**: [Your Email](mailto:your-email@example.com)

---

⭐ **Star this repository if you find it helpful!** ⭐

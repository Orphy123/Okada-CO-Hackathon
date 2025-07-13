# 🏢 AI-Powered Commercial Real Estate Assistant

A full-stack, multi-agentic platform designed for the Commercial Real Estate (CRE) sector, combining Retrieval-Augmented Generation (RAG), conversational AI, and intelligent CRM tracking. Originally built as a Python-based RESTful API system, this project has been extended with a modern React frontend to showcase its full capabilities through an intuitive and interactive web interface.
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


---

## 🚀 Overview

This system enables real-time, natural language interaction with property data, documents, and CRM intelligence. By integrating OpenAI's GPT-3.5 with a custom RAG pipeline and lightweight CRM, users can perform portfolio analysis, upload and search documents, and revisit prior sessions — all in one place.

---

## 🔑 What This Project Offers

### 🎯 Core Capabilities

**🤖 Conversational AI with RAG**
- **RAG-Enhanced Responses**: Contextually aware conversations using uploaded documents (PDFs, TXT, CSV, JSON)
- **Persistent Memory**: Full conversation history with session management across user interactions
- **Automatic Tagging**: AI-powered categorization of conversations (Resolved, Inquiring, Portfolio Analysis)
- **Multi-Document Processing**: Semantic search across large document collections using TF-IDF vectorization

**📊 Natural Language Portfolio Analyzer**
- **Smart Query Parsing**: Convert natural language queries into structured database filters
  - *"Show me properties above 15,000 SF with rent below $90/SF"*
  - *"Find high GCI properties above $300,000 on Broadway"*
- **Visual Analytics**: Automatic generation of charts and visualizations for analysis results
- **Export Capabilities**: Download filtered results as CSV files
- **Real-time Statistics**: Portfolio performance metrics and overview dashboards

**👥 Intelligent CRM Integration**
- **User Management**: Automatic user creation and profile management
- **Conversation Logging**: Complete interaction history with timestamps and metadata
- **Session Continuity**: Seamless conversation flow across multiple sessions
- **Smart Categorization**: Automatic tagging based on conversation content and context

**🖼️ React Web Interface (Frontend Showcase)**
While the backend was the primary deliverable, a polished React frontend was developed to demonstrate real-time interactivity. It enables:
- Seamless chat interface with AI
- Document uploads for RAG
- A dedicated portfolio analysis dashboard
- CRM browsing and tagging
- Session history view with reloadable conversations

---

## 🛠️ Technology Stack

### 🧠 Backend (FastAPI)
- Python 3.11+, FastAPI, Uvicorn
- OpenAI GPT-3.5 for AI responses
- SQLite + SQLAlchemy for CRM
- TF-IDF (Scikit-learn) for semantic search
- Matplotlib for dynamic chart generation
- Pandas for data filtering and transformation

### 💻 Frontend (React + TailwindCSS)
- React 18 (Vite)
- TailwindCSS for styling
- Axios for backend communication
- Framer Motion for smooth transitions
- Built-in support for chat, uploads, analysis, and history

---

## 🧪 Features by Requirement (from Hackathon Brief)

| Requirement | Implemented? | Notes |
|-------------|--------------|-------|
| Conversational Chatbot | ✅ | RAG-enhanced, persistent memory |
| Custom CRM | ✅ | Tracks users, tags messages, stores conversations |
| CRM-based Context Recall | ✅ | Conversations linked by user/session ID |
| RESTful API Endpoints | ✅ | All required + more (e.g., analysis tools) |
| Document Upload & RAG | ✅ | Supports PDF, TXT, CSV, JSON |
| Extended Frontend (React) | ✅ | Added for demonstration (goes beyond base requirement) |
| Session Query History | ✅ | View and reload prior sessions |
| Charts & Exports | ✅ | Visuals and CSV download from analyzer |

---

## 📎 Setup Instructions

### 🐍 Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
echo "OPENAI_API_KEY=your-key-here" > .env

# Initialize DB and ingest sample data
python setup_project.py
python ingest_knowledge_base.py

# Run backend
uvicorn app.main:app --reload --port 8000
```

### ⚛️ Frontend
```bash
cd src
npm install
npm run dev
```

---

## 🌐 Access

- **Frontend App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Portfolio Analysis Endpoint**: `/analyze_portfolio`
- **Upload Documents**: `/upload_docs`
- **CRM**: `/crm/*` endpoints
- **Session History**: `/history/sessions/{user_id}`

---

## 📁 Example Use Case

1. Upload real estate documents
2. Ask the AI:  
   _“Which properties on Broadway have the highest GCI over 3 years?”_
3. View results in a table with a downloadable CSV
4. Track user interaction in CRM and tag messages as needed
5. Revisit a past session by clicking its timestamped entry in history

---

## 🧠 Final Note

This project began as a Python-based REST API per the hackathon brief, but was extended to include a fully functional frontend to better demonstrate real-world usability and interaction.

Whether you're analyzing a portfolio, chatting with the AI assistant, or managing user sessions, this system provides a comprehensive and modern toolset tailored for the commercial real estate domain.

---

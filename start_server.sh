#!/bin/bash

echo "🚀 Starting RAG-Enabled Chatbot Server..."
echo "============================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one with your OpenAI API key:"
    echo "OPENAI_API_KEY=your-openai-api-key-here" 
    exit 1
fi

# Check if dependencies are installed
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create data directory if it doesn't exist
mkdir -p data

# Start the server
echo "🚀 Starting FastAPI server on http://localhost:8000..."
echo "📚 API Documentation will be available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 
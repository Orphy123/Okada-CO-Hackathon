# Natural Language Portfolio Analyzer

## Overview

The Natural Language Portfolio Analyzer enables investors and brokers to query commercial real estate data using natural language. The system automatically parses queries, applies filters, and returns structured results with AI-generated summaries.

## Features

✅ **Natural Language Query Processing**
- Convert plain English queries into structured database filters
- Support for size, rent, and GCI criteria
- Intelligent query interpretation

✅ **Structured Results**
- Filtered property matches
- Summary statistics
- AI-generated insights

✅ **RESTful API**
- Easy integration with existing systems
- JSON responses
- Comprehensive error handling

## API Endpoints

### 1. Analyze Portfolio
**POST** `/analyze/analyze_portfolio`

Convert natural language queries into property matches.

**Request:**
```json
{
  "user_id": "investor_123",
  "query": "Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years"
}
```

**Response:**
```json
{
  "summary": "Found 12 properties matching your criteria. The average size is 17,500 SF with rent averaging $85/SF/year...",
  "matches": [
    {
      "Property Address": "1412 Broadway",
      "Suite": "500",
      "Size (SF)": 16434,
      "Rent/SF/Year": "$81.00",
      "GCI On 3 Years": "$239,608"
    }
  ],
  "total_matches": 12,
  "query_interpretation": "Applied filters: {\"Size (SF)\": {\"gt\": 15000}, \"Rent/SF/Year\": {\"lt\": 90}, \"GCI On 3 Years\": {\"gt\": 250000}}"
}
```

### 2. Portfolio Statistics
**GET** `/analyze/portfolio_stats`

Get overview statistics of the entire portfolio.

**Response:**
```json
{
  "total_properties": 199,
  "avg_size_sf": 14562.5,
  "avg_rent_per_sf": 94.23,
  "avg_gci_3_years": 245830.15,
  "size_range": {"min": 9010, "max": 19918},
  "rent_range": {"min": 80.00, "max": 110.00}
}
```

## Example Queries

### Size-Based Queries
- "Show me properties larger than 18,000 square feet"
- "Find small office spaces under 10,000 SF"
- "What properties are between 15,000 and 20,000 SF?"

### Rent-Based Queries
- "Properties with rent per square foot under $85"
- "Show me expensive properties over $100/SF"
- "Find affordable spaces under $90 per square foot"

### GCI-Based Queries
- "Properties with GCI above $300,000 over 3 years"
- "Show me high-value properties with GCI over $250K"
- "Find properties with moderate GCI between $200K and $300K"

### Combined Queries
- "Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years"
- "Find large properties over 17,000 SF with reasonable rent under $95/SF"
- "What properties have high GCI above $280K but affordable rent under $88/SF?"

## Usage Examples

### Python
```python
import requests

# Analyze portfolio
response = requests.post("http://localhost:8000/analyze/analyze_portfolio", json={
    "user_id": "investor_123",
    "query": "Show me properties above 15,000 SF with rent below $90/SF"
})

data = response.json()
print(f"Found {data['total_matches']} properties")
print(f"Summary: {data['summary']}")
```

### cURL
```bash
curl -X POST "http://localhost:8000/analyze/analyze_portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "investor_123",
    "query": "Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years"
  }'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:8000/analyze/analyze_portfolio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'investor_123',
    query: 'Show me properties above 15,000 SF with rent below $90/SF'
  })
})
.then(response => response.json())
.then(data => {
  console.log(`Found ${data.total_matches} properties`);
  console.log(`Summary: ${data.summary}`);
});
```

## Technical Implementation

### Natural Language Processing
- **OpenAI GPT-3.5-turbo** for query interpretation
- **Structured filter extraction** from natural language
- **Error handling** for ambiguous queries

### Data Processing
- **Pandas** for efficient data filtering
- **Currency parsing** for financial data
- **Type conversion** for numeric comparisons

### Response Generation
- **AI-generated summaries** of results
- **Formatted currency display**
- **Structured JSON responses**

## Installation & Setup

### Prerequisites
- Python 3.7+
- OpenAI API key
- FastAPI server running

### Running the Server
```bash
# Start the server
uvicorn app.main:app --reload --port 8000

# Verify it's running
curl http://localhost:8000/
```

### Testing
```bash
# Run the comprehensive test suite
python test_analyze.py

# Or test individual components
python -c "
import requests
response = requests.get('http://localhost:8000/analyze/portfolio_stats')
print(response.json())
"
```

## Data Format

The system works with commercial real estate data in CSV format with these fields:

| Field | Description | Example |
|-------|-------------|---------|
| `Property Address` | Street address | "1412 Broadway" |
| `Size (SF)` | Property size in square feet | 16434 |
| `Rent/SF/Year` | Annual rent per square foot | "$81.00" |
| `GCI On 3 Years` | Gross Commission Income over 3 years | "$239,608" |
| `Floor` | Floor designation | "E5" |
| `Suite` | Suite number | "500" |
| `Associate 1` | Primary broker | "Jack Sparrow" |

## Error Handling

The system handles various error scenarios:

- **Invalid queries**: Returns empty results with explanation
- **Data parsing errors**: Graceful fallback with error messages
- **OpenAI API errors**: Detailed error responses
- **Database connection issues**: Proper error codes and messages

## Integration with Existing System

The Portfolio Analyzer integrates seamlessly with your existing RAG-enabled chatbot:

- **Same OpenAI client** configuration
- **Same database** for conversation logging
- **Same FastAPI app** structure
- **Consistent error handling**

## Performance Considerations

- **Dataset loaded once** on startup for fast queries
- **Efficient pandas filtering** for large datasets
- **Response limiting** to top 20 matches
- **Memory-efficient** currency parsing

## Future Enhancements

🔮 **Planned Features:**
- **Data visualization** with charts and graphs
- **Export capabilities** (Excel, PDF reports)
- **Advanced filtering** (location, broker, date ranges)
- **Saved queries** and alerts
- **Comparative analysis** between properties

## Troubleshooting

### Common Issues

1. **"Property data not available"**
   - Ensure CSV file exists at `data/HackathonInternalKnowledgeBase.csv`
   - Check file permissions

2. **"OpenAI API error"**
   - Verify `OPENAI_API_KEY` in environment variables
   - Check API quota and billing

3. **"No matches found"**
   - Try broader queries
   - Check data format and column names

4. **Server connection errors**
   - Ensure server is running on port 8000
   - Check firewall settings

### Debug Mode
```bash
# Run server with debug logging
uvicorn app.main:app --reload --port 8000 --log-level debug
```

## Support

For issues and questions:
1. Check the test results: `python test_analyze.py`
2. Review server logs for error details
3. Verify your OpenAI API key is working
4. Check the interactive API docs at `http://localhost:8000/docs`

---

Built with ❤️ using FastAPI, OpenAI, and modern Python practices. 
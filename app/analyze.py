from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
import pandas as pd
import json
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.crm import SessionLocal, Conversation
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import uuid

load_dotenv()

# Initialize OpenAI client (consistent with existing chat.py)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

analyze_router = APIRouter()

# Load the property dataset once
CSV_PATH = "data/HackathonInternalKnowledgeBase.csv"
try:
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} properties from {CSV_PATH}")
except Exception as e:
    print(f"Error loading CSV: {e}")
    df = pd.DataFrame()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AnalyzeRequest(BaseModel):
    user_id: str
    query: str
    return_chart: bool = False
    download_csv: bool = False

class AnalyzeResponse(BaseModel):
    summary: str
    matches: List[Dict[str, Any]]
    total_matches: int
    query_interpretation: str
    chart_url: str = ""
    csv_url: str = ""

def call_openai(prompt: str) -> str:
    """Call OpenAI API with error handling"""
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

def clean_currency_string(value: str) -> float:
    """Clean currency strings and convert to float"""
    if pd.isna(value):
        return 0.0
    
    # Remove dollar signs, commas, and quotes
    cleaned = str(value).replace('$', '').replace(',', '').replace('"', '').strip()
    
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return 0.0

def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """Parse natural language query into structured filters"""
    filter_prompt = f"""
You are a helpful assistant that converts natural language queries into structured filters for a commercial real estate database.

The database has these fields:
- Size (SF): Property size in square feet (integer)
- Rent/SF/Year: Annual rent per square foot (dollar amount like $87.00)
- GCI On 3 Years: Gross Commission Income over 3 years (dollar amount like $292,059)
- Property Address: Street address
- Floor: Floor designation
- Suite: Suite number
- Associate 1: Primary broker associate

User Query: "{query}"

Convert this query into a JSON object with filters. Use these operators:
- "gt" for greater than
- "lt" for less than  
- "eq" for equal to
- "gte" for greater than or equal
- "lte" for less than or equal

Example output format:
{{
  "Size (SF)": {{ "gt": 15000 }},
  "Rent/SF/Year": {{ "lt": 90 }},
  "GCI On 3 Years": {{ "gt": 250000 }}
}}

If no specific filters can be determined, return an empty object: {{}}

Respond only with valid JSON, no additional text.
"""
    
    try:
        filter_json_str = call_openai(filter_prompt)
        # Clean the response to ensure it's valid JSON
        filter_json_str = filter_json_str.strip()
        if filter_json_str.startswith('```json'):
            filter_json_str = filter_json_str.replace('```json', '').replace('```', '').strip()
        
        return json.loads(filter_json_str)
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return {}
    except Exception as e:
        print(f"Error parsing query: {e}")
        return {}

def apply_filters(df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
    """Apply filters to the dataframe"""
    if df.empty:
        return df
    
    # Create a copy to avoid modifying the original
    filtered_df = df.copy()
    
    # Clean numeric columns
    filtered_df['Size (SF)'] = pd.to_numeric(filtered_df['Size (SF)'], errors='coerce')
    filtered_df['Rent/SF/Year'] = filtered_df['Rent/SF/Year'].apply(clean_currency_string)
    filtered_df['GCI On 3 Years'] = filtered_df['GCI On 3 Years'].apply(clean_currency_string)
    
    # Apply filters
    for column, conditions in filters.items():
        if column not in filtered_df.columns:
            continue
            
        for operator, value in conditions.items():
            if operator == 'gt':
                filtered_df = filtered_df[filtered_df[column] > value]
            elif operator == 'lt':
                filtered_df = filtered_df[filtered_df[column] < value]
            elif operator == 'eq':
                filtered_df = filtered_df[filtered_df[column] == value]
            elif operator == 'gte':
                filtered_df = filtered_df[filtered_df[column] >= value]
            elif operator == 'lte':
                filtered_df = filtered_df[filtered_df[column] <= value]
    
    return filtered_df

def format_currency(value: float) -> str:
    """Format a number as currency"""
    return f"${value:,.2f}"

def generate_summary(matches: List[Dict[str, Any]], query: str) -> str:
    """Generate a summary of the matches using OpenAI"""
    if not matches:
        return "No properties match your criteria."
    
    # Create a concise summary of the matches
    summary_data = {
        "total_matches": len(matches),
        "sample_properties": matches[:3],
        "avg_size": sum(m.get('Size (SF)', 0) for m in matches) / len(matches) if matches else 0,
        "avg_rent": sum(m.get('Rent/SF/Year', 0) if isinstance(m.get('Rent/SF/Year'), (int, float)) else 0 for m in matches) / len(matches) if matches else 0,
        "avg_gci": sum(m.get('GCI On 3 Years', 0) if isinstance(m.get('GCI On 3 Years'), (int, float)) else 0 for m in matches) / len(matches) if matches else 0
    }
    
    summary_prompt = f"""
Based on the user query: "{query}"

I found {summary_data['total_matches']} matching properties. Here are the key insights:

Average Size: {summary_data['avg_size']:.0f} SF
Average Rent: ${summary_data['avg_rent']:.2f}/SF/Year  
Average GCI (3 years): ${summary_data['avg_gci']:.2f}

Sample properties:
{json.dumps(summary_data['sample_properties'], indent=2)}

Please provide a concise, professional summary of these findings for an investor or broker. Focus on the key metrics and trends.
"""
    
    try:
        return call_openai(summary_prompt)
    except Exception as e:
        return f"Found {len(matches)} properties matching your criteria. Analysis details: {str(e)}"

def generate_chart(filtered_df: pd.DataFrame, user_id: str) -> str:
    """Generate a chart from filtered data and return the URL"""
    if filtered_df.empty:
        return ""
    
    try:
        # Create a visualization
        plt.figure(figsize=(12, 8))
        
        # Get top 10 properties by GCI
        top_properties = filtered_df.nlargest(10, 'GCI On 3 Years')
        
        # Create labels for properties
        labels = []
        for _, row in top_properties.iterrows():
            address = str(row.get('Property Address', 'Unknown'))[:30]
            suite = str(row.get('Suite', ''))
            if suite and suite != 'nan':
                labels.append(f"{address} - {suite}")
            else:
                labels.append(address)
        
        # Create horizontal bar chart
        plt.barh(range(len(labels)), top_properties['GCI On 3 Years'])
        plt.yticks(range(len(labels)), labels)
        plt.xlabel('GCI On 3 Years ($)')
        plt.title('Top 10 Properties by GCI (3 Years)')
        plt.tight_layout()
        
        # Save the chart
        chart_filename = f"chart_{user_id}_{uuid.uuid4().hex}.png"
        chart_path = f"data/{chart_filename}"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return f"/analyze/download_chart/{chart_filename}"
    except Exception as e:
        print(f"Error generating chart: {e}")
        return ""

def generate_csv(filtered_df: pd.DataFrame, user_id: str) -> str:
    """Generate a CSV file from filtered data and return the URL"""
    if filtered_df.empty:
        return ""
    
    try:
        # Create CSV filename
        csv_filename = f"filtered_properties_{user_id}_{uuid.uuid4().hex}.csv"
        csv_path = f"data/{csv_filename}"
        
        # Save the filtered data to CSV
        filtered_df.to_csv(csv_path, index=False)
        
        return f"/analyze/download_csv/{csv_filename}"
    except Exception as e:
        print(f"Error generating CSV: {e}")
        return ""

@analyze_router.post("/analyze_portfolio", response_model=AnalyzeResponse)
async def analyze_portfolio(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """Analyze portfolio based on natural language query"""
    
    if df.empty:
        raise HTTPException(status_code=500, detail="Property data not available")
    
    # Step 1: Parse the natural language query
    filters = parse_natural_language_query(request.query)
    
    # Step 2: Apply filters to the dataset
    filtered_df = apply_filters(df, filters)
    
    # Step 3: Prepare matches for response
    if not filtered_df.empty:
        # Select key columns for the response
        result_columns = [
            'Property Address', 'Floor', 'Suite', 'Size (SF)', 
            'Rent/SF/Year', 'GCI On 3 Years', 'Associate 1', 'Monthly Rent'
        ]
        
        # Ensure all columns exist
        available_columns = [col for col in result_columns if col in filtered_df.columns]
        matches_df = filtered_df[available_columns].head(20)  # Limit to top 20 matches
        
        # Convert to dict and format currency fields
        matches = []
        for _, row in matches_df.iterrows():
            match = row.to_dict()
            
            # Format currency fields
            if 'Rent/SF/Year' in match and isinstance(match['Rent/SF/Year'], (int, float)):
                match['Rent/SF/Year'] = format_currency(match['Rent/SF/Year'])
            if 'GCI On 3 Years' in match and isinstance(match['GCI On 3 Years'], (int, float)):
                match['GCI On 3 Years'] = format_currency(match['GCI On 3 Years'])
            
            matches.append(match)
    else:
        matches = []
    
    # Step 4: Generate summary
    summary = generate_summary(matches, request.query)
    
    # Step 5: Create query interpretation
    query_interpretation = f"Applied filters: {json.dumps(filters, indent=2)}" if filters else "No specific filters detected - showing general portfolio information"
    
    # Step 6: Log the interaction
    try:
        db.add(Conversation(
            user_id=request.user_id, 
            message=request.query, 
            role="user", 
            tag="Portfolio Analysis"
        ))
        
        response_message = f"Portfolio analysis complete. Found {len(matches)} matches."
        db.add(Conversation(
            user_id=request.user_id,
            message=response_message,
            role="assistant",
            tag="Portfolio Analysis"
        ))
        
        db.commit()
    except Exception as e:
        print(f"Error logging conversation: {e}")
    
    # Step 7: Generate chart if requested
    chart_url = ""
    if request.return_chart and not filtered_df.empty:
        chart_url = generate_chart(filtered_df, request.user_id)
    
    # Step 8: Generate CSV if requested
    csv_url = ""
    if request.download_csv and not filtered_df.empty:
        csv_url = generate_csv(filtered_df, request.user_id)
    
    return AnalyzeResponse(
        summary=summary,
        matches=matches,
        total_matches=len(matches),
        query_interpretation=query_interpretation,
        chart_url=chart_url,
        csv_url=csv_url
    )

@analyze_router.get("/portfolio_stats")
async def get_portfolio_stats():
    """Get basic portfolio statistics"""
    if df.empty:
        raise HTTPException(status_code=500, detail="Property data not available")
    
    # Clean the data
    df_clean = df.copy()
    df_clean['Size (SF)'] = pd.to_numeric(df_clean['Size (SF)'], errors='coerce')
    df_clean['Rent/SF/Year'] = df_clean['Rent/SF/Year'].apply(clean_currency_string)
    df_clean['GCI On 3 Years'] = df_clean['GCI On 3 Years'].apply(clean_currency_string)
    
    stats = {
        "total_properties": len(df_clean),
        "avg_size_sf": df_clean['Size (SF)'].mean(),
        "avg_rent_per_sf": df_clean['Rent/SF/Year'].mean(),
        "avg_gci_3_years": df_clean['GCI On 3 Years'].mean(),
        "size_range": {
            "min": df_clean['Size (SF)'].min(),
            "max": df_clean['Size (SF)'].max()
        },
        "rent_range": {
            "min": df_clean['Rent/SF/Year'].min(),
            "max": df_clean['Rent/SF/Year'].max()
        }
    }
    
    return stats

@analyze_router.get("/download_chart/{filename}")
async def download_chart(filename: str):
    """Download a generated chart file"""
    chart_path = f"data/{filename}"
    if os.path.exists(chart_path):
        return FileResponse(
            path=chart_path,
            filename=filename,
            media_type="image/png"
        )
    raise HTTPException(status_code=404, detail="Chart not found")

@analyze_router.get("/download_csv/{filename}")
async def download_csv(filename: str):
    """Download a generated CSV file"""
    csv_path = f"data/{filename}"
    if os.path.exists(csv_path):
        return FileResponse(
            path=csv_path,
            filename=filename,
            media_type="text/csv"
        )
    raise HTTPException(status_code=404, detail="CSV not found") 
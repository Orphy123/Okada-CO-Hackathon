#!/usr/bin/env python3
"""
Verification script for Natural Language Portfolio Analyzer setup
"""

import sys
import os
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} NOT FOUND")
        return False

def check_python_imports():
    """Check if required Python packages are installed"""
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('openai', 'OpenAI'),
        ('pandas', 'Pandas'),
        ('numpy', 'NumPy'),
        ('pydantic', 'Pydantic'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('uvicorn', 'Uvicorn'),
        ('dotenv', 'Python-dotenv'),
        ('sklearn', 'Scikit-learn'),
        ('requests', 'Requests')
    ]
    
    print("\n📦 Checking Python Dependencies...")
    print("-" * 50)
    
    all_good = True
    for package, name in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {name}")
        except ImportError:
            print(f"❌ {name} - Install with: pip install {package}")
            all_good = False
    
    return all_good

def check_environment_variables():
    """Check environment variables"""
    print("\n🔑 Checking Environment Variables...")
    print("-" * 50)
    
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        print(f"✅ OPENAI_API_KEY: Set (length: {len(openai_key)})")
        return True
    else:
        print("❌ OPENAI_API_KEY: Not set")
        print("   Create a .env file with: OPENAI_API_KEY=your-api-key-here")
        return False

def check_project_structure():
    """Check if all required files exist"""
    print("\n📁 Checking Project Structure...")
    print("-" * 50)
    
    required_files = [
        ("app/analyze.py", "Portfolio Analyzer module"),
        ("app/main.py", "FastAPI main application"),
        ("app/chat.py", "Chat endpoint"),
        ("app/rag.py", "RAG system"),
        ("app/crm.py", "CRM database models"),
        ("data/HackathonInternalKnowledgeBase.csv", "Property data CSV"),
        ("requirements.txt", "Python dependencies"),
        ("test_analyze.py", "Test script"),
        ("PORTFOLIO_ANALYZER.md", "Documentation")
    ]
    
    all_good = True
    for filepath, description in required_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_data_integrity():
    """Check if the CSV data is properly formatted"""
    print("\n📊 Checking Data Integrity...")
    print("-" * 50)
    
    csv_path = "data/HackathonInternalKnowledgeBase.csv"
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return False
    
    try:
        import pandas as pd
        df = pd.read_csv(csv_path)
        
        required_columns = ['Property Address', 'Size (SF)', 'Rent/SF/Year', 'GCI On 3 Years']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            print(f"❌ Missing columns in CSV: {missing_columns}")
            return False
        
        print(f"✅ CSV loaded successfully: {len(df)} rows, {len(df.columns)} columns")
        print(f"✅ Required columns present: {required_columns}")
        
        # Check for data quality
        size_numeric = pd.to_numeric(df['Size (SF)'], errors='coerce').notna().sum()
        print(f"✅ Numeric Size data: {size_numeric}/{len(df)} rows")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return False

def run_quick_test():
    """Run a quick test of the analyze module"""
    print("\n🧪 Running Quick Module Test...")
    print("-" * 50)
    
    try:
        sys.path.append('app')
        from analyze import clean_currency_string, parse_natural_language_query
        
        # Test currency parsing
        test_value = "$1,234.56"
        parsed = clean_currency_string(test_value)
        if parsed == 1234.56:
            print("✅ Currency parsing works")
        else:
            print(f"❌ Currency parsing failed: {parsed}")
            return False
        
        print("✅ Module imports successful")
        return True
        
    except Exception as e:
        print(f"❌ Module test failed: {e}")
        return False

def main():
    """Run all verification checks"""
    print("🔍 Natural Language Portfolio Analyzer Setup Verification")
    print("=" * 60)
    
    checks = [
        ("Project Structure", check_project_structure),
        ("Python Dependencies", check_python_imports),
        ("Environment Variables", check_environment_variables),
        ("Data Integrity", check_data_integrity),
        ("Module Test", run_quick_test)
    ]
    
    results = []
    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ {check_name} check failed with error: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 60)
    
    for check_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check_name}: {status}")
    
    total_passed = sum(1 for _, passed in results if passed)
    total_checks = len(results)
    
    print(f"\nOverall: {total_passed}/{total_checks} checks passed")
    
    if total_passed == total_checks:
        print("\n🎉 Setup verification complete! Your Portfolio Analyzer is ready.")
        print("\nNext steps:")
        print("1. Start the server: uvicorn app.main:app --reload --port 8000")
        print("2. Run tests: python test_analyze.py")
        print("3. Check API docs: http://localhost:8000/docs")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("Refer to PORTFOLIO_ANALYZER.md for troubleshooting help.")
    
    return total_passed == total_checks

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 
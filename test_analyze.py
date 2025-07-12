import requests
import json
import time

# Test the Natural Language Portfolio Analyzer
BASE_URL = "http://localhost:8000"

def test_server_health():
    """Test if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Server is running!")
            data = response.json()
            print(f"   Message: {data.get('message')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Server health check failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server connection error: {e}")
        return False

def test_portfolio_stats():
    """Test portfolio statistics endpoint"""
    
    print("\n📊 Testing Portfolio Statistics")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/analyze/portfolio_stats")
        
        if response.status_code == 200:
            stats = response.json()
            
            print("✅ Portfolio Statistics:")
            print(f"   Total Properties: {stats['total_properties']}")
            print(f"   Average Size: {stats['avg_size_sf']:.0f} SF")
            print(f"   Average Rent: ${stats['avg_rent_per_sf']:.2f}/SF/Year")
            print(f"   Average GCI (3 years): ${stats['avg_gci_3_years']:.2f}")
            print(f"   Size Range: {stats['size_range']['min']:.0f} - {stats['size_range']['max']:.0f} SF")
            print(f"   Rent Range: ${stats['rent_range']['min']:.2f} - ${stats['rent_range']['max']:.2f}/SF")
            return True
            
        else:
            print(f"❌ Stats request failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_portfolio_analyzer():
    """Test the natural language portfolio analyzer"""
    
    print("\n🏢 Testing Natural Language Portfolio Analyzer")
    print("=" * 60)
    
    # Test queries
    test_queries = [
        "Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years",
        "Find properties larger than 18,000 square feet",
        "What properties have rent per square foot under $85?",
        "Show me properties on Broadway with high GCI",
        "Find small office spaces under 10,000 SF"
    ]
    
    passed_tests = 0
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n📊 Test Query {i}: {query}")
        print("-" * 50)
        
        try:
            payload = {
                "user_id": "test_investor",
                "query": query
            }
            
            response = requests.post(f"{BASE_URL}/analyze/analyze_portfolio", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"✅ Query processed successfully!")
                print(f"🔍 Query Interpretation: {data['query_interpretation']}")
                print(f"📈 Total Matches: {data['total_matches']}")
                print(f"📝 Summary: {data['summary'][:200]}...")
                
                if data['matches']:
                    print(f"\n🏠 Sample Properties:")
                    for j, match in enumerate(data['matches'][:3], 1):
                        print(f"  {j}. {match.get('Property Address', 'N/A')} - "
                              f"Size: {match.get('Size (SF)', 'N/A')} SF, "
                              f"Rent: {match.get('Rent/SF/Year', 'N/A')}")
                
                passed_tests += 1
                
            else:
                print(f"❌ Query failed with status: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n📊 Test Results: {passed_tests}/{len(test_queries)} tests passed")
    return passed_tests == len(test_queries)

def test_specific_scenarios():
    """Test specific edge cases and scenarios"""
    
    print("\n🎯 Testing Specific Scenarios")
    print("=" * 60)
    
    scenarios = [
        {
            "name": "Large Properties Filter",
            "query": "Properties over 19,000 SF",
            "expected_behavior": "Should filter by size only"
        },
        {
            "name": "Price Range Filter",
            "query": "Properties between $80 and $90 per square foot",
            "expected_behavior": "Should filter by rent range"
        },
        {
            "name": "High GCI Filter",
            "query": "Properties with GCI above $300,000",
            "expected_behavior": "Should filter by GCI"
        },
        {
            "name": "Ambiguous Query",
            "query": "Nice properties in good location",
            "expected_behavior": "Should return general results"
        }
    ]
    
    passed_scenarios = 0
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n🎯 Scenario {i}: {scenario['name']}")
        print(f"Query: {scenario['query']}")
        print(f"Expected: {scenario['expected_behavior']}")
        print("-" * 30)
        
        try:
            payload = {
                "user_id": "test_investor",
                "query": scenario['query']
            }
            
            response = requests.post(f"{BASE_URL}/analyze/analyze_portfolio", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Scenario processed successfully!")
                print(f"   Total Matches: {data['total_matches']}")
                print(f"   Query Interpretation: {data['query_interpretation'][:100]}...")
                passed_scenarios += 1
                
            else:
                print(f"❌ Scenario failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n📊 Scenario Results: {passed_scenarios}/{len(scenarios)} scenarios passed")
    return passed_scenarios == len(scenarios)

def test_api_documentation():
    """Test API documentation endpoints"""
    
    print("\n📚 Testing API Documentation")
    print("=" * 60)
    
    try:
        # Test OpenAPI JSON
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            print("✅ OpenAPI JSON endpoint working")
            
            # Check if our analyze endpoints are in the docs
            openapi_data = response.json()
            paths = openapi_data.get('paths', {})
            
            if '/analyze/analyze_portfolio' in paths:
                print("✅ Portfolio analysis endpoint documented")
            else:
                print("❌ Portfolio analysis endpoint not found in docs")
                
            if '/analyze/portfolio_stats' in paths:
                print("✅ Portfolio stats endpoint documented")
            else:
                print("❌ Portfolio stats endpoint not found in docs")
                
            return True
        else:
            print(f"❌ OpenAPI JSON failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    
    print("🚀 Starting Portfolio Analyzer Tests")
    print("Make sure the server is running on http://localhost:8000")
    print("=" * 60)
    
    # Test results
    results = []
    
    # Test server health
    results.append(test_server_health())
    
    # Test portfolio statistics
    results.append(test_portfolio_stats())
    
    # Test portfolio analyzer
    results.append(test_portfolio_analyzer())
    
    # Test specific scenarios
    results.append(test_specific_scenarios())
    
    # Test API documentation
    results.append(test_api_documentation())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    
    test_names = [
        "Server Health",
        "Portfolio Statistics",
        "Portfolio Analyzer",
        "Specific Scenarios",
        "API Documentation"
    ]
    
    for i, (test_name, passed) in enumerate(zip(test_names, results)):
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{i+1}. {test_name}: {status}")
    
    total_passed = sum(results)
    total_tests = len(results)
    
    print(f"\nOverall: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("🎉 All tests passed! Your Natural Language Portfolio Analyzer is working perfectly!")
    else:
        print("⚠️  Some tests failed. Please check the error messages above.")
    
    return total_passed == total_tests

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n✨ Portfolio Analyzer is ready for use!")
        print("\nExample usage:")
        print("curl -X POST 'http://localhost:8000/analyze/analyze_portfolio' \\")
        print("  -H 'Content-Type: application/json' \\")
        print("  -d '{\"user_id\": \"investor_123\", \"query\": \"Show me properties above 15,000 SF with rent below $90/SF\"}'")
    else:
        print("\n❌ Please fix the issues and run the tests again.") 
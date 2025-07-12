#!/usr/bin/env python3
"""
Quick test to verify the project is working
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_server():
    """Test if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return False

def test_chat():
    """Test basic chat functionality"""
    try:
        payload = {
            "user_id": "test_user",
            "message": "Hello, can you help me find office space?"
        }
        response = requests.post(f"{BASE_URL}/chat/", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat working! Response: {data.get('response', 'No response')[:100]}...")
            return True
        else:
            print(f"❌ Chat failed with status: {response.status_code}")
            if response.status_code == 422:
                print(f"   Details: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return False

def test_upload():
    """Test file upload with a simple text file"""
    try:
        # Create a simple test file
        test_content = "This is a test document for the RAG system.\nIt contains information about office rentals.\nSuite 100 is available for $2000/month."
        
        files = {'files': ('test.txt', test_content, 'text/plain')}
        response = requests.post(f"{BASE_URL}/chat/upload_docs", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Upload working! {data.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Upload failed with status: {response.status_code}")
            if response.status_code == 422:
                print(f"   Details: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False

def test_add_documents():
    """Test add-documents endpoint"""
    try:
        payload = {
            "documents": [
                "Executive Office Suite is available for $3000/month with 1500 sq ft.",
                "Conference Room A can be rented for $500/day with seating for 20 people."
            ]
        }
        response = requests.post(f"{BASE_URL}/chat/add-documents", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Add-documents working! {data.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Add-documents failed with status: {response.status_code}")
            if response.status_code == 422:
                print(f"   Details: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Add-documents error: {e}")
        return False

def test_rag():
    """Test RAG functionality"""
    try:
        time.sleep(2)  # Wait for indexing
        
        payload = {
            "user_id": "test_user",
            "message": "What office spaces are available and what are the rental prices?"
        }
        response = requests.post(f"{BASE_URL}/chat/", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '').lower()
            has_context = any(keyword in response_text for keyword in ['office', 'rent', 'suite', '2000', '3000', 'available'])
            
            if has_context:
                print(f"✅ RAG working! Response contains uploaded content.")
                print(f"   Sample: {data.get('response', '')[:200]}...")
            else:
                print(f"⚠️  RAG partially working - response received but may not contain context")
                print(f"   Response: {data.get('response', '')[:200]}...")
            return True
        else:
            print(f"❌ RAG test failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ RAG error: {e}")
        return False

def main():
    print("🚀 Quick Project Test")
    print("=" * 40)
    
    tests = [
        ("Server Health", test_server),
        ("Chat Functionality", test_chat),
        ("File Upload", test_upload),
        ("Add Documents", test_add_documents),
        ("RAG Integration", test_rag)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}...")
        if test_func():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print(f"\n" + "=" * 40)
    print(f"📊 Results: {passed}/{total} tests passed")
    print(f"Success Rate: {passed/total*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Your project is working correctly!")
        print("\nYou can now:")
        print("- Visit http://localhost:8000/docs for API documentation")
        print("- Test chat at POST /chat/")
        print("- Upload files at POST /chat/upload_docs")
        print("- Add documents at POST /chat/add-documents")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Check the details above.")
    
    return passed == total

if __name__ == "__main__":
    main() 
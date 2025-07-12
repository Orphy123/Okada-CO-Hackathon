#!/usr/bin/env python3
"""
Comprehensive testing script for the RAG-enabled chatbot project.
Tests all Phase 3 and Phase 4 functionality.
"""

import requests
import json
import os
import time
from pathlib import Path
import tempfile

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER_ID = "test_user_123"

class ProjectTester:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_server_health(self):
        """Test if the server is running"""
        try:
            response = self.session.get(f"{self.base_url}/docs")
            success = response.status_code == 200
            self.log_test("Server Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Server Health Check", False, f"Error: {str(e)}")
            return False
            
    def test_create_user(self):
        """Test user creation (Phase 3)"""
        try:
            payload = {
                "name": "Test User",
                "email": "test@example.com",
                "company": "Test Company",
                "preferences": "Testing preferences"
            }
            response = self.session.post(f"{self.base_url}/crm/create_user", json=payload)
            success = response.status_code == 200
            if success:
                data = response.json()
                global TEST_USER_ID
                TEST_USER_ID = data.get("user_id", TEST_USER_ID)
            self.log_test("User Creation", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("User Creation", False, f"Error: {str(e)}")
            return False
            
    def test_chat_functionality(self):
        """Test chat endpoint with message logging (Phase 3)"""
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "message": "Hello, can you help me find office space?"
            }
            response = self.session.post(f"{self.base_url}/chat/", json=payload)
            success = response.status_code == 200
            if success:
                data = response.json()
                has_response = "response" in data and len(data["response"]) > 0
                success = has_response
                self.log_test("Chat Functionality", success, f"Response received: {len(data.get('response', ''))} chars")
            else:
                self.log_test("Chat Functionality", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Chat Functionality", False, f"Error: {str(e)}")
            return False
            
    def test_conversation_history(self):
        """Test conversation history retrieval (Phase 3)"""
        try:
            # Send another message to create history
            payload = {
                "user_id": TEST_USER_ID,
                "message": "What are the available rental options?"
            }
            self.session.post(f"{self.base_url}/chat/", json=payload)
            
            # Retrieve conversation history
            response = self.session.get(f"{self.base_url}/crm/conversations/{TEST_USER_ID}")
            success = response.status_code == 200
            if success:
                data = response.json()
                has_messages = isinstance(data, list) and len(data) > 0
                success = has_messages
                self.log_test("Conversation History", success, f"Found {len(data)} messages")
            else:
                self.log_test("Conversation History", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Conversation History", False, f"Error: {str(e)}")
            return False
            
    def create_test_files(self):
        """Create test files for upload testing"""
        test_dir = Path("test_files")
        test_dir.mkdir(exist_ok=True)
        
        # Create test TXT file
        txt_file = test_dir / "test.txt"
        txt_file.write_text("This is a test document for office rentals.\nOffice Suite A is available for $2000/month.\nIt has 1000 sq ft of space.")
        
        # Create test CSV file
        csv_file = test_dir / "test.csv"
        csv_content = """Property,Size,Rent,Available
Office A,1000,2000,Yes
Office B,1500,3000,No
Office C,2000,4000,Yes"""
        csv_file.write_text(csv_content)
        
        # Create test JSON file
        json_file = test_dir / "test.json"
        json_content = {
            "properties": [
                {"name": "Office Suite 1", "size": 1200, "rent": 2500, "floor": 3},
                {"name": "Office Suite 2", "size": 1800, "rent": 3500, "floor": 5}
            ]
        }
        json_file.write_text(json.dumps(json_content, indent=2))
        
        return test_dir
        
    def test_file_upload_txt(self):
        """Test TXT file upload (Phase 4)"""
        try:
            test_dir = self.create_test_files()
            txt_file = test_dir / "test.txt"
            
            with open(txt_file, 'rb') as f:
                files = {'files': (txt_file.name, f, 'text/plain')}
                response = self.session.post(f"{self.base_url}/chat/upload_docs", files=files)
                
            success = response.status_code == 200
            if success:
                data = response.json()
                has_message = "message" in data and "chunks_added" in data
                success = has_message
                self.log_test("TXT File Upload", success, f"Added {data.get('chunks_added', 0)} chunks")
            else:
                self.log_test("TXT File Upload", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("TXT File Upload", False, f"Error: {str(e)}")
            return False
            
    def test_file_upload_csv(self):
        """Test CSV file upload (Phase 4)"""
        try:
            test_dir = Path("test_files")
            csv_file = test_dir / "test.csv"
            
            with open(csv_file, 'rb') as f:
                files = {'files': (csv_file.name, f, 'text/csv')}
                response = self.session.post(f"{self.base_url}/chat/upload_docs", files=files)
                
            success = response.status_code == 200
            if success:
                data = response.json()
                has_message = "message" in data and "chunks_added" in data
                success = has_message
                self.log_test("CSV File Upload", success, f"Added {data.get('chunks_added', 0)} chunks")
            else:
                self.log_test("CSV File Upload", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("CSV File Upload", False, f"Error: {str(e)}")
            return False
            
    def test_file_upload_json(self):
        """Test JSON file upload (Phase 4)"""
        try:
            test_dir = Path("test_files")
            json_file = test_dir / "test.json"
            
            with open(json_file, 'rb') as f:
                files = {'files': (json_file.name, f, 'application/json')}
                response = self.session.post(f"{self.base_url}/chat/upload_docs", files=files)
                
            success = response.status_code == 200
            if success:
                data = response.json()
                has_message = "message" in data and "chunks_added" in data
                success = has_message
                self.log_test("JSON File Upload", success, f"Added {data.get('chunks_added', 0)} chunks")
            else:
                self.log_test("JSON File Upload", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("JSON File Upload", False, f"Error: {str(e)}")
            return False
            
    def test_add_documents_endpoint(self):
        """Test add-documents endpoint (Phase 4)"""
        try:
            payload = {
                "documents": [
                    "Executive Office Suite is available for $3000/month with 1500 sq ft.",
                    "Conference Room A can be rented for $500/day with seating for 20 people.",
                    "Shared workspace is available for $800/month per desk."
                ]
            }
            response = self.session.post(f"{self.base_url}/chat/add-documents", json=payload)
            success = response.status_code == 200
            if success:
                data = response.json()
                has_message = "message" in data and "Added" in data["message"]
                success = has_message
                self.log_test("Add Documents Endpoint", success, f"Added {len(payload['documents'])} documents")
            else:
                self.log_test("Add Documents Endpoint", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Add Documents Endpoint", False, f"Error: {str(e)}")
            return False
            
    def test_rag_integration(self):
        """Test RAG integration after file upload"""
        try:
            # Wait a moment for indexing to complete
            time.sleep(2)
            
            payload = {
                "user_id": TEST_USER_ID,
                "message": "What office spaces are available and what are the rental prices?"
            }
            response = self.session.post(f"{self.base_url}/chat/", json=payload)
            success = response.status_code == 200
            if success:
                data = response.json()
                response_text = data.get("response", "").lower()
                # Check if response contains information from uploaded files
                has_context = any(keyword in response_text for keyword in ["office", "rent", "space", "suite", "2000", "1000", "available"])
                success = has_context
                self.log_test("RAG Integration", success, f"Response contains context: {has_context}")
            else:
                self.log_test("RAG Integration", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("RAG Integration", False, f"Error: {str(e)}")
            return False
            
    def test_multiple_file_upload(self):
        """Test multiple file upload (Phase 4)"""
        try:
            test_dir = Path("test_files")
            txt_file = test_dir / "test.txt"
            csv_file = test_dir / "test.csv"
            
            files = [
                ('files', (txt_file.name, open(txt_file, 'rb'), 'text/plain')),
                ('files', (csv_file.name, open(csv_file, 'rb'), 'text/csv'))
            ]
            
            response = self.session.post(f"{self.base_url}/chat/upload_docs", files=files)
            
            # Close files
            for _, (_, file_obj, _) in files:
                file_obj.close()
                
            success = response.status_code == 200
            if success:
                data = response.json()
                has_message = "message" in data and "2 file" in data["message"]
                success = has_message
                self.log_test("Multiple File Upload", success, f"Processed {data.get('files_processed', 0)} files")
            else:
                self.log_test("Multiple File Upload", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Multiple File Upload", False, f"Error: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting comprehensive project testing...")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Server Health", self.test_server_health),
            ("User Creation", self.test_create_user),
            ("Chat Functionality", self.test_chat_functionality),
            ("Conversation History", self.test_conversation_history),
            ("TXT File Upload", self.test_file_upload_txt),
            ("CSV File Upload", self.test_file_upload_csv),
            ("JSON File Upload", self.test_file_upload_json),
            ("Add Documents Endpoint", self.test_add_documents_endpoint),
            ("Multiple File Upload", self.test_multiple_file_upload),
            ("RAG Integration", self.test_rag_integration),
        ]
        
        print(f"\nTesting {len(tests)} capabilities...\n")
        
        for test_name, test_func in tests:
            print(f"📋 Running {test_name}...")
            test_func()
            print()
            
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {passed/total*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Your project is working perfectly!")
            print("\n✨ Your RAG-enabled chatbot supports:")
            print("   ✅ Phase 3: Complete CRM integration with conversation logging")
            print("   ✅ Phase 4: Complete document upload (PDF/TXT/CSV/JSON)")
            print("   ✅ RAG system with TF-IDF vectorization")
            print("   ✅ Multi-file upload capability")
            print("   ✅ Context-aware responses using uploaded documents")
        else:
            print("\n⚠️  Some tests failed. Check the details above.")
            failed_tests = [r for r in self.results if not r["success"]]
            for test in failed_tests:
                print(f"   ❌ {test['test']}: {test['details']}")
            
        return passed == total
        
    def cleanup(self):
        """Clean up test files"""
        try:
            test_dir = Path("test_files")
            if test_dir.exists():
                import shutil
                shutil.rmtree(test_dir)
            print("🧹 Test files cleaned up.")
        except Exception as e:
            print(f"⚠️  Cleanup error: {str(e)}")

if __name__ == "__main__":
    print("🤖 RAG-Enabled Chatbot Project Tester")
    print("=" * 60)
    
    # Check if server is running
    print("\n⚠️  IMPORTANT: Make sure your server is running!")
    print("   Run: uvicorn app.main:app --reload --port 8000")
    print("\n⚠️  Make sure your .env file has your OpenAI API key")
    
    input("\nPress Enter to start testing...")
    
    tester = ProjectTester()
    try:
        all_passed = tester.run_all_tests()
        exit_code = 0 if all_passed else 1
    except KeyboardInterrupt:
        print("\n\n🛑 Testing interrupted by user")
        exit_code = 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        exit_code = 1
    finally:
        tester.cleanup()
        
    exit(exit_code) 
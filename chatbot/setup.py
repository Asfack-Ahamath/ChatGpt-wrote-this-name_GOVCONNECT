#!/usr/bin/env python3
"""
Setup script for GovConnect Chatbot
This script helps initialize the vector store and validate the environment.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from chatbot_core import (
    load_documents, 
    split_documents, 
    build_vector_store, 
    load_vector_store,
    validate_environment
)
from config import Config

def setup_environment():
    """Setup and validate the environment."""
    print("🔧 Setting up GovConnect Chatbot environment...")
    
    try:
        # Load environment variables
        load_dotenv()
        
        # Validate configuration
        Config.validate()
        print("✅ Environment validation passed")
        
        return True
    except Exception as e:
        print(f"❌ Environment setup failed: {e}")
        return False

def setup_vector_store():
    """Initialize or verify the vector store."""
    print("📚 Setting up vector store...")
    
    try:
        vector_path = Path(Config.VECTOR_DIR, "index.faiss")
        
        if vector_path.exists():
            print("📖 Existing vector store found. Testing load...")
            db = load_vector_store()
            print(f"✅ Vector store loaded successfully with {db.index.ntotal} vectors")
            return True
        else:
            print("🔄 No existing vector store found. Creating new one...")
            
            # Check if data directory exists and has files
            data_path = Path(Config.DATA_DIR)
            if not data_path.exists():
                print(f"❌ Data directory not found: {Config.DATA_DIR}")
                print("Please create the data directory and add your markdown files.")
                return False
            
            # Check for markdown files
            md_files = list(data_path.glob("*.md"))
            if not md_files:
                print(f"❌ No markdown files found in {Config.DATA_DIR}")
                print("Please add your markdown files to the data directory.")
                return False
            
            print(f"📄 Found {len(md_files)} markdown files")
            
            # Load and process documents
            documents = load_documents()
            if not documents:
                print("❌ No documents loaded")
                return False
            
            chunks = split_documents(documents)
            if not chunks:
                print("❌ No chunks created from documents")
                return False
            
            # Build vector store
            db = build_vector_store(chunks)
            print(f"✅ Vector store created successfully with {len(chunks)} chunks")
            return True
            
    except Exception as e:
        print(f"❌ Vector store setup failed: {e}")
        return False

def test_api_connection():
    """Test the connection to Mistral API."""
    print("🔗 Testing Mistral API connection...")
    
    try:
        from chatbot_core import call_mistral_api
        
        # Simple test query
        test_context = "This is a test context about Sri Lankan government services."
        test_query = "What services are available?"
        
        response = call_mistral_api(test_query, test_context)
        
        if response and len(response.strip()) > 0:
            print("✅ Mistral API connection successful")
            print(f"📝 Test response: {response[:100]}...")
            return True
        else:
            print("❌ Mistral API returned empty response")
            return False
            
    except Exception as e:
        print(f"❌ Mistral API test failed: {e}")
        return False

def main():
    """Main setup function."""
    print("🚀 GovConnect Chatbot Setup")
    print("=" * 40)
    
    success_count = 0
    total_checks = 3
    
    # 1. Environment setup
    if setup_environment():
        success_count += 1
    
    # 2. Vector store setup
    if setup_vector_store():
        success_count += 1
    
    # 3. API connection test
    if test_api_connection():
        success_count += 1
    
    print("\n" + "=" * 40)
    print(f"Setup Results: {success_count}/{total_checks} checks passed")
    
    if success_count == total_checks:
        print("🎉 Setup completed successfully!")
        print("You can now start the chatbot with: python app.py")
        return True
    else:
        print("⚠️ Setup completed with issues. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

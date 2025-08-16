#!/usr/bin/env python3
"""
Simple run script for the GovConnect Chatbot API
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main function to run the Flask app."""
    try:
        # Import and run the app
        from app import app
        
        port = int(os.getenv('PORT', 5001))
        debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        host = os.getenv('HOST', '0.0.0.0')
        
        print("🤖 Starting GovConnect Chatbot API...")
        print(f"📍 Server: http://{host}:{port}")
        print(f"🔧 Debug mode: {debug}")
        print("🚀 Press Ctrl+C to stop")
        print("-" * 50)
        
        app.run(
            host=host,
            port=port,
            debug=debug
        )
        
    except KeyboardInterrupt:
        print("\n👋 Shutting down GovConnect Chatbot API...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

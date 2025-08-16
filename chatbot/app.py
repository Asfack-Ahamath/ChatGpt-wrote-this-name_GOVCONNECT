import os
import json
import logging
from datetime import datetime
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import your existing functions
from chatbot_core import (
    load_vector_store, 
    retrieve_documents, 
    format_context, 
    call_mistral_api,
    load_documents,
    split_documents,
    build_vector_store
)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"])

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables
db = None
VECTOR_DIR = os.getenv('VECTOR_DIR', 'govconnect_nic')

def initialize_vector_store():
    """Initialize or load the vector store at startup."""
    global db
    try:
        vector_path = Path(VECTOR_DIR, "index.faiss")
        if not vector_path.exists():
            logger.info("Vector DB not found. Creating new one...")
            documents = load_documents()
            chunks = split_documents(documents)
            db = build_vector_store(chunks)
            logger.info("Vector store created successfully.")
        else:
            logger.info("Loading existing vector DB...")
            db = load_vector_store()
            logger.info("Vector store loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize vector store: {str(e)}")
        db = None

def log_interaction(query, answer, user_ip=None):
    """Log chat interactions for monitoring and improvement."""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = {
            "timestamp": timestamp,
            "query": query,
            "answer": answer,
            "user_ip": user_ip
        }
        
        log_path = "chat_logs.json"
        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8") as f:
                try:
                    logs = json.load(f)
                except json.JSONDecodeError:
                    logs = []
        else:
            logs = []
        
        logs.append(log_entry)
        
        # Keep only last 1000 interactions to prevent file from growing too large
        if len(logs) > 1000:
            logs = logs[-1000:]
        
        with open(log_path, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to log interaction: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "message": "GovConnect Chatbot API is running",
        "timestamp": datetime.now().isoformat(),
        "vector_store_loaded": db is not None
    })

@app.route('/chat', methods=['POST'])
def chat_with_bot():
    """Main chat endpoint for the React frontend."""
    try:
        # Validate request
        if not request.json or 'message' not in request.json:
            return jsonify({
                "error": "Invalid request. 'message' field is required."
            }), 400
        
        query = request.json['message'].strip()
        
        if not query:
            return jsonify({
                "error": "Message cannot be empty."
            }), 400
        
        # Check if vector store is loaded
        if db is None:
            logger.error("Vector store not loaded")
            return jsonify({
                "response": "I'm sorry, but I'm currently unable to process your request. The knowledge base is not available. Please try again later."
            }), 500
        
        logger.info(f"Processing query: {query[:100]}...")
        
        # Retrieve relevant documents
        relevant_docs = retrieve_documents(db, query, top_k=5)
        
        if not relevant_docs:
            return jsonify({
                "response": "I'm sorry, I couldn't find relevant information to answer your question. Please try rephrasing your question or ask about Sri Lankan government services, particularly NIC-related processes."
            })
        
        # Format context and call Mistral API
        context = format_context(relevant_docs)
        answer = call_mistral_api(query, context)
        
        # Log the interaction
        user_ip = request.remote_addr
        log_interaction(query, answer, user_ip)
        
        logger.info(f"Successfully processed query from {user_ip}")
        
        return jsonify({
            "response": answer,
            "sources_found": len(relevant_docs)
        })
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({
            "response": "I'm sorry, I encountered an error while processing your request. Please try again later.",
            "error": str(e) if app.debug else "Internal server error"
        }), 500

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    """Endpoint to collect user feedback on bot responses."""
    try:
        data = request.json
        if not data or 'rating' not in data:
            return jsonify({"error": "Rating is required"}), 400
        
        feedback_entry = {
            "timestamp": datetime.now().isoformat(),
            "rating": data['rating'],
            "message": data.get('message', ''),
            "bot_response": data.get('bot_response', ''),
            "user_query": data.get('user_query', ''),
            "user_ip": request.remote_addr
        }
        
        # Save feedback
        feedback_path = "feedback.json"
        if os.path.exists(feedback_path):
            with open(feedback_path, "r", encoding="utf-8") as f:
                try:
                    feedback_logs = json.load(f)
                except json.JSONDecodeError:
                    feedback_logs = []
        else:
            feedback_logs = []
        
        feedback_logs.append(feedback_entry)
        
        with open(feedback_path, "w", encoding="utf-8") as f:
            json.dump(feedback_logs, f, indent=2, ensure_ascii=False)
        
        return jsonify({"message": "Thank you for your feedback!"})
        
    except Exception as e:
        logger.error(f"Error saving feedback: {str(e)}")
        return jsonify({"error": "Failed to save feedback"}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get basic statistics about the chatbot usage."""
    try:
        stats = {
            "vector_store_loaded": db is not None,
            "total_documents": 0,
            "service_status": "running"
        }
        
        if db is not None:
            # Get document count if possible
            try:
                stats["total_documents"] = db.index.ntotal
            except:
                stats["total_documents"] = "unknown"
        
        # Get interaction count from logs
        log_path = "chat_logs.json"
        if os.path.exists(log_path):
            try:
                with open(log_path, "r", encoding="utf-8") as f:
                    logs = json.load(f)
                    stats["total_interactions"] = len(logs)
                    
                    # Get today's interactions
                    today = datetime.now().strftime("%Y-%m-%d")
                    today_interactions = [log for log in logs if log.get("timestamp", "").startswith(today)]
                    stats["today_interactions"] = len(today_interactions)
            except:
                stats["total_interactions"] = 0
                stats["today_interactions"] = 0
        else:
            stats["total_interactions"] = 0
            stats["today_interactions"] = 0
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({"error": "Failed to get stats"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Initialize vector store when the app starts
with app.app_context():
    initialize_vector_store()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting GovConnect Chatbot API on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
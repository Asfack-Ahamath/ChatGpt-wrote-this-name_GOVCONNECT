import os
import json
import pickle
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import core chatbot functions
from chatbot_core import (
    load_vector_store,
    retrieve_documents,
    call_mistral_api,
    load_documents,
    split_documents,
    build_vector_store,
)

# -------------------------------------------------------------------
# Environment & Config
# -------------------------------------------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173", "http://localhost:5174",
    "http://localhost:5175", "http://localhost:5176",
    "http://localhost:3000"
])

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Paths & Globals
VECTOR_DIR = os.getenv("VECTOR_DIR", "govconnect_KB")
MODEL_PATH = os.getenv("MODEL_PATH", "models/lightgbm_model_task_1.pkl")
TASK_FREQ_PATH = "task_freq.json"
QUEUE_BINS_PATH = "queue_bins.json"

db = None
lgbm_model = None
task_freq_map = {}
queue_bins = None


# -------------------------------------------------------------------
# Vector Store Initialization
# -------------------------------------------------------------------
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
        logger.error(f"Failed to initialize vector store: {e}")
        db = None


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "message": "GovConnect Chatbot API is running",
        "timestamp": datetime.now().isoformat(),
        "vector_store_loaded": db is not None,
    })


@app.route("/chat", methods=["POST"])
def chat_with_bot():
    """Main chat endpoint for the React frontend."""
    try:
        data = request.json
        query = data.get("message", "").strip() if data else ""

        if not query:
            return jsonify({"error": "Message cannot be empty."}), 400
        if db is None:
            logger.error("Vector store not loaded")
            return jsonify({
                "response": "The knowledge base is not available. Please try again later."
            }), 500

        logger.info(f"Processing query: {query[:100]}...")

        relevant_docs = retrieve_documents(db, query, top_k=5)
        if not relevant_docs:
            return jsonify({
                "response": "I couldn't find relevant information. Please rephrase your question or ask about Sri Lankan government services (e.g., NIC-related processes)."
            })

        answer = call_mistral_api(query, relevant_docs)
        logger.info(f"Successfully processed query from {request.remote_addr}")

        return jsonify({"response": answer, "sources_found": len(relevant_docs)})

    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        return jsonify({
            "response": "An error occurred while processing your request. Please try again later.",
            "error": str(e) if app.debug else "Internal server error",
        }), 500


@app.route("/feedback", methods=["POST"])
def submit_feedback():
    """Collect user feedback on bot responses."""
    try:
        data = request.json
        if not data or "rating" not in data:
            return jsonify({"error": "Rating is required"}), 400

        feedback_entry = {
            "timestamp": datetime.now().isoformat(),
            "rating": data["rating"],
            "message": data.get("message", ""),
            "bot_response": data.get("bot_response", ""),
            "user_query": data.get("user_query", ""),
            "user_ip": request.remote_addr,
        }

        feedback_path = "feedback.json"
        feedback_logs = []
        if os.path.exists(feedback_path):
            try:
                with open(feedback_path, "r", encoding="utf-8") as f:
                    feedback_logs = json.load(f)
            except json.JSONDecodeError:
                pass

        feedback_logs.append(feedback_entry)

        with open(feedback_path, "w", encoding="utf-8") as f:
            json.dump(feedback_logs, f, indent=2, ensure_ascii=False)

        return jsonify({"message": "Thank you for your feedback!"})
    except Exception as e:
        logger.error(f"Error saving feedback: {e}")
        return jsonify({"error": "Failed to save feedback"}), 500


@app.route("/stats", methods=["GET"])
def get_stats():
    """Get basic statistics about chatbot usage."""
    try:
        stats = {
            "vector_store_loaded": db is not None,
            "total_documents": getattr(getattr(db, "index", None), "ntotal", "unknown") if db else 0,
            "service_status": "running",
        }

        log_path = "chat_logs.json"
        if os.path.exists(log_path):
            try:
                with open(log_path, "r", encoding="utf-8") as f:
                    logs = json.load(f)
                stats["total_interactions"] = len(logs)
                today = datetime.now().strftime("%Y-%m-%d")
                stats["today_interactions"] = sum(
                    log.get("timestamp", "").startswith(today) for log in logs
                )
            except Exception:
                stats["total_interactions"] = 0
                stats["today_interactions"] = 0
        else:
            stats.update(total_interactions=0, today_interactions=0)

        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({"error": "Failed to get stats"}), 500


# -------------------------------------------------------------------
# Error Handlers
# -------------------------------------------------------------------
@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(_):
    return jsonify({"error": "Internal server error"}), 500


# -------------------------------------------------------------------
# Model Utilities
# -------------------------------------------------------------------
def load_model_and_mappings():
    """Load trained model and its auxiliary mappings."""
    global lgbm_model, task_freq_map, queue_bins
    try:
        with open(MODEL_PATH, "rb") as f:
            lgbm_model = pickle.load(f)
        logger.info("LightGBM model loaded successfully.")

        if os.path.exists(TASK_FREQ_PATH):
            with open(TASK_FREQ_PATH, "r") as f:
                task_freq_map = json.load(f)

        if os.path.exists(QUEUE_BINS_PATH):
            with open(QUEUE_BINS_PATH, "r") as f:
                queue_bins = json.load(f)
    except Exception as e:
        logger.error(f"Failed to load model: {e}")


def preprocess_input(data: dict):
    """Preprocess raw input into a feature vector for the model."""
    load_model_and_mappings()
    df = pd.DataFrame([data])

    df["appointment_datetime"] = pd.to_datetime(
        df["appointment_date"] + " " + df["appointment_time"]
    )
    df["day_of_week"] = df["appointment_datetime"].dt.dayofweek
    df["hour_of_day"] = df["appointment_datetime"].dt.hour
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    df["task_freq"] = df["task_id"].map(task_freq_map).fillna(0)

    if queue_bins:
        df["queue_bucket"] = pd.cut(
            df["queue_number"], bins=queue_bins,
            labels=False, include_lowest=True
        )
    else:
        df["queue_bucket"] = 0

    drop_cols = [
        "booking_id", "citizen_id", "booking_date", "appointment_date",
        "appointment_time", "check_in_time", "check_out_time",
        "satisfaction_rating", "task_id", "queue_number", "appointment_datetime",
    ]
    return df.drop(columns=[c for c in drop_cols if c in df.columns], errors="ignore")


@app.route("/predict_time", methods=["POST"])
def predict_time():
    """Predict completion time using LightGBM model."""
    try:
        if not request.json:
            return jsonify({"error": "Invalid request. JSON body required"}), 400

        X = preprocess_input(request.json)
        if lgbm_model is None:
            return jsonify({"error": "Model not loaded"}), 500

        prediction = float(lgbm_model.predict(X)[0])
        return jsonify({"predicted_completion_time_minutes": round(prediction, 2)})
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": "Failed to make prediction"}), 500


# -------------------------------------------------------------------
# Startup
# -------------------------------------------------------------------
with app.app_context():
    initialize_vector_store()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    logger.info(f"Starting GovConnect Chatbot API on port {port}")
    logger.info(f"Debug mode: {debug}")

    app.run(host="0.0.0.0", port=port, debug=debug)

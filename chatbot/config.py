import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for the Flask chatbot application."""
    
    # Mistral AI Configuration
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    MISTRAL_MODEL_ID = os.getenv("MISTRAL_MODEL_ID", "ft:open-mistral-7b:0ffd4d8a:20250718:0b9abfb2")
    
    # Vector Store Configuration
    VECTOR_DIR = os.getenv("VECTOR_DIR", "govconnect_nic")
    EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-base-en-v1.5")
    DATA_DIR = os.getenv("DATA_DIR", "data")
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1024"))
    
    # Flask Configuration
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    PORT = int(os.getenv("PORT", "5001"))
    HOST = os.getenv("HOST", "0.0.0.0")
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://localhost:4173"
    ]
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate(cls):
        """Validate required configuration."""
        errors = []
        
        if not cls.MISTRAL_API_KEY:
            errors.append("MISTRAL_API_KEY is required")
        
        if not os.path.exists(cls.DATA_DIR):
            errors.append(f"Data directory not found: {cls.DATA_DIR}")
        
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
        
        return True

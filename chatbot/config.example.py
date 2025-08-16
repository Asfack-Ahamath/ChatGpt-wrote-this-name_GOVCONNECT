# Example configuration file for GovConnect Chatbot
# Copy this file to config.py and update with your actual values

# OpenAI API Configuration
OPENAI_API_KEY = "your_api_key_here"
OPENAI_MODEL = "gpt-3.5-turbo"  # or "gpt-4" if available
OPENAI_TEMPERATURE = 0.7
OPENAI_MAX_TOKENS = 500

# Flask Application Settings
SECRET_KEY = "your_secret_key_here"  # Generate a secure random key for production
DEBUG = False  # Set to False in production
HOST = "0.0.0.0"
PORT = 5000

# Database Configuration
DATABASE_URL = "your_database_url_here"
DATABASE_POOL_SIZE = 5
DATABASE_MAX_OVERFLOW = 10

# FAISS Index Settings
FAISS_INDEX_PATH = "govconnect_nic/index.faiss"
FAISS_MAPPING_PATH = "govconnect_nic/index.pkl"
EMBEDDING_MODEL = "text-embedding-ada-002"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
CHAT_LOG_FILE = "chat_logs.json"
ERROR_LOG_FILE = "error.log"

# Rate Limiting
RATE_LIMIT = "100 per minute"
RATE_LIMIT_STORAGE_URL = "memory://"

# Security Settings
ALLOWED_ORIGINS = ["http://localhost:3000", "https://your-production-domain.com"]
SSL_CERT_PATH = None  # Path to SSL certificate for HTTPS
SSL_KEY_PATH = None   # Path to SSL private key for HTTPS

# Content Settings
MAX_CHAT_HISTORY = 10
MAX_QUESTION_LENGTH = 500
MIN_CONFIDENCE_SCORE = 0.7

# Feature Flags
ENABLE_FEEDBACK = True
ENABLE_ANALYTICS = True
ENABLE_CACHING = True
ENABLE_RATE_LIMITING = True

# Cache Configuration
CACHE_TYPE = "simple"  # Use "redis" in production
CACHE_REDIS_URL = None  # Redis URL for production caching
CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes

# Analytics Configuration
ANALYTICS_ENABLED = True
ANALYTICS_PROVIDER = "local"  # or "google", "mixpanel", etc.
ANALYTICS_ID = None

# Notification Settings
ENABLE_NOTIFICATIONS = False
NOTIFICATION_PROVIDER = None  # "email", "slack", etc.
NOTIFICATION_RECIPIENTS = []

# Development Settings (disable in production)
DEVELOPMENT_MODE = False
TESTING = False
PROFILE = False

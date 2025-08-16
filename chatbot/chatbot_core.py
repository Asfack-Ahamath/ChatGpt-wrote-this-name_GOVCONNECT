import os
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer

# ===== Configuration =====
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MODEL_ID = os.getenv("MISTRAL_MODEL_ID", "ft:open-mistral-7b:0ffd4d8a:20250718:0b9abfb2")
VECTOR_DIR = os.getenv("VECTOR_DIR", "govconnect_KB")
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")  
DATA_DIR = os.getenv("DATA_DIR", "data")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "512"))  

# Initialize tokenizer
try:
    TOKENIZER = AutoTokenizer.from_pretrained(EMBED_MODEL)
except Exception as e:
    print(f"Warning: Could not load tokenizer: {e}")
    TOKENIZER = None

# ===== Utility Functions =====
def trim_long_chunks(chunks, max_tokens=MAX_TOKENS):
    """Split chunks that exceed token limit into smaller ones."""
    if not TOKENIZER:
        return chunks
    
    print(f"[DEBUG] Trimming chunks to max {max_tokens} tokens...")
    trimmed = []
    for idx, chunk in enumerate(chunks):
        tokens = TOKENIZER.encode(chunk.page_content, truncation=False)
        if len(tokens) > max_tokens:
            words = chunk.page_content.split()
            midpoint = len(words) // 2
            chunk1 = chunk.copy()
            chunk1.page_content = " ".join(words[:midpoint])

            chunk2 = chunk.copy()
            chunk2.page_content = " ".join(words[midpoint:])

            trimmed.extend([chunk1, chunk2])
            print(f"[DEBUG] Chunk {idx} split due to size.")
        else:
            trimmed.append(chunk)
    print(f"[DEBUG] Total chunks after trimming: {len(trimmed)}")
    return trimmed

def load_documents(data_dir=None):
    """Load Markdown NIC documents from directory."""
    if data_dir is None:
        data_dir = DATA_DIR
    
    print(f"[DEBUG] Loading markdown documents from {data_dir}...")
    
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Data directory not found: {data_dir}")
    
    loader = DirectoryLoader(data_dir, loader_cls=UnstructuredMarkdownLoader)
    documents = loader.load()
    print(f"[DEBUG] Loaded {len(documents)} documents.")
    return documents

def split_documents(documents):
    """Split NIC docs into structured chunks by headers."""
    print(f"[DEBUG] Splitting documents by headers...")
    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[
        ("#", "H1"), ("##", "H2"), ("###", "H3")
    ])

    all_chunks = []
    for doc in documents:
        markdown_text = doc.page_content
        chunks = splitter.split_text(markdown_text)
        for chunk in chunks:
            chunk.metadata["source_file"] = doc.metadata.get("source", "unknown_file.md")
            chunk.metadata["section"] = chunk.metadata.get("header", "General")
        all_chunks.extend(chunks)

    print(f"[DEBUG] Split into {len(all_chunks)} chunks.")
    return trim_long_chunks(all_chunks)

def build_vector_store(chunks, vector_dir=None):
    """Create FAISS vector store from document chunks."""
    if vector_dir is None:
        vector_dir = VECTOR_DIR
    
    print(f"[DEBUG] Building FAISS vector store...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    db = FAISS.from_documents(chunks, embeddings)
    
    # Create directory if it doesn't exist
    os.makedirs(vector_dir, exist_ok=True)
    db.save_local(vector_dir)
    print(f"[DEBUG] Vector store saved at {vector_dir}.")
    return db

def load_vector_store(vector_dir=None):
    """Load existing FAISS vector store."""
    if vector_dir is None:
        vector_dir = VECTOR_DIR
    
    print(f"[DEBUG] Loading FAISS vector store from {vector_dir}...")
    
    if not os.path.exists(vector_dir):
        raise FileNotFoundError(f"Vector store directory not found: {vector_dir}")
    
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    db = FAISS.load_local(vector_dir, embeddings, allow_dangerous_deserialization=True)
    print(f"[DEBUG] Vector store loaded successfully.")
    return db

def retrieve_documents(db, query, top_k=4):
    """Retrieve top matching documents for query."""
    retriever = db.as_retriever(search_kwargs={"k": top_k})
    docs = retriever.invoke(query)
    print(f"[DEBUG] Retrieved {len(docs)} relevant chunks.")
    return docs

def call_mistral_api(query, context):
    """Send query + context to Mistral API."""
    print(f"[DEBUG] Calling Mistral API...")
    
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY environment variable is not set")
    
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    system_message = (
    "You are GovConnect Assistant — a trusted, friendly, and professional AI assistant that helps citizens of Sri Lanka "
    "with government services. You specialize in:\n"
    "- National Identity Card (NIC)\n"
    "- Birth Certificates\n"
    "- Driver’s Licenses\n"
    "- Vehicle Registration\n"
    "- Passports\n"
    "- Other citizen identity or registration-related services\n\n"

    "INTERACTION MINDFULNESS:\n"
    "1. If the user greets you (e.g., 'hi', 'hello', 'good morning'), reply briefly with a warm greeting. "
    "Example: 'Hello! How can I help you today?'\n"
    "2. If the user makes small talk (e.g., 'how are you?', 'what’s up?'), keep your response short and polite, "
    "then guide them back: 'I’m doing well, thank you! How can I assist you with government services today?'\n"
    "3. If the user’s intent is unclear, ask a polite clarifying question instead of giving a long generic answer.\n"
    "4. If the user asks about a government service (NIC, Birth Certificate, Driver’s License, Vehicle Registration, Passport), "
    "provide clear, step-by-step guidance using ONLY the provided context.\n"
    "5. If the user asks something outside of your knowledge base or context, respond: "
    "'I don't have that specific information in my knowledge base. For the most accurate and up-to-date information, please contact the relevant government department directly.'\n"
    "6. Always detect the intent behind the query (e.g., greeting, small talk, service request, out-of-scope) and adjust your response accordingly.\n"
    "7. Keep answers concise, structured, and easy to follow. Use numbered steps for processes and bullet points for lists.\n"
    "8. Maintain a friendly, professional, and helpful tone — like a government helpdesk officer assisting a citizen.\n\n"

    "EXAMPLES OF STYLE:\n"
    "- User: 'hi' → Assistant: 'Hi there! How can I help you today?'\n"
    "- User: 'how are you?' → Assistant: 'I’m doing well, thank you! How can I assist you with government services today?'\n"
    "- User: 'How do I renew my NIC?' → Assistant: Provide clear step-by-step instructions.\n"
    "- User: 'Tell me about passports' → Assistant: Provide structured guidance from the context.\n"
    "- User: 'How do I get a land permit?' → Assistant: 'That’s not in my knowledge base. For the most accurate details, please contact the relevant government office.'\n\n"

    "CONTEXT (Knowledge Base):\n"
    "---\n"
    f"{context}\n"
    "---\n\n"

    "Please respond strictly based on the above context and interaction rules."
)

    
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": query}
    ]

    body = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(url, headers=headers, json=body, timeout=30)
        response.raise_for_status()
        answer = response.json()["choices"][0]["message"]["content"]
        return answer.strip()
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Mistral API request failed: {e}")
        raise Exception(f"Failed to get response from AI service: {str(e)}")
    except KeyError as e:
        print(f"[ERROR] Unexpected API response format: {e}")
        raise Exception("Received unexpected response from AI service")
    except Exception as e:
        print(f"[ERROR] Unexpected error calling Mistral API: {e}")
        raise Exception(f"AI service error: {str(e)}")

def validate_environment():
    """Validate that all required environment variables are set."""
    required_vars = ["MISTRAL_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Check if data directory exists
    if not os.path.exists(DATA_DIR):
        raise FileNotFoundError(f"Data directory not found: {DATA_DIR}")
    
    print("[DEBUG] Environment validation passed.")

# Initialize and validate on import
if __name__ != "__main__":
    try:
        validate_environment()
    except Exception as e:
        print(f"[WARNING] Environment validation failed: {e}")

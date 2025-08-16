from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Import your existing functions
from .main import load_vector_store, retrieve_documents, format_context, call_mistral_api

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load vector store once at startup
db = load_vector_store()

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat_with_bot(req: ChatRequest):
    try:
        query = req.query
        docs = retrieve_documents(db, query)
        context = format_context(docs)
        answer = call_mistral_api(query, context)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}



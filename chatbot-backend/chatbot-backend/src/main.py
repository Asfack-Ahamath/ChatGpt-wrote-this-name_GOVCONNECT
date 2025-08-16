import os
from dotenv import load_dotenv
from pathlib import Path
import requests
from datetime import datetime
import json

from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt

# ===== Console Setup =====
console = Console()

# ===== Environment Setup =====
load_dotenv()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MODEL_ID = os.getenv("MISTRAL_MODEL_ID", "ft:open-mistral-7b:0ffd4d8a:20250718:0b9abfb2")

# ===== Paths & Config =====
VECTOR_DIR = "TT2025_nic"
EMBED_MODEL = "BAAI/bge-base-en-v1.5"
TOKENIZER = AutoTokenizer.from_pretrained(EMBED_MODEL)
MAX_TOKENS = 1024  # limit chunk size

# ===== Utility Functions =====
def trim_long_chunks(chunks, max_tokens=MAX_TOKENS):
    """Split chunks that exceed token limit into smaller ones."""
    console.print(f"[yellow][DEBUG][/yellow] Trimming chunks to max {max_tokens} tokens...")
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
            console.print(f"[yellow][DEBUG][/yellow] Chunk {idx} split due to size.")
        else:
            trimmed.append(chunk)
    console.print(f"[yellow][DEBUG][/yellow] Total chunks after trimming: {len(trimmed)}")
    return trimmed

def load_documents(data_dir="TT2025/data"):
    """Load Markdown NIC documents from directory."""
    console.print(f"[yellow][DEBUG][/yellow] Loading markdown documents from {data_dir}...")
    loader = DirectoryLoader(data_dir, loader_cls=UnstructuredMarkdownLoader)
    documents = loader.load()
    console.print(f"[yellow][DEBUG][/yellow] Loaded {len(documents)} documents.")
    return documents

def split_documents(documents):
    """Split NIC docs into structured chunks by headers."""
    console.print(f"[yellow][DEBUG][/yellow] Splitting documents by headers...")
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

    console.print(f"[yellow][DEBUG][/yellow] Split into {len(all_chunks)} chunks.")
    return trim_long_chunks(all_chunks)

def build_vector_store(chunks, vector_dir=VECTOR_DIR):
    """Create FAISS vector store from document chunks."""
    console.print(f"[yellow][DEBUG][/yellow] Building FAISS vector store...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    db = FAISS.from_documents(chunks, embeddings)
    db.save_local(vector_dir)
    console.print(f"[green][DEBUG][/green] Vector store saved at {vector_dir}.")
    return db

def load_vector_store(vector_dir=VECTOR_DIR):
    """Load existing FAISS vector store."""
    console.print(f"[yellow][DEBUG][/yellow] Loading FAISS vector store from {vector_dir}...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    db = FAISS.load_local(vector_dir, embeddings, allow_dangerous_deserialization=True)
    console.print(f"[green][DEBUG][/green] Vector store loaded successfully.")
    return db

def retrieve_documents(db, query, top_k=5):
    """Retrieve top matching documents for query."""
    retriever = db.as_retriever(search_kwargs={"k": top_k})
    docs = retriever.invoke(query)
    console.print(f"[yellow][DEBUG][/yellow] Retrieved {len(docs)} relevant chunks.")
    return docs

def format_context(relevant_docs):
    """Format retrieved docs into context for LLM."""
    sections = []
    for i, doc in enumerate(relevant_docs, 1):
        file_name = doc.metadata.get("source_file", "unknown")
        section = doc.metadata.get("section", "General")
        content = doc.page_content.strip()
        sections.append(f"[Document {i} - {file_name} | Section: {section}]\n{content}")
    return "\n\n".join(sections)

def call_mistral_api(query, context):
    """Send query + context to Mistral API."""
    console.print(f"[yellow][DEBUG][/yellow] Calling Mistral API...")
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant specializing in Sri Lankan government services, "
                "especially National Identity Card (NIC) processes. "
                "Answer questions strictly using the provided context. "
                "If the answer is not in the context, say: 'I don't know based on the provided information.'\n\n"
                "Provide concise, accurate answers and include step-by-step instructions if applicable.\n\n"
                "## CONTEXT:\n"
                "---\n"
                f"{context}\n"
                "---"
            )
        },
        {"role": "user", "content": query}
    ]

    body = {"model": MODEL_ID, "messages": messages, "temperature": 0.4}
    response = requests.post(url, headers=headers, json=body)
    response.raise_for_status()
    answer = response.json()["choices"][0]["message"]["content"]
    return answer

def log_interaction(query, answer, log_path="chat_log.json"):
    """Save chat logs."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = {"timestamp": timestamp, "query": query, "answer": answer}

    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = []
    else:
        logs = []

    logs.append(log_entry)
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2, ensure_ascii=False)

# ===== Main Chat Loop =====
def run_chat_loop(db):
    console.print("[bold green]NIC Information Assistant ready. Type 'exit' to quit.[/bold green]\n")
    while True:
        try:
            query = Prompt.ask("[bold cyan]Ask about NIC services[/bold cyan]")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[bold red]Session terminated.[/bold red]")
            break

        if query.lower() in ["exit", "quit"]:
            console.print("[bold yellow]Exiting assistant.[/bold yellow]")
            break

        relevant_docs = retrieve_documents(db, query)
        console.print("\n[bold blue]Top Matching Chunks:[/bold blue]")
        for i, doc in enumerate(relevant_docs, 1):
            preview = doc.page_content[:300].replace("\n", " ")
            console.print(f"[{i}] {preview}...\n", style="dim")

        context = format_context(relevant_docs)
        try:
            answer = call_mistral_api(query, context)
            console.print("\n[bold magenta]-----------------------------------------------------------------------------\n[/bold magenta]")
            console.print("[bold green]Query:[/bold green]")
            console.print(Markdown(query.strip()))    
            console.print("[bold green]Answer:[/bold green]")
            console.print(Markdown(answer.strip()))
            console.print("\n[bold magenta]-----------------------------------------------------------------------------\n[/bold magenta]")
            #log_interaction(query, answer)
        except Exception as e:
            console.print(f"[bold red]Error: {e}[/bold red]")

# ===== Entry Point =====
if __name__ == "__main__":
    vector_path = Path(VECTOR_DIR, "index.faiss")
    if not vector_path.exists():
        console.print("[yellow][DEBUG][/yellow] Vector DB not found. Creating...")
        documents = load_documents()
        chunks = split_documents(documents)
        db = build_vector_store(chunks)
    else:
        console.print("[yellow][DEBUG][/yellow] Loading existing vector DB...")
        db = load_vector_store()

    run_chat_loop(db)

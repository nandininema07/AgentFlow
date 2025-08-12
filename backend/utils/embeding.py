import os
import asyncio
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
from utils import gemini,memory,sumarizer

from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

def gather_files(directory: str, extensions: list) -> list:
    """Collects file paths in a directory with given file extensions."""
    files = []
    if not os.path.exists(directory):
        return files
    for filename in os.listdir(directory):
        if any(filename.lower().endswith(ext) for ext in extensions):
            files.append(os.path.join(directory, filename))
    return files

async def run_rag_pipeline(agent_id: str):
    """
    Executes the RAG pipeline:
      1. Gathers multi-input data from files/URLs.
      2. Summarizes the aggregated content via Gemini.
      3. Splits the summary (if needed) into document chunks.
      4. Creates embeddings and stores them in a local Chroma vector store.
      5. Demonstrates a retrieval query.
    """
   
    PDF_DIR = "backend/_data/upload/pdf"
    IMAGE_DIR = "backend/_data/upload/images"
    TEXT_DIR = "backend/_data/upload/text"
    URLS = ["https://example.com"]  # List any URLs here
    RAW_TEXTS = ["Additional raw text input if needed."]

    
    pdf_files = gather_files(PDF_DIR, [".pdf"])
    image_files = gather_files(IMAGE_DIR, [".png", ".jpg", ".jpeg"])
    text_files = gather_files(TEXT_DIR, [".txt", ".md"])

    
    summary = await summarize_multi_input_data(
        pdf_files=pdf_files,
        image_files=image_files,
        file_paths=text_files,
        urls=URLS,
        texts=RAW_TEXTS
    )
    

    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    documents = splitter.create_documents([summary])

    
    PERSIST_DIR = "backend/_data/chroma_langchain"
    COLLECTION_NAME = "agent_memory"
    os.makedirs(PERSIST_DIR, exist_ok=True)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = Chroma(
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=PERSIST_DIR,
    )

    # Prepare documents for storage with metadata
    texts = [doc.page_content for doc in documents]
    metadatas = [{"agent": agent_id} for _ in texts]
    vector_store.add_texts(texts, metadatas=metadatas)
    vector_store.persist()
    

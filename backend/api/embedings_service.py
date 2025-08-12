import os
import asyncio
from fastapi import HTTPException
from utils import embeding  # The RAG pipeline function that performs summarization, embedding, and storage
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

async def run_embedding_pipeline(agent_id: str) -> str:
    """
    Triggers the complete RAG pipeline:
      1. Aggregates multi-input data.
      2. Summarizes the aggregated content via Gemini.
      3. Splits text (if needed) and creates embeddings.
      4. Stores the embeddings in a local Chroma vector store.
    
    Args:
        agent_id: A unique identifier for the agent.
        
    Returns:
        A success message once embeddings are stored.
    """
    try:
        # This function (from rag_pipeline.py) is expected to perform all the steps.
        await embeding.run_rag_pipeline(agent_id)
        return "Embeddings generated and stored successfully."
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in pipeline: {str(e)}")

async def query_embedding(agent_id: str, query: str) -> list:
    """
    Queries the Chroma vector store for documents relevant to the provided query.
    
    Args:
        agent_id: The agent identifier used to filter the embeddings.
        query: The user query.
    
    Returns:
        A list of matching document texts.
    """
    try:
        # Define parameters consistent with the pipeline
        PERSIST_DIR = "backend/_data/chroma_langchain"
        COLLECTION_NAME = "agent_memory"
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_store = Chroma(
            embedding_function=embeddings,
            collection_name=COLLECTION_NAME,
            persist_directory=PERSIST_DIR,
        )
        results = vector_store.similarity_search(query, k=3, filter={"agent": agent_id})
        return [doc.page_content for doc in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during querying: {str(e)}")

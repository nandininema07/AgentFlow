import os
from typing import List, Dict
from fastapi import APIRouter, HTTPException
from api import embedding_service  # Import the service layer functions

router = APIRouter()

@router.post("/embedding/run")
async def run_embedding(agent_id: str) -> Dict[str, str]:
    """
    Endpoint to trigger the RAG pipeline:
    - Reads multi-input files from a predefined directory.
    - Aggregates and summarizes the content.
    - Splits and creates vector embeddings.
    - Stores the embeddings in a local Chroma vector store.
    """
    try:
        result = await embedding_service.run_embedding_pipeline(agent_id)
        return {"message": "Embedding pipeline executed successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running embedding pipeline: {str(e)}")

@router.get("/embedding/query")
async def query_embedding(agent_id: str, query: str) -> Dict[str, List[str]]:
    """
    Endpoint to query the vector store for documents relevant to a given query.
    Filters results based on the provided agent_id.
    """
    try:
        results = await embedding_service.query_embedding(agent_id, query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying embeddings: {str(e)}")

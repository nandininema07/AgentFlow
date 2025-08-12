# main.py
import asyncio
import logging
import os

from api import (
    agent_controller,
    agent_service,
    generate_controller,
    call_controller,
    file_controller,  # Import file controller
)
from api.agent_service import _agent_scheduler
from colorlog import ColoredFormatter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Configure logging
formatter = ColoredFormatter(
    "%(log_color)s%(asctime)s - %(levelname)s - %(filename)s - %(message)s",
    datefmt=None,
    reset=True,
    log_colors={
        "DEBUG": "cyan",
        "INFO": "green",
        "WARNING": "yellow",
        "ERROR": "red",
        "CRITICAL": "bold_red",
    },
)

handler = logging.StreamHandler()
handler.setFormatter(formatter)

logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger(__name__)

app = FastAPI()


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(agent_controller.router, prefix="/agents", tags=["agents"])
app.include_router(
    file_controller.router, prefix="/files", tags=["files"]
)  # No Prefix Now
app.include_router(call_controller.call_router, prefix="/call", tags=["call"])
app.include_router(
    generate_controller.router, prefix="/generate", tags=["generate"]
)

DATA_DIR = "_data"
UPLOAD_DIR = "_data/uploaded"
MEMORY_DIR = "_data/memory"

try:
    app.mount(
        "/files", StaticFiles(directory=UPLOAD_DIR), name="files"
    )  # Serve uploaded files,  # Mount the static directory
except Exception as e:
    os.makedirs(UPLOAD_DIR)
    app.mount(
        "/files", StaticFiles(directory=UPLOAD_DIR), name="files"
    )  # Serve uploaded files  # Serve uploaded files


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI Agent Builder API"}


app.mount("/public", StaticFiles(directory=UPLOAD_DIR), name="static")


@app.on_event("startup")
async def startup_event():
    # Start the agent scheduler as a background task
    asyncio.create_task(_agent_scheduler())
    logger.info("AI Agent Builder API started")

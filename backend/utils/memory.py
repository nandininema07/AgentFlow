import sqlite3
import os
from typing import List, Optional

DATA_DIR = "_data"
MEMORY_DIR = os.path.join(DATA_DIR, "memory")

if not os.path.exists(MEMORY_DIR):
    os.makedirs(MEMORY_DIR)


def _get_memory_file_path(agent_id: str) -> str:
    return os.path.join(MEMORY_DIR, f"{agent_id}_memory.db")


def _create_table(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS agent_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            memory TEXT
        )
    """
    )
    conn.commit()
    conn.close()


def get_all(agent_id: str) -> List[str]:
    """Gets all memory entries for an agent."""
    db_path = _get_memory_file_path(agent_id)
    _create_table(db_path)  # Ensure table exists

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT memory FROM agent_memory ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()

    return [row[0] for row in rows]


def put(agent_id: str, memory: str):
    """Puts a new memory entry for an agent, capping to 20 entries."""
    db_path = _get_memory_file_path(agent_id)
    _create_table(db_path)  # Ensure table exists

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO agent_memory (memory) VALUES (?)", (memory,))
    conn.commit()

    # Enforce capping to 20 entries
    cursor.execute(
        """
        DELETE FROM agent_memory
        WHERE id NOT IN (
            SELECT id FROM agent_memory
            ORDER BY timestamp DESC
            LIMIT 20
        )
    """
    )
    conn.commit()
    conn.close()


def get_latest(agent_id: str) -> Optional[str]:
    """Gets the latest memory entry for an agent."""
    db_path = _get_memory_file_path(agent_id)
    _create_table(db_path)  # Ensure table exists

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT memory FROM agent_memory ORDER BY timestamp DESC LIMIT 1"
    )
    row = cursor.fetchone()
    conn.close()

    if row:
        return row[0]
    else:
        return None

import redis, json, logging
from fastapi import HTTPException
from typing import Optional, List, Dict, Any

from app.config import SESSION_TTL

# Create a placeholder for the global Redis client.
redis_client: Optional[redis.Redis] = None

def set_redis_client(client: redis.Redis):
    global redis_client
    redis_client = client

def get_redis_client() -> redis.Redis:
    if redis_client is None:
        logging.critical("Redis client has not been initialized.")
        raise ConnectionError("Redis client is not available.")
    return redis_client

def save_chat_history(session_id: str, history: List[Dict[str, Any]]):
    try:
        r = get_redis_client()
        r.set(f"session:{session_id}", json.dumps(history), ex=SESSION_TTL)
    except redis.exceptions.ConnectionError as e:
        logging.error(f"Redis connection failed during save: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Chat service is temporarily unavailable.")

def load_chat_history(session_id: str) -> List[Dict[str, Any]]:
    try:
        r = get_redis_client()
        data = r.get(f"session:{session_id}")
        return json.loads(data) if data else []
    except redis.exceptions.ConnectionError as e:
        logging.error(f"Redis connection failed during load: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Chat service is temporarily unavailable.")

# Scanno_auth/app/main.py
import logging, asyncio
import redis 
from fastapi import FastAPI, Depends 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session

from app import models 
from app import crud
from app.database import engine
from app.database import get_db
from app.middleware import SizeLimitMiddleware
from app.timeout_middleware import TimeoutMiddleware
from app.routes.chat_core_utils import set_redis_client
from app.routes import user_routes, admin_routes, chat_core
from app.config import REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_PASSWORD

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s: %(message)s",
    handlers=[logging.FileHandler("scanno_integrated.log"), logging.StreamHandler()],
)

redis_client: redis.Redis = None

app = FastAPI(title="Scanno Integrated AI Analyzer")

app.add_middleware(SizeLimitMiddleware, max_bytes=30 * 1024 * 1024)
app.add_middleware(TimeoutMiddleware, timeout_seconds=300)  # 5 minutes

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router, prefix="/user", tags=["User Authentication"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin (Key Management)"])
app.include_router(chat_core.router, tags=["AI Core Chat"])


@app.on_event("startup")
def startup_event():
    global redis_client
    print("Connecting to Redis...")

    try:
        models.Base.metadata.create_all(bind=engine)
        logging.info("SQLAlchemy database tables created/verified.")
    except Exception as e:
        logging.error(f"Failed to create database tables: {e}")

    try:
        r = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
	        password=REDIS_PASSWORD,
            decode_responses=True, 
        )
        r.ping()  
        
        set_redis_client(r)
        redis_client = r
        
        print("Redis connection established successfully!")
    except Exception as e:
        print(f"FATAL ERROR: Could not connect to Redis at {REDIS_HOST}:{REDIS_PORT}. Error: {e}")

@app.on_event("shutdown")
def shutdown_event():
    if redis_client:
        logging.info("Application shutdown.")

@app.get("/")
async def root():
    return JSONResponse({"message": "Scanno Integrated AI Analyzer Backend is operational."})

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "redis": redis_client.ping() if redis_client else False
    }

@app.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    checks = {
        "database": False,
        "redis": False,
        "openai_key": False
    }
    
    try:
        db.execute("SELECT 1")
        checks["database"] = True
        
        # Test Redis
        if redis_client:
            redis_client.ping()
            checks["redis"] = True
        
        # Test OpenAI key exists
        api_key = crud.get_api_key(db)
        checks["openai_key"] = bool(api_key and api_key.key_value)
        
    except Exception as e:
        logging.error(f"Readiness check failed: {e}")
    
    status_code = 200 if all(checks.values()) else 503
    return JSONResponse(content=checks, status_code=status_code)

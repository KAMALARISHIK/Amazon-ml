import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import settings
from src.database import engine, Base, SessionLocal
from src.seed_data import init_seed_dataset
from routes import auth, datasets, pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB Tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize default benchmark dataset & test user
    db = SessionLocal()
    try:
        init_seed_dataset(db)
    except Exception as e:
        print(f"[Warning] Failed to initialize seed dataset: {e}")
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Business Entity Resolution ML API - Cross-source record deduplication, blocking, and classification.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(pipeline.router, prefix=settings.API_V1_STR)

# Direct routes without /api prefix for flexibility
app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(pipeline.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "active_environment": "development"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

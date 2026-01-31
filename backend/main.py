"""
AI Research Assistant - Backend API
FastAPI + LangChain + OpenAI/Claude Integration
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, AsyncGenerator
import asyncio
import json

from api.chat import router as chat_router
from api.documents import router as documents_router
from api.analysis import router as analysis_router

# Initialize FastAPI
app = FastAPI(
    title="AI Research Assistant API",
    description="LLM-powered research and document analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(analysis_router, prefix="/api/analysis", tags=["Analysis"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Research Assistant API",
        "version": "1.0.0",
        "features": [
            "LLM Chat (GPT-4 / Claude 3)",
            "Document Analysis",
            "Code Generation",
            "RAG (Retrieval Augmented Generation)"
        ]
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "components": {
            "api": "operational",
            "llm": "operational",
            "vector_store": "operational"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

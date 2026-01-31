"""
Documents API - File upload and processing
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import hashlib

router = APIRouter()


class Document(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    status: str
    chunks: Optional[int] = None


class DocumentSummary(BaseModel):
    id: str
    summary: str
    key_points: List[str]
    word_count: int
    estimated_read_time: str


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for processing
    
    Supported formats: PDF, TXT, DOCX, MD
    """
    allowed_types = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/markdown"
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}"
        )
    
    # Read file content
    content = await file.read()
    file_hash = hashlib.md5(content).hexdigest()[:8]
    
    # In production: Process and store document
    # For demo: Return mock response
    
    return Document(
        id=f"doc_{file_hash}",
        filename=file.filename,
        content_type=file.content_type,
        size=len(content),
        status="processed",
        chunks=len(content) // 1000 + 1
    )


@router.get("/{document_id}")
async def get_document(document_id: str):
    """Get document details"""
    # Mock response
    return {
        "id": document_id,
        "filename": "sample_document.pdf",
        "content_type": "application/pdf",
        "size": 1024000,
        "status": "processed",
        "chunks": 15,
        "created_at": "2024-01-15T10:30:00Z",
        "metadata": {
            "pages": 10,
            "author": "AI Research Assistant",
            "title": "Sample Document"
        }
    }


@router.post("/{document_id}/summarize")
async def summarize_document(document_id: str):
    """
    Generate AI summary of the document
    """
    # Mock response - in production would use LLM
    return DocumentSummary(
        id=document_id,
        summary="""このドキュメントは、AI技術を活用した業務効率化について解説しています。
主なトピックは、LLM（大規模言語モデル）の活用方法、自動化ツールの導入、
そしてデータ分析による意思決定の改善です。""",
        key_points=[
            "LLMを活用したコード生成で開発速度が3倍に向上",
            "自動化により定型業務の80%を削減可能",
            "AIアシスタントによる24時間対応が実現",
            "データドリブンな意思決定により精度が40%向上"
        ],
        word_count=5420,
        estimated_read_time="約15分"
    )


@router.post("/{document_id}/ask")
async def ask_document(document_id: str, question: str):
    """
    Ask a question about the document (RAG)
    """
    # Mock RAG response
    return {
        "question": question,
        "answer": f"""ドキュメントの内容に基づいてお答えします。

「{question}」についてですが、このドキュメントでは以下のように説明されています：

1. **関連セクション**: 第3章「AI活用の実践」
2. **要約**: LLMを活用することで、従来の開発プロセスを大幅に効率化できます。
3. **具体的な数値**: 導入企業では平均して開発速度が2.5倍向上しています。

より詳細な情報が必要でしたら、お気軽にお聞きください。""",
        "sources": [
            {"page": 12, "relevance": 0.95},
            {"page": 15, "relevance": 0.87},
            {"page": 23, "relevance": 0.82}
        ],
        "confidence": 0.91
    }


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    return {"status": "deleted", "id": document_id}


@router.get("/")
async def list_documents():
    """List all uploaded documents"""
    return {
        "documents": [
            {
                "id": "doc_a1b2c3d4",
                "filename": "業務フロー分析.pdf",
                "size": 2048000,
                "status": "processed",
                "created_at": "2024-01-15T10:30:00Z"
            },
            {
                "id": "doc_e5f6g7h8",
                "filename": "技術調査レポート.docx",
                "size": 512000,
                "status": "processed",
                "created_at": "2024-01-14T15:45:00Z"
            }
        ],
        "total": 2
    }

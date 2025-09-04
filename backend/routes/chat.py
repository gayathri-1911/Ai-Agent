from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import uuid
from datetime import datetime

from services.contentstack import ContentstackService
from services.llm import LLMService

router = APIRouter()

# Initialize services
contentstack_service = ContentstackService()
llm_service = LLMService()

class ChatRequest(BaseModel):
    query: str
    provider: Optional[str] = 'groq'
    sessionId: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    success: bool
    message: Dict[str, Any]
    sessionId: str
    relatedContent: Optional[list] = None

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Handle chat requests with content-aware responses"""
    try:
        # Generate session ID if not provided
        session_id = request.sessionId or f"session_{uuid.uuid4().hex[:8]}"
        
        # Get relevant content from Contentstack based on query
        content_context = await contentstack_service.search_content(request.query)
        
        # Get LLM response with content context
        response_data = await llm_service.get_chat_response(
            query=request.query,
            session_id=session_id,
            provider=request.provider,
            content_context=content_context
        )
        
        if not response_data['success']:
            raise HTTPException(status_code=500, detail=response_data.get('error', 'LLM service error'))
        
        # Extract related content UIDs for frontend
        related_content = []
        if content_context['tours']:
            related_content.extend([tour['uid'] for tour in content_context['tours'][:3]])
        
        message = {
            'role': 'assistant',
            'content': response_data['content'],
            'timestamp': response_data['timestamp'],
            'provider': response_data['provider']
        }
        
        return ChatResponse(
            success=True,
            message=message,
            sessionId=session_id,
            relatedContent=related_content
        )
        
    except Exception as e:
        # Fallback response
        fallback_message = {
            'role': 'assistant',
            'content': f"I apologize, but I'm experiencing technical difficulties. Please try again in a moment. Error: {str(e)}",
            'timestamp': datetime.utcnow().isoformat(),
            'provider': request.provider or 'groq',
            'error': True
        }
        
        return ChatResponse(
            success=True,  # Still return success to avoid frontend errors
            message=fallback_message,
            sessionId=request.sessionId or f"session_{uuid.uuid4().hex[:8]}"
        )

@router.post("/chat/stream")
async def stream_chat_endpoint(request: ChatRequest):
    """Handle streaming chat requests"""
    try:
        # Generate session ID if not provided
        session_id = request.sessionId or f"session_{uuid.uuid4().hex[:8]}"
        
        # Get relevant content from Contentstack
        content_context = await contentstack_service.search_content(request.query)
        
        # Create streaming response
        async def generate_stream():
            yield "data: {}\n\n".format(json.dumps({
                'type': 'start',
                'sessionId': session_id,
                'provider': request.provider or 'groq'
            }))
            
            async for chunk in llm_service.stream_chat_response(
                query=request.query,
                session_id=session_id,
                provider=request.provider,
                content_context=content_context
            ):
                yield chunk
            
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except Exception as e:
        # Return error stream
        async def error_stream():
            error_data = {
                'error': str(e),
                'content': "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
                'is_complete': True,
                'provider': request.provider or 'groq',
                'timestamp': datetime.utcnow().isoformat()
            }
            yield f"data: {json.dumps(error_data)}\n\n"
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )

@router.get("/chat/providers")
async def get_providers():
    """Get available LLM providers"""
    return {
        'success': True,
        'providers': llm_service.get_available_providers()
    }
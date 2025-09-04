import os
import asyncio
import json
from typing import AsyncGenerator, Dict, Any, List, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    print("Warning: emergentintegrations not installed. Install with: pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/")
    raise

class LLMService:
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY environment variable is required")
        
        # Provider configurations
        self.providers = {
            'groq': {'provider': 'openai', 'model': 'gpt-4o-mini'},  # Using compatible model
            'openai': {'provider': 'openai', 'model': 'gpt-4o'},
            'claude': {'provider': 'anthropic', 'model': 'claude-3-5-sonnet-20241022'}
        }
        
        self.default_provider = 'groq'
        
    def get_travel_system_message(self) -> str:
        """Get system message optimized for travel assistant"""
        return """You are a professional Travel Assistant specializing in Italian tourism. You help users discover amazing tours, destinations, and travel experiences.

GUIDELINES:
- Be enthusiastic and knowledgeable about travel
- Provide specific, actionable information
- Include prices, durations, and key highlights when available
- Suggest related tours and destinations
- Use emojis sparingly for visual appeal
- Format responses with clear structure (use **bold** for important info)
- If you don't have specific information, acknowledge it and provide general helpful advice

CONTEXT: You have access to real-time tour and destination data from our content management system. Use this information to provide accurate, up-to-date recommendations."""

    async def create_chat_session(self, session_id: str, provider: str = None) -> LlmChat:
        """Create a new chat session with specified provider"""
        if not provider:
            provider = self.default_provider
            
        if provider not in self.providers:
            provider = self.default_provider
            
        config = self.providers[provider]
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=self.get_travel_system_message()
        ).with_model(config['provider'], config['model'])
        
        return chat
    
    def format_content_context(self, content_data: Dict[str, Any]) -> str:
        """Format Contentstack data for LLM context"""
        context_parts = []
        
        if 'tours' in content_data and content_data['tours']:
            context_parts.append("AVAILABLE TOURS:")
            for tour in content_data['tours'][:5]:  # Limit to prevent token overflow
                context_parts.append(f"""
• **{tour['title']}** - {tour['price']} ({tour['duration']})
  Location: {tour['location']}
  Category: {tour['category']}
  Highlights: {', '.join(tour['highlights'][:3])}
  Rating: {tour.get('rating', 'N/A')}/5""")
        
        if 'destinations' in content_data and content_data['destinations']:
            context_parts.append("\nAVAILABLE DESTINATIONS:")
            for dest in content_data['destinations']:
                context_parts.append(f"""
• **{dest['title']}**: {dest['description']}
  Best time to visit: {dest.get('best_time_to_visit', 'Year-round')}""")
        
        return '\n'.join(context_parts)
    
    async def get_chat_response(
        self, 
        query: str, 
        session_id: str, 
        provider: str = None,
        content_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get a complete chat response"""
        try:
            chat = await self.create_chat_session(session_id, provider)
            
            # Build enhanced query with content context
            enhanced_query = query
            if content_context:
                context_str = self.format_content_context(content_context)
                enhanced_query = f"{context_str}\n\nUSER QUERY: {query}\n\nPlease provide a helpful response based on the available tours and destinations above."
            
            user_message = UserMessage(text=enhanced_query)
            response = await chat.send_message(user_message)
            
            return {
                'success': True,
                'content': response,
                'provider': provider or self.default_provider,
                'timestamp': datetime.utcnow().isoformat(),
                'session_id': session_id
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
                'provider': provider or self.default_provider,
                'timestamp': datetime.utcnow().isoformat(),
                'session_id': session_id
            }
    
    async def stream_chat_response(
        self,
        query: str,
        session_id: str, 
        provider: str = None,
        content_context: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat response word by word (simulated for now)"""
        try:
            # Get the complete response first
            response_data = await self.get_chat_response(query, session_id, provider, content_context)
            
            if not response_data['success']:
                yield f"data: {json.dumps(response_data)}\n\n"
                return
            
            content = response_data['content']
            words = content.split()
            
            # Simulate streaming by yielding words with delays
            accumulated_content = ""
            for i, word in enumerate(words):
                accumulated_content += (" " if i > 0 else "") + word
                
                chunk_data = {
                    'content': accumulated_content,
                    'is_complete': i == len(words) - 1,
                    'provider': response_data['provider'],
                    'timestamp': response_data['timestamp']
                }
                
                yield f"data: {json.dumps(chunk_data)}\n\n"
                
                # Different speeds for different providers
                if provider == 'groq':
                    await asyncio.sleep(0.05)  # Fast
                elif provider == 'openai': 
                    await asyncio.sleep(0.08)  # Medium
                else:  # Claude
                    await asyncio.sleep(0.1)   # Slower
                    
        except Exception as e:
            error_data = {
                'error': str(e),
                'content': "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
                'is_complete': True,
                'provider': provider or self.default_provider,
                'timestamp': datetime.utcnow().isoformat()
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    def get_available_providers(self) -> List[Dict[str, str]]:
        """Get list of available LLM providers"""
        return [
            {'id': 'groq', 'name': 'Groq (Fast)', 'description': 'Ultra-fast inference'},
            {'id': 'openai', 'name': 'OpenAI GPT-4', 'description': 'High-quality responses'},
            {'id': 'claude', 'name': 'Claude', 'description': 'Excellent reasoning'}
        ]
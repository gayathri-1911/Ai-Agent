# API Contracts & Integration Plan

## 1. Contentstack Integration

### Contentstack Data Structure
Replace mock data with real Contentstack content types:

**Content Type: `tour`**
```json
{
  "title": "Rome City Tour",
  "description": "Explore the eternal city...",
  "price": "$500",
  "duration": "3 Days", 
  "location": "Rome, Italy",
  "highlights": ["Colosseum", "Vatican Museums"],
  "category": "Cultural",
  "uid": "rome_city_tour"
}
```

**Content Type: `destination`**
```json
{
  "title": "Italy",
  "description": "Experience the rich history...",
  "popular_tours": [references to tour entries],
  "uid": "italy"
}
```

### Contentstack API Endpoints
- **Base URL**: `https://cdn.contentstack.io/v3/content_types/{content_type}/entries`
- **Headers**: `api_key`, `access_token`
- **Query**: `?environment={env}&locale=en-us`

## 2. Backend API Contracts

### Chat API
**Endpoint**: `POST /api/chat`

**Request:**
```json
{
  "query": "What tours are available for Italy?",
  "provider": "groq", 
  "sessionId": "session_12345",
  "context": {
    "stack": "travel",
    "environment": "production"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Here are the tours available for Italy...",
    "provider": "groq",
    "relatedContent": ["rome_city_tour", "venice_gondola"],
    "timestamp": "2025-01-01T12:00:00Z"
  },
  "sessionId": "session_12345"
}
```

### Content API
**Endpoint**: `GET /api/content/tours`

**Response:**
```json
{
  "success": true,
  "tours": [
    {
      "uid": "rome_city_tour",
      "title": "Rome City Tour",
      "price": "$500",
      // ... other fields
    }
  ]
}
```

## 3. Mock Data Replacement Map

### Frontend Mock Data → Backend Endpoints
- `mockTravelData.tours` → `GET /api/content/tours`
- `mockTravelData.destinations` → `GET /api/content/destinations`  
- `mockResponses` → `POST /api/chat` (AI-generated responses)
- `findRelevantContent()` → Backend LLM + Contentstack integration

### useChatAgent Hook Changes
- Replace `findRelevantContent()` calls with `fetch('/api/chat')`
- Replace mock streaming with real streaming from backend
- Keep provider switching and session management
- Remove mock data imports

## 4. Backend Implementation Plan

### Dependencies to Add
```txt
emergentintegrations  # For Emergent LLM key
httpx                # For Contentstack API calls
```

### Backend Components
1. **Contentstack Service** (`/services/contentstack.py`)
   - API client for fetching content
   - Content parsing and transformation
   - Caching layer

2. **LLM Service** (`/services/llm.py`) 
   - Emergent LLM integration (Groq, OpenAI, Claude)
   - Streaming response handling
   - Context-aware prompt engineering

3. **Chat Controller** (`/routes/chat.py`)
   - Handle chat requests
   - Orchestrate Contentstack + LLM
   - Stream responses to frontend

4. **Content Controller** (`/routes/content.py`)
   - Direct Contentstack content access
   - For SDK content browsing features

### Environment Variables Needed
```
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_ACCESS_TOKEN=your_access_token
CONTENTSTACK_ENVIRONMENT=production
EMERGENT_LLM_KEY=auto_from_environment
```

## 5. Frontend Integration Changes

### Remove Mock Dependencies
- Delete `/src/data/mockTravelData.js`
- Update `useChatAgent.js` to use real API calls
- Replace streaming simulation with real streaming

### API Client Setup
```js
const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Chat endpoint
const chatResponse = await fetch(`${API_BASE}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, provider, sessionId })
});

// Streaming handling
const reader = chatResponse.body.getReader();
// ... streaming logic
```

### Updated Chat Flow
1. User sends query → `POST /api/chat`
2. Backend queries Contentstack for relevant content
3. Backend sends context + query to LLM via Emergent key
4. Backend streams LLM response back to frontend
5. Frontend displays streaming response with real content

## 6. Testing Strategy

### Backend Testing
- Test Contentstack API connectivity
- Test LLM provider switching (Groq → OpenAI → Claude)
- Test streaming responses
- Test content retrieval and parsing

### Integration Testing  
- Test end-to-end chat flow with real content
- Test provider switching maintains context
- Test session management across requests
- Test error handling (API failures, rate limits)

### Demo Scenarios
- "What tours are available for Italy?" → Real Italy tours from Contentstack
- "Tell me about Rome tours" → Specific Rome tour details
- "What's the price for Venice?" → Real pricing from CMS
- Provider switching → Same query, different LLM responses

This approach ensures the React SDK works with live content while maintaining all the demo functionality we've built.
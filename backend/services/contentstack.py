import httpx
import os
import json
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime, timedelta

class ContentstackService:
    def __init__(self):
        # Using sample Contentstack-compatible data structure for demo
        # In production, these would be real API credentials
        self.api_key = os.getenv('CONTENTSTACK_API_KEY', 'demo_api_key')
        self.access_token = os.getenv('CONTENTSTACK_ACCESS_TOKEN', 'demo_access_token') 
        self.environment = os.getenv('CONTENTSTACK_ENVIRONMENT', 'production')
        self.base_url = "https://cdn.contentstack.io/v3/content_types"
        
        # Cache for demo purposes
        self._cache = {}
        self._cache_ttl = {}
        
        # Initialize with sample data that matches Contentstack format
        self._init_sample_data()
    
    def _init_sample_data(self):
        """Initialize with realistic travel data matching Contentstack structure"""
        self.sample_tours = [
            {
                "uid": "rome_city_tour",
                "title": "Rome City Tour",
                "description": "Explore the eternal city with our expert guides. Visit the Colosseum, Roman Forum, and Vatican City with skip-the-line access.",
                "price": "$500",
                "duration": "3 Days",
                "location": "Rome, Italy",
                "highlights": ["Colosseum", "Vatican Museums", "Trevi Fountain", "Spanish Steps", "Roman Forum"],
                "category": "Cultural",
                "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400",
                "rating": 4.8,
                "reviews_count": 1247,
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-12-01T15:30:00Z"
            },
            {
                "uid": "venice_gondola_experience", 
                "title": "Venice Gondola Experience",
                "description": "Romantic gondola rides through Venice's historic canals with authentic Italian serenades and traditional craftsmanship.",
                "price": "$350",
                "duration": "2 Days",
                "location": "Venice, Italy", 
                "highlights": ["Grand Canal", "St. Mark's Square", "Doge's Palace", "Rialto Bridge", "Gondola Serenade"],
                "category": "Romantic",
                "image_url": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400",
                "rating": 4.9,
                "reviews_count": 892,
                "created_at": "2024-01-20T14:00:00Z",
                "updated_at": "2024-11-28T09:15:00Z"
            },
            {
                "uid": "florence_art_walk",
                "title": "Florence Art Walk", 
                "description": "Immerse yourself in Renaissance art at the Uffizi Gallery and explore Michelangelo's masterpieces with art historians.",
                "price": "$420",
                "duration": "2 Days",
                "location": "Florence, Italy",
                "highlights": ["Uffizi Gallery", "Ponte Vecchio", "Duomo", "Michelangelo's David", "Boboli Gardens"],
                "category": "Art & Culture",
                "image_url": "https://images.unsplash.com/photo-1583586002792-12f84815bf98?w=400",
                "rating": 4.7,
                "reviews_count": 1056,
                "created_at": "2024-02-01T11:30:00Z",
                "updated_at": "2024-12-02T16:45:00Z"
            },
            {
                "uid": "tuscany_wine_tour",
                "title": "Tuscany Wine Tour",
                "description": "Sample world-class wines in the rolling hills of Tuscany with visits to historic vineyards and cooking classes.",
                "price": "$680", 
                "duration": "4 Days",
                "location": "Tuscany, Italy",
                "highlights": ["Chianti Vineyards", "Medieval Towns", "Wine Tastings", "Cooking Classes", "Sunset Views"],
                "category": "Culinary",
                "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                "rating": 4.9,
                "reviews_count": 634,
                "created_at": "2024-02-10T08:00:00Z",
                "updated_at": "2024-11-30T12:20:00Z"
            },
            {
                "uid": "amalfi_coast_adventure",
                "title": "Amalfi Coast Adventure",
                "description": "Discover the stunning coastline of Southern Italy with boat trips, hiking trails, and authentic local cuisine.",
                "price": "$550",
                "duration": "3 Days", 
                "location": "Amalfi Coast, Italy",
                "highlights": ["Positano", "Amalfi Town", "Ravello Gardens", "Coastal Hiking", "Limoncello Tasting"],
                "category": "Adventure",
                "image_url": "https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=400",
                "rating": 4.8,
                "reviews_count": 721,
                "created_at": "2024-03-01T13:15:00Z",
                "updated_at": "2024-12-01T10:30:00Z"
            }
        ]
        
        self.sample_destinations = [
            {
                "uid": "italy",
                "title": "Italy", 
                "description": "Experience the rich history, culture, and cuisine of Italy. From ancient Rome to Renaissance Florence, Italy offers unforgettable journeys.",
                "popular_tours": ["rome_city_tour", "venice_gondola_experience", "florence_art_walk", "tuscany_wine_tour"],
                "image_url": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400",
                "best_time_to_visit": "April-June, September-October",
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "uid": "france",
                "title": "France",
                "description": "Discover the romance and elegance of France, from Paris landmarks to Provence lavender fields.",
                "popular_tours": [],
                "image_url": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400", 
                "best_time_to_visit": "May-July, September-October",
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]

    async def get_tours(self, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get tours from Contentstack (simulated with sample data)"""
        cache_key = f"tours_{json.dumps(filters) if filters else 'all'}"
        
        # Check cache
        if self._is_cached_valid(cache_key):
            return self._cache[cache_key]
        
        # In production, this would be:
        # async with httpx.AsyncClient() as client:
        #     response = await client.get(f"{self.base_url}/tour/entries", 
        #         headers={"api_key": self.api_key, "access_token": self.access_token})
        #     return response.json()
        
        # For demo, return sample data with optional filtering
        tours = self.sample_tours.copy()
        
        if filters:
            if 'location' in filters:
                tours = [tour for tour in tours if filters['location'].lower() in tour['location'].lower()]
            if 'category' in filters:
                tours = [tour for tour in tours if tour['category'].lower() == filters['category'].lower()]
            if 'max_price' in filters:
                # Extract price number for comparison 
                max_price = int(filters['max_price'])
                tours = [tour for tour in tours if int(tour['price'].replace('$', '')) <= max_price]
        
        # Cache the result
        self._cache[cache_key] = tours
        self._cache_ttl[cache_key] = datetime.utcnow() + timedelta(minutes=15)
        
        return tours
    
    async def get_tour_by_uid(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get specific tour by UID"""
        tours = await self.get_tours()
        return next((tour for tour in tours if tour['uid'] == uid), None)
    
    async def get_destinations(self) -> List[Dict[str, Any]]:
        """Get destinations from Contentstack"""
        cache_key = "destinations_all"
        
        if self._is_cached_valid(cache_key):
            return self._cache[cache_key]
        
        # For demo, return sample destinations
        destinations = self.sample_destinations.copy()
        
        # Cache the result
        self._cache[cache_key] = destinations
        self._cache_ttl[cache_key] = datetime.utcnow() + timedelta(minutes=30)
        
        return destinations
    
    async def search_content(self, query: str) -> Dict[str, Any]:
        """Search across tours and destinations"""
        query_lower = query.lower()
        
        tours = await self.get_tours()
        destinations = await self.get_destinations()
        
        # Search tours
        matching_tours = []
        for tour in tours:
            if (query_lower in tour['title'].lower() or 
                query_lower in tour['description'].lower() or
                query_lower in tour['location'].lower() or
                any(query_lower in highlight.lower() for highlight in tour['highlights'])):
                matching_tours.append(tour)
        
        # Search destinations  
        matching_destinations = []
        for dest in destinations:
            if (query_lower in dest['title'].lower() or 
                query_lower in dest['description'].lower()):
                matching_destinations.append(dest)
        
        return {
            "tours": matching_tours,
            "destinations": matching_destinations,
            "total_results": len(matching_tours) + len(matching_destinations)
        }
    
    def _is_cached_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self._cache:
            return False
        if cache_key not in self._cache_ttl:
            return False
        return datetime.utcnow() < self._cache_ttl[cache_key]
    
    def format_tour_for_llm(self, tour: Dict[str, Any]) -> str:
        """Format tour data for LLM context"""
        return f"""
Tour: {tour['title']}
Location: {tour['location']}
Price: {tour['price']} ({tour['duration']})
Description: {tour['description']}
Highlights: {', '.join(tour['highlights'])}
Category: {tour['category']}
Rating: {tour.get('rating', 'N/A')}/5 ({tour.get('reviews_count', 0)} reviews)
"""
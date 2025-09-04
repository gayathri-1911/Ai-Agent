from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from services.contentstack import ContentstackService

router = APIRouter()

# Initialize service
contentstack_service = ContentstackService()

class ToursResponse(BaseModel):
    success: bool
    tours: List[Dict[str, Any]]
    total: int

class DestinationsResponse(BaseModel):
    success: bool
    destinations: List[Dict[str, Any]]
    total: int

class SearchResponse(BaseModel):
    success: bool
    results: Dict[str, Any]
    query: str

@router.get("/content/tours", response_model=ToursResponse)
async def get_tours(
    location: Optional[str] = Query(None, description="Filter by location"),
    category: Optional[str] = Query(None, description="Filter by category"),
    max_price: Optional[int] = Query(None, description="Maximum price filter")
):
    """Get all tours with optional filtering"""
    try:
        filters = {}
        if location:
            filters['location'] = location
        if category:
            filters['category'] = category
        if max_price:
            filters['max_price'] = max_price
            
        tours = await contentstack_service.get_tours(filters)
        
        return ToursResponse(
            success=True,
            tours=tours,
            total=len(tours)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tours: {str(e)}")

@router.get("/content/tours/{tour_uid}")
async def get_tour_by_uid(tour_uid: str):
    """Get specific tour by UID"""
    try:
        tour = await contentstack_service.get_tour_by_uid(tour_uid)
        
        if not tour:
            raise HTTPException(status_code=404, detail="Tour not found")
            
        return {
            'success': True,
            'tour': tour
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tour: {str(e)}")

@router.get("/content/destinations", response_model=DestinationsResponse)
async def get_destinations():
    """Get all destinations"""
    try:
        destinations = await contentstack_service.get_destinations()
        
        return DestinationsResponse(
            success=True,
            destinations=destinations,
            total=len(destinations)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch destinations: {str(e)}")

@router.get("/content/search", response_model=SearchResponse)
async def search_content(q: str = Query(..., description="Search query")):
    """Search across all content types"""
    try:
        results = await contentstack_service.search_content(q)
        
        return SearchResponse(
            success=True,
            results=results,
            query=q
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/content/categories")
async def get_categories():
    """Get available tour categories"""
    try:
        tours = await contentstack_service.get_tours()
        categories = list(set(tour['category'] for tour in tours))
        
        return {
            'success': True,
            'categories': sorted(categories)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

@router.get("/content/locations")
async def get_locations():
    """Get available tour locations"""
    try:
        tours = await contentstack_service.get_tours()
        locations = list(set(tour['location'] for tour in tours))
        
        return {
            'success': True,
            'locations': sorted(locations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch locations: {str(e)}")
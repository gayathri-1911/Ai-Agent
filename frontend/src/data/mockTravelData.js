// Mock data matching Contentstack format for Travel domain
export const mockTravelData = {
  tours: [
    {
      uid: "rome_city_tour",
      title: "Rome City Tour",
      description: "Explore the eternal city with our expert guides. Visit the Colosseum, Roman Forum, and Vatican City.",
      price: "$500",
      duration: "3 Days",
      location: "Rome, Italy",
      highlights: ["Colosseum", "Vatican Museums", "Trevi Fountain", "Spanish Steps"],
      category: "Cultural"
    },
    {
      uid: "venice_gondola_experience",
      title: "Venice Gondola Experience",
      description: "Romantic gondola rides through Venice's historic canals with authentic Italian serenades.",
      price: "$350",
      duration: "2 Days", 
      location: "Venice, Italy",
      highlights: ["Grand Canal", "St. Mark's Square", "Doge's Palace", "Rialto Bridge"],
      category: "Romantic"
    },
    {
      uid: "florence_art_walk",
      title: "Florence Art Walk",
      description: "Immerse yourself in Renaissance art at the Uffizi Gallery and explore Michelangelo's masterpieces.",
      price: "$420",
      duration: "2 Days",
      location: "Florence, Italy", 
      highlights: ["Uffizi Gallery", "Ponte Vecchio", "Duomo", "Michelangelo's David"],
      category: "Art & Culture"
    },
    {
      uid: "tuscany_wine_tour",
      title: "Tuscany Wine Tour",
      description: "Sample world-class wines in the rolling hills of Tuscany with visits to historic vineyards.",
      price: "$680",
      duration: "4 Days",
      location: "Tuscany, Italy",
      highlights: ["Chianti Vineyards", "Medieval Towns", "Wine Tastings", "Cooking Classes"],
      category: "Culinary"
    }
  ],
  destinations: [
    {
      uid: "italy",
      title: "Italy",
      description: "Experience the rich history, culture, and cuisine of Italy",
      popularTours: ["rome_city_tour", "venice_gondola_experience", "florence_art_walk"]
    },
    {
      uid: "france", 
      title: "France",
      description: "Discover the romance and elegance of France",
      popularTours: []
    }
  ]
};

// Mock responses for different queries
export const mockResponses = {
  "italy tours": {
    content: "Here are the amazing tours available for Italy:\n\n🏛️ **Rome City Tour** - $500 (3 Days)\nExplore the Colosseum, Vatican City, and Roman Forum\n\n🚤 **Venice Gondola Experience** - $350 (2 Days)\nRomantic canal rides and St. Mark's Square\n\n🎨 **Florence Art Walk** - $420 (2 Days)\nUffizi Gallery and Renaissance masterpieces\n\n🍷 **Tuscany Wine Tour** - $680 (4 Days)\nVineyard visits and wine tastings",
    relatedTours: ["rome_city_tour", "venice_gondola_experience", "florence_art_walk", "tuscany_wine_tour"]
  },
  "rome tour price": {
    content: "The **Rome City Tour** is priced at **$500 for 3 days**.\n\nThis includes:\n✅ Expert guided tours\n✅ Skip-the-line tickets to Colosseum & Vatican\n✅ Walking tours of historic sites\n✅ 2 nights accommodation\n\nWould you like to know more about what's included or see other Rome options?",
    relatedTours: ["rome_city_tour"]
  },
  "venice details": {
    content: "The **Venice Gondola Experience** ($350, 2 days) offers:\n\n🚤 **Day 1**: Grand Canal gondola ride with serenade\n🏛️ **Day 2**: St. Mark's Square, Doge's Palace tour\n\n**Highlights:**\n• Authentic gondola rides\n• Skip-the-line Doge's Palace access\n• Professional photography session\n• Traditional Italian dinner\n\nPerfect for couples and romantic getaways!",
    relatedTours: ["venice_gondola_experience"]
  },
  "best time visit italy": {
    content: "The **best time to visit Italy** depends on your preferences:\n\n🌸 **Spring (April-June)**: Perfect weather, fewer crowds\n☀️ **Summer (July-August)**: Peak season, hot weather\n🍂 **Fall (September-October)**: Great weather, harvest season\n❄️ **Winter (November-March)**: Fewer tourists, some attractions closed\n\n**Recommendation**: April-May or September-October for ideal conditions!",
    relatedTours: []
  }
};

export const findRelevantContent = (query) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('italy') && lowerQuery.includes('tour')) {
    return mockResponses["italy tours"];
  }
  if (lowerQuery.includes('rome') && (lowerQuery.includes('price') || lowerQuery.includes('cost'))) {
    return mockResponses["rome tour price"];
  }
  if (lowerQuery.includes('venice')) {
    return mockResponses["venice details"];
  }
  if (lowerQuery.includes('best time') || lowerQuery.includes('when to visit')) {
    return mockResponses["best time visit italy"];
  }
  
  // Default response
  return {
    content: `I'd be happy to help you with travel information! I can assist you with:\n\n🗺️ Tour recommendations for Italy\n💰 Pricing and package details\n📅 Best travel times\n🏛️ Destination highlights\n\nTry asking: "What tours are available for Italy?" or "Tell me about Rome tours"`,
    relatedTours: []
  };
};
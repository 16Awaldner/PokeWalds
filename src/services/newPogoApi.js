const NEW_POGO_API_BASE_URL = 'https://pokemon-go-api.github.io/pokemon-go-api';

// Cache for API responses with 1-hour expiration
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const fetchWithCache = async (endpoint) => {
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${endpoint}`);
    return cached.data;
  }
  
  try {
    console.log(`Fetching fresh data from ${endpoint}`);
    const response = await fetch(`${NEW_POGO_API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const newPogoApi = {
  // Get all Pokemon data
  getAllPokemon: () => fetchWithCache('/api/pokedex.json'),
  
  // Get Pokemon by ID
  getPokemonById: (id) => fetchWithCache(`/api/pokedex/id/${id}.json`),
  
  // Get Pokemon by name
  getPokemonByName: (name) => fetchWithCache(`/api/pokedex/name/${name}.json`),
  
  // Get Pokemon by generation
  getPokemonByGeneration: (generation) => fetchWithCache(`/api/pokedex/generation/${generation}.json`),
  
  // Get Pokemon by region
  getPokemonByRegion: (region) => fetchWithCache(`/api/pokedex/region/${region}.json`),
  
  // Get all Mega Pokemon
  getMegaPokemon: () => fetchWithCache('/api/pokedex/mega.json'),
  
  // Get current raid bosses
  getRaidBosses: () => fetchWithCache('/api/raidboss.json'),
  
  // Get type effectiveness data
  getTypes: () => fetchWithCache('/api/types.json'),
  
  // Get quests
  getQuests: () => fetchWithCache('/api/quests.json'),
  
  // Get API hashes for cache management
  getHashes: () => fetchWithCache('/api/hashes.json'),
  
  // Clear cache
  clearCache: () => {
    cache.clear();
    console.log('Cache cleared');
  },
  
  // Get cache info
  getCacheInfo: () => {
    const cacheInfo = {};
    for (const [key, value] of cache.entries()) {
      cacheInfo[key] = {
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
        expiresIn: CACHE_DURATION - (Date.now() - value.timestamp)
      };
    }
    return cacheInfo;
  }
}; 
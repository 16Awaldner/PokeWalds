const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

// Cache for sprite URLs
const spriteCache = new Map();

export const pokeApi = {
  // Get Pokemon sprite URL
  getPokemonSprite: async (pokemonId, isShiny = false) => {
    const cacheKey = `${pokemonId}-${isShiny ? 'shiny' : 'normal'}`;
    
    if (spriteCache.has(cacheKey)) {
      return spriteCache.get(cacheKey);
    }
    
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const spriteUrl = isShiny 
        ? data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny
        : data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
      
      spriteCache.set(cacheKey, spriteUrl);
      return spriteUrl;
    } catch (error) {
      console.error(`Error fetching sprite for Pokemon ${pokemonId}:`, error);
      return null;
    }
  },
  
  // Get Pokemon data
  getPokemonData: async (pokemonId) => {
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching Pokemon data for ${pokemonId}:`, error);
      return null;
    }
  },
  
  // Clear sprite cache
  clearSpriteCache: () => {
    spriteCache.clear();
    console.log('Sprite cache cleared');
  }
}; 
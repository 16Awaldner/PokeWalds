import { useState, useEffect } from 'react';
import { newPogoApi } from '../services/newPogoApi';
import { pokeApi } from '../services/pokeApi';
import './CPCalculator.css';

const CPCalculator = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sprite, setSprite] = useState(null);
  const [shinySprite, setShinySprite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CP calculation inputs
  const [level, setLevel] = useState(20);
  const [ivAttack, setIvAttack] = useState(15);
  const [ivDefense, setIvDefense] = useState(15);
  const [ivStamina, setIvStamina] = useState(15);
  const [showShiny, setShowShiny] = useState(false);

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        const data = await newPogoApi.getAllPokemon();
        setAllPokemon(data);
      } catch (err) {
        setError('Failed to load Pokemon data');
        console.error('Error loading Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPokemon();
  }, []);

  // Filter Pokemon for autocomplete
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allPokemon.filter(pokemon =>
        pokemon.names.English.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.dexNr.toString().includes(searchTerm)
      ).slice(0, 10);
      setFilteredPokemon(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setFilteredPokemon([]);
      setShowAutocomplete(false);
    }
  }, [searchTerm, allPokemon]);

  const selectPokemon = async (pokemon) => {
    try {
      const pokemonData = await newPogoApi.getPokemonById(pokemon.id);
      const normalSprite = await pokeApi.getPokemonSprite(pokemonData.dexNr, false);
      const shinySprite = await pokeApi.getPokemonSprite(pokemonData.dexNr, true);
      
      setSelectedPokemon(pokemonData);
      setSprite(normalSprite);
      setShinySprite(shinySprite);
      setSearchTerm(pokemonData.names.English);
      setShowAutocomplete(false);
    } catch (err) {
      console.error('Error loading Pokemon details:', err);
    }
  };

  const calculateCP = (pokemon, level, attackIV, defenseIV, staminaIV) => {
    if (!pokemon || !pokemon.stats) return 0;

    // CP Multiplier for the given level
    const cpMultipliers = {
      1: 0.094, 1.5: 0.135137432, 2: 0.16639787, 2.5: 0.192650919,
      3: 0.21573247, 3.5: 0.236572661, 4: 0.25572005, 4.5: 0.273530381,
      5: 0.29024988, 5.5: 0.306057377, 6: 0.3210876, 6.5: 0.335445036,
      7: 0.34921268, 7.5: 0.362457751, 8: 0.37523559, 8.5: 0.387592406,
      9: 0.39956728, 9.5: 0.411193551, 10: 0.42250001, 10.5: 0.432926419,
      11: 0.44310755, 11.5: 0.453059958, 12: 0.46279839, 12.5: 0.472336083,
      13: 0.48168495, 13.5: 0.4908558, 14: 0.49985844, 14.5: 0.508701765,
      15: 0.51739395, 15.5: 0.525942511, 16: 0.53435433, 16.5: 0.542635767,
      17: 0.55079269, 17.5: 0.558830576, 18: 0.56675452, 18.5: 0.574569153,
      19: 0.58227891, 19.5: 0.589887917, 20: 0.59740001, 20.5: 0.604818814,
      21: 0.61215729, 21.5: 0.619399365, 22: 0.62656713, 22.5: 0.633644533,
      23: 0.64065295, 23.5: 0.647576426, 24: 0.65442063, 24.5: 0.661219252,
      25: 0.667934, 25.5: 0.674577537, 26: 0.68116492, 26.5: 0.687680648,
      27: 0.69414365, 27.5: 0.700538673, 28: 0.70688421, 28.5: 0.713164996,
      29: 0.71939909, 29.5: 0.725571552, 30: 0.7317, 30.5: 0.734741009,
      31: 0.73776948, 31.5: 0.740785574, 32: 0.74378943, 32.5: 0.746781211,
      33: 0.74976104, 33.5: 0.752729087, 34: 0.75568551, 34.5: 0.758630378,
      35: 0.76156384, 35.5: 0.764486065, 36: 0.76739717, 36.5: 0.770297266,
      37: 0.7731865, 37.5: 0.776064962, 38: 0.77893275, 38.5: 0.781790055,
      39: 0.78463697, 39.5: 0.787473578, 40: 0.79030001, 40.5: 0.792803968,
      41: 0.79530001, 41.5: 0.797803968, 42: 0.80030001, 42.5: 0.802803968,
      43: 0.80530001, 43.5: 0.807803968, 44: 0.81030001, 44.5: 0.812803968,
      45: 0.81530001, 45.5: 0.817803968, 46: 0.82030001, 46.5: 0.822803968,
      47: 0.82530001, 47.5: 0.827803968, 48: 0.83030001, 48.5: 0.832803968,
      49: 0.83530001, 49.5: 0.837803968, 50: 0.84030001, 50.5: 0.842803968,
      51: 0.84530001, 51.5: 0.847803968, 52: 0.85030001, 52.5: 0.852803968,
      53: 0.85530001, 53.5: 0.857803968, 54: 0.86030001, 54.5: 0.862803968,
      55: 0.86530001, 55.5: 0.867803968, 56: 0.87030001, 56.5: 0.872803968,
      57: 0.87530001, 57.5: 0.877803968, 58: 0.88030001, 58.5: 0.882803968,
      59: 0.88530001, 59.5: 0.887803968, 60: 0.89030001
    };

    const cpMultiplier = cpMultipliers[level] || 0.094;
    
    // Calculate stats with IVs
    const attack = pokemon.stats.attack + attackIV;
    const defense = pokemon.stats.defense + defenseIV;
    const stamina = pokemon.stats.stamina + staminaIV;
    
    // CP Formula: CP = (Attack * Defense^0.5 * Stamina^0.5 * CP_Multiplier^2) / 10
    const cp = Math.floor((attack * Math.pow(defense, 0.5) * Math.pow(stamina, 0.5) * Math.pow(cpMultiplier, 2)) / 10);
    
    return cp;
  };

  const calculateHP = (pokemon, level, staminaIV) => {
    if (!pokemon || !pokemon.stats) return 0;

    const cpMultipliers = {
      1: 0.094, 1.5: 0.135137432, 2: 0.16639787, 2.5: 0.192650919,
      3: 0.21573247, 3.5: 0.236572661, 4: 0.25572005, 4.5: 0.273530381,
      5: 0.29024988, 5.5: 0.306057377, 6: 0.3210876, 6.5: 0.335445036,
      7: 0.34921268, 7.5: 0.362457751, 8: 0.37523559, 8.5: 0.387592406,
      9: 0.39956728, 9.5: 0.411193551, 10: 0.42250001, 10.5: 0.432926419,
      11: 0.44310755, 11.5: 0.453059958, 12: 0.46279839, 12.5: 0.472336083,
      13: 0.48168495, 13.5: 0.4908558, 14: 0.49985844, 14.5: 0.508701765,
      15: 0.51739395, 15.5: 0.525942511, 16: 0.53435433, 16.5: 0.542635767,
      17: 0.55079269, 17.5: 0.558830576, 18: 0.56675452, 18.5: 0.574569153,
      19: 0.58227891, 19.5: 0.589887917, 20: 0.59740001, 20.5: 0.604818814,
      21: 0.61215729, 21.5: 0.619399365, 22: 0.62656713, 22.5: 0.633644533,
      23: 0.64065295, 23.5: 0.647576426, 24: 0.65442063, 24.5: 0.661219252,
      25: 0.667934, 25.5: 0.674577537, 26: 0.68116492, 26.5: 0.687680648,
      27: 0.69414365, 27.5: 0.700538673, 28: 0.70688421, 28.5: 0.713164996,
      29: 0.71939909, 29.5: 0.725571552, 30: 0.7317, 30.5: 0.734741009,
      31: 0.73776948, 31.5: 0.740785574, 32: 0.74378943, 32.5: 0.746781211,
      33: 0.74976104, 33.5: 0.752729087, 34: 0.75568551, 34.5: 0.758630378,
      35: 0.76156384, 35.5: 0.764486065, 36: 0.76739717, 36.5: 0.770297266,
      37: 0.7731865, 37.5: 0.776064962, 38: 0.77893275, 38.5: 0.781790055,
      39: 0.78463697, 39.5: 0.787473578, 40: 0.79030001, 40.5: 0.792803968,
      41: 0.79530001, 41.5: 0.797803968, 42: 0.80030001, 42.5: 0.802803968,
      43: 0.80530001, 43.5: 0.807803968, 44: 0.81030001, 44.5: 0.812803968,
      45: 0.81530001, 45.5: 0.817803968, 46: 0.82030001, 46.5: 0.822803968,
      47: 0.82530001, 47.5: 0.827803968, 48: 0.83030001, 48.5: 0.832803968,
      49: 0.83530001, 49.5: 0.837803968, 50: 0.84030001, 50.5: 0.842803968,
      51: 0.84530001, 51.5: 0.847803968, 52: 0.85030001, 52.5: 0.852803968,
      53: 0.85530001, 53.5: 0.857803968, 54: 0.86030001, 54.5: 0.862803968,
      55: 0.86530001, 55.5: 0.867803968, 56: 0.87030001, 56.5: 0.872803968,
      57: 0.87530001, 57.5: 0.877803968, 58: 0.88030001, 58.5: 0.882803968,
      59: 0.88530001, 59.5: 0.887803968, 60: 0.89030001
    };

    const cpMultiplier = cpMultipliers[level] || 0.094;
    const stamina = pokemon.stats.stamina + staminaIV;
    
    // HP Formula: HP = Stamina * CP_Multiplier
    const hp = Math.floor(stamina * cpMultiplier);
    
    return hp;
  };

  const getPokemonTypes = (pokemon) => {
    if (!pokemon || !pokemon.types) return [];
    return pokemon.types.map(type => type.names.English);
  };

  const currentCP = selectedPokemon ? calculateCP(selectedPokemon, level, ivAttack, ivDefense, ivStamina) : 0;
  const currentHP = selectedPokemon ? calculateHP(selectedPokemon, level, ivStamina) : 0;
  const totalIV = ivAttack + ivDefense + ivStamina;
  const ivPercentage = Math.round((totalIV / 45) * 100);

  if (loading) {
    return <div className="cp-calculator-loading">Loading Pokemon data...</div>;
  }

  return (
    <div className="cp-calculator">
      <div className="calculator-header">
        <h2>🧮 CP Calculator</h2>
        <p>Calculate CP and HP for any Pokemon at different levels and IVs</p>
      </div>

      <div className="calculator-content">
        <div className="pokemon-selection">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a Pokemon..."
              className="calculator-search"
            />
            {showAutocomplete && (
              <div className="calculator-autocomplete">
                {filteredPokemon.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => selectPokemon(pokemon)}
                  >
                    <span className="pokemon-number">#{pokemon.dexNr}</span>
                    <span className="pokemon-name">{pokemon.names.English}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        {selectedPokemon && (
          <div className="calculator-results">
            <div className="pokemon-info">
              <div className="pokemon-display">
                <div className="sprite-section">
                  <img 
                    src={showShiny ? shinySprite : sprite} 
                    alt={`${selectedPokemon.names.English} (${showShiny ? 'Shiny' : 'Normal'})`}
                    className="pokemon-sprite"
                  />
                  <button 
                    onClick={() => setShowShiny(!showShiny)}
                    className="shiny-toggle"
                  >
                    {showShiny ? '🌟 Shiny' : '⭐ Normal'}
                  </button>
                </div>
                <div className="pokemon-details">
                  <h3>#{selectedPokemon.dexNr} - {selectedPokemon.names.English}</h3>
                  <div className="types-container">
                    {getPokemonTypes(selectedPokemon).map(type => (
                      <span key={type} className="type-badge">{type}</span>
                    ))}
                  </div>
                  <div className="base-stats">
                    <div className="stat-item">
                      <span className="stat-label">Base Attack:</span>
                      <span className="stat-value">{selectedPokemon.stats?.attack || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Base Defense:</span>
                      <span className="stat-value">{selectedPokemon.stats?.defense || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Base Stamina:</span>
                      <span className="stat-value">{selectedPokemon.stats?.stamina || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="calculator-inputs">
              <div className="input-section">
                <h4>⚡ Level & IVs</h4>
                <div className="input-grid">
                  <div className="input-group">
                    <label>Level:</label>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      step="0.5"
                      value={level}
                      onChange={(e) => setLevel(parseFloat(e.target.value))}
                      className="range-input"
                    />
                    <span className="range-value">{level}</span>
                  </div>
                  
                  <div className="input-group">
                    <label>Attack IV:</label>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={ivAttack}
                      onChange={(e) => setIvAttack(parseInt(e.target.value))}
                      className="range-input"
                    />
                    <span className="range-value">{ivAttack}</span>
                  </div>
                  
                  <div className="input-group">
                    <label>Defense IV:</label>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={ivDefense}
                      onChange={(e) => setIvDefense(parseInt(e.target.value))}
                      className="range-input"
                    />
                    <span className="range-value">{ivDefense}</span>
                  </div>
                  
                  <div className="input-group">
                    <label>Stamina IV:</label>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={ivStamina}
                      onChange={(e) => setIvStamina(parseInt(e.target.value))}
                      className="range-input"
                    />
                    <span className="range-value">{ivStamina}</span>
                  </div>
                </div>
              </div>

              <div className="results-section">
                <h4>📊 Results</h4>
                <div className="results-grid">
                  <div className="result-card cp">
                    <div className="result-label">CP</div>
                    <div className="result-value">{currentCP.toLocaleString()}</div>
                  </div>
                  <div className="result-card hp">
                    <div className="result-label">HP</div>
                    <div className="result-value">{currentHP}</div>
                  </div>
                  <div className="result-card iv">
                    <div className="result-label">Total IV</div>
                    <div className="result-value">{totalIV}/45 ({ivPercentage}%)</div>
                  </div>
                </div>
                
                <div className="iv-breakdown">
                  <h5>IV Breakdown:</h5>
                  <div className="iv-stats">
                    <div className="iv-stat">
                      <span>Attack:</span>
                      <span className={`iv-value ${ivAttack === 15 ? 'perfect' : ivAttack >= 13 ? 'good' : 'poor'}`}>
                        {ivAttack}/15
                      </span>
                    </div>
                    <div className="iv-stat">
                      <span>Defense:</span>
                      <span className={`iv-value ${ivDefense === 15 ? 'perfect' : ivDefense >= 13 ? 'good' : 'poor'}`}>
                        {ivDefense}/15
                      </span>
                    </div>
                    <div className="iv-stat">
                      <span>Stamina:</span>
                      <span className={`iv-value ${ivStamina === 15 ? 'perfect' : ivStamina >= 13 ? 'good' : 'poor'}`}>
                        {ivStamina}/15
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedPokemon && (
          <div className="calculator-placeholder">
            <p>Select a Pokemon to calculate its CP and HP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPCalculator; 
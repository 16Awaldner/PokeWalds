import { useState, useEffect } from 'react';
import { newPogoApi } from '../services/newPogoApi';
import { pokeApi } from '../services/pokeApi';
import './PokemonComparison.css';

const PokemonComparison = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [showAutocomplete1, setShowAutocomplete1] = useState(false);
  const [showAutocomplete2, setShowAutocomplete2] = useState(false);
  const [filteredPokemon1, setFilteredPokemon1] = useState([]);
  const [filteredPokemon2, setFilteredPokemon2] = useState([]);
  const [selectedIndex1, setSelectedIndex1] = useState(-1);
  const [selectedIndex2, setSelectedIndex2] = useState(-1);
  const [sprite1, setSprite1] = useState(null);
  const [sprite2, setSprite2] = useState(null);
  const [shinySprite1, setShinySprite1] = useState(null);
  const [shinySprite2, setShinySprite2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (searchTerm1.trim()) {
      const filtered = allPokemon.filter(pokemon =>
        pokemon.names.English.toLowerCase().includes(searchTerm1.toLowerCase()) ||
        pokemon.dexNr.toString().includes(searchTerm1)
      ).slice(0, 10);
      setFilteredPokemon1(filtered);
      setShowAutocomplete1(filtered.length > 0);
    } else {
      setFilteredPokemon1([]);
      setShowAutocomplete1(false);
    }
  }, [searchTerm1, allPokemon]);

  useEffect(() => {
    if (searchTerm2.trim()) {
      const filtered = allPokemon.filter(pokemon =>
        pokemon.names.English.toLowerCase().includes(searchTerm2.toLowerCase()) ||
        pokemon.dexNr.toString().includes(searchTerm2)
      ).slice(0, 10);
      setFilteredPokemon2(filtered);
      setShowAutocomplete2(filtered.length > 0);
    } else {
      setFilteredPokemon2([]);
      setShowAutocomplete2(false);
    }
  }, [searchTerm2, allPokemon]);

  const selectPokemon = async (pokemon, side) => {
    try {
      const pokemonData = await newPogoApi.getPokemonById(pokemon.id);
      const normalSprite = await pokeApi.getPokemonSprite(pokemonData.dexNr, false);
      const shinySprite = await pokeApi.getPokemonSprite(pokemonData.dexNr, true);
      
      if (side === 1) {
        setPokemon1(pokemonData);
        setSprite1(normalSprite);
        setShinySprite1(shinySprite);
        setSearchTerm1(pokemonData.names.English);
        setShowAutocomplete1(false);
      } else {
        setPokemon2(pokemonData);
        setSprite2(normalSprite);
        setShinySprite2(shinySprite);
        setSearchTerm2(pokemonData.names.English);
        setShowAutocomplete2(false);
      }
    } catch (err) {
      console.error('Error loading Pokemon details:', err);
    }
  };

  const getPokemonTypes = (pokemon) => {
    if (!pokemon || !pokemon.types) return [];
    return pokemon.types.map(type => type.names.English);
  };

  const getQuickMoves = (pokemon) => {
    if (!pokemon || !pokemon.quickMoves) return [];
    return pokemon.quickMoves.map(move => ({
      id: move.id,
      name: move.names.English,
      power: move.power,
      energy: move.energy
    }));
  };

  const getChargedMoves = (pokemon) => {
    if (!pokemon || !pokemon.chargedMoves) return [];
    return pokemon.chargedMoves.map(move => ({
      id: move.id,
      name: move.names.English,
      power: move.power,
      energy: move.energy
    }));
  };

  const compareStats = (stat1, stat2) => {
    if (!stat1 || !stat2) return 'neutral';
    if (stat1 > stat2) return 'better';
    if (stat1 < stat2) return 'worse';
    return 'equal';
  };

  const swapPokemon = () => {
    const tempPokemon = pokemon1;
    const tempSprite = sprite1;
    const tempShinySprite = shinySprite1;
    const tempSearchTerm = searchTerm1;

    setPokemon1(pokemon2);
    setSprite1(sprite2);
    setShinySprite1(shinySprite2);
    setSearchTerm1(searchTerm2);

    setPokemon2(tempPokemon);
    setSprite2(tempSprite);
    setShinySprite2(tempShinySprite);
    setSearchTerm2(tempSearchTerm);
  };

  if (loading) {
    return <div className="comparison-loading">Loading Pokemon data...</div>;
  }

  return (
    <div className="pokemon-comparison">
      <div className="comparison-header">
        <h2>⚖️ Pokemon Comparison Tool</h2>
        <p>Compare any two Pokemon side-by-side to see their differences</p>
      </div>

      <div className="comparison-controls">
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm1}
              onChange={(e) => setSearchTerm1(e.target.value)}
              placeholder="Search Pokemon 1..."
              className="comparison-search"
            />
            {showAutocomplete1 && (
              <div className="comparison-autocomplete">
                {filteredPokemon1.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    className={`autocomplete-item ${index === selectedIndex1 ? 'selected' : ''}`}
                    onClick={() => selectPokemon(pokemon, 1)}
                  >
                    <span className="pokemon-number">#{pokemon.dexNr}</span>
                    <span className="pokemon-name">{pokemon.names.English}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={swapPokemon} className="swap-button" disabled={!pokemon1 || !pokemon2}>
          🔄 Swap
        </button>

        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm2}
              onChange={(e) => setSearchTerm2(e.target.value)}
              placeholder="Search Pokemon 2..."
              className="comparison-search"
            />
            {showAutocomplete2 && (
              <div className="comparison-autocomplete">
                {filteredPokemon2.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    className={`autocomplete-item ${index === selectedIndex2 ? 'selected' : ''}`}
                    onClick={() => selectPokemon(pokemon, 2)}
                  >
                    <span className="pokemon-number">#{pokemon.dexNr}</span>
                    <span className="pokemon-name">{pokemon.names.English}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {pokemon1 && pokemon2 && (
        <div className="comparison-grid">
          {/* Pokemon 1 */}
          <div className="pokemon-card">
            <div className="pokemon-header">
              <h3>#{pokemon1.dexNr} - {pokemon1.names.English}</h3>
              <div className="pokemon-sprites">
                {sprite1 && (
                  <div className="sprite-container">
                    <img src={sprite1} alt={`${pokemon1.names.English} (Normal)`} className="pokemon-sprite" />
                    <span>Normal</span>
                  </div>
                )}
                {shinySprite1 && (
                  <div className="sprite-container">
                    <img src={shinySprite1} alt={`${pokemon1.names.English} (Shiny)`} className="pokemon-sprite shiny" />
                    <span>Shiny</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pokemon-details">
              <div className="detail-section">
                <h4>Types</h4>
                <div className="types-container">
                  {getPokemonTypes(pokemon1).map(type => (
                    <span key={type} className="type-badge">{type}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Base Stats</h4>
                <div className="stats-comparison">
                  <div className={`stat-row ${compareStats(pokemon1.stats?.attack, pokemon2.stats?.attack)}`}>
                    <span>Attack:</span>
                    <span>{pokemon1.stats?.attack || 'N/A'}</span>
                  </div>
                  <div className={`stat-row ${compareStats(pokemon1.stats?.defense, pokemon2.stats?.defense)}`}>
                    <span>Defense:</span>
                    <span>{pokemon1.stats?.defense || 'N/A'}</span>
                  </div>
                  <div className={`stat-row ${compareStats(pokemon1.stats?.stamina, pokemon2.stats?.stamina)}`}>
                    <span>Stamina:</span>
                    <span>{pokemon1.stats?.stamina || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Fast Moves</h4>
                <div className="moves-list">
                  {getQuickMoves(pokemon1).map(move => (
                    <div key={move.id} className="move-badge fast">
                      <span className="move-name">{move.name}</span>
                      <div className="move-stats">
                        <span>⚔️ {move.power}</span>
                        <span>⚡ {move.energy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Charged Moves</h4>
                <div className="moves-list">
                  {getChargedMoves(pokemon1).map(move => (
                    <div key={move.id} className="move-badge charged">
                      <span className="move-name">{move.name}</span>
                      <div className="move-stats">
                        <span>⚔️ {move.power}</span>
                        <span>⚡ {move.energy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Center */}
          <div className="comparison-center">
            <div className="vs-badge">VS</div>
            <div className="comparison-summary">
              <h4>Quick Comparison</h4>
              <div className="summary-item">
                <span>Total Stats:</span>
                <span className={compareStats(
                  (pokemon1.stats?.attack || 0) + (pokemon1.stats?.defense || 0) + (pokemon1.stats?.stamina || 0),
                  (pokemon2.stats?.attack || 0) + (pokemon2.stats?.defense || 0) + (pokemon2.stats?.stamina || 0)
                )}>
                  {((pokemon1.stats?.attack || 0) + (pokemon1.stats?.defense || 0) + (pokemon1.stats?.stamina || 0))} vs {((pokemon2.stats?.attack || 0) + (pokemon2.stats?.defense || 0) + (pokemon2.stats?.stamina || 0))}
                </span>
              </div>
              <div className="summary-item">
                <span>Move Count:</span>
                <span className={compareStats(
                  getQuickMoves(pokemon1).length + getChargedMoves(pokemon1).length,
                  getQuickMoves(pokemon2).length + getChargedMoves(pokemon2).length
                )}>
                  {getQuickMoves(pokemon1).length + getChargedMoves(pokemon1).length} vs {getQuickMoves(pokemon2).length + getChargedMoves(pokemon2).length}
                </span>
              </div>
            </div>
          </div>

          {/* Pokemon 2 */}
          <div className="pokemon-card">
            <div className="pokemon-header">
              <h3>#{pokemon2.dexNr} - {pokemon2.names.English}</h3>
              <div className="pokemon-sprites">
                {sprite2 && (
                  <div className="sprite-container">
                    <img src={sprite2} alt={`${pokemon2.names.English} (Normal)`} className="pokemon-sprite" />
                    <span>Normal</span>
                  </div>
                )}
                {shinySprite2 && (
                  <div className="sprite-container">
                    <img src={shinySprite2} alt={`${pokemon2.names.English} (Shiny)`} className="pokemon-sprite shiny" />
                    <span>Shiny</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pokemon-details">
              <div className="detail-section">
                <h4>Types</h4>
                <div className="types-container">
                  {getPokemonTypes(pokemon2).map(type => (
                    <span key={type} className="type-badge">{type}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Base Stats</h4>
                <div className="stats-comparison">
                  <div className={`stat-row ${compareStats(pokemon2.stats?.attack, pokemon1.stats?.attack)}`}>
                    <span>Attack:</span>
                    <span>{pokemon2.stats?.attack || 'N/A'}</span>
                  </div>
                  <div className={`stat-row ${compareStats(pokemon2.stats?.defense, pokemon1.stats?.defense)}`}>
                    <span>Defense:</span>
                    <span>{pokemon2.stats?.defense || 'N/A'}</span>
                  </div>
                  <div className={`stat-row ${compareStats(pokemon2.stats?.stamina, pokemon1.stats?.stamina)}`}>
                    <span>Stamina:</span>
                    <span>{pokemon2.stats?.stamina || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Fast Moves</h4>
                <div className="moves-list">
                  {getQuickMoves(pokemon2).map(move => (
                    <div key={move.id} className="move-badge fast">
                      <span className="move-name">{move.name}</span>
                      <div className="move-stats">
                        <span>⚔️ {move.power}</span>
                        <span>⚡ {move.energy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Charged Moves</h4>
                <div className="moves-list">
                  {getChargedMoves(pokemon2).map(move => (
                    <div key={move.id} className="move-badge charged">
                      <span className="move-name">{move.name}</span>
                      <div className="move-stats">
                        <span>⚔️ {move.power}</span>
                        <span>⚡ {move.energy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!pokemon1 || !pokemon2) && (
        <div className="comparison-placeholder">
          <p>Select two Pokemon to compare them side-by-side</p>
        </div>
      )}
    </div>
  );
};

export default PokemonComparison; 
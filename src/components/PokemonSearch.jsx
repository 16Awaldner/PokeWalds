import { useState, useEffect, useRef } from 'react';
import { newPogoApi } from '../services/newPogoApi';
import { pokeApi } from '../services/pokeApi';
import './PokemonSearch.css';

const PokemonSearch = ({ initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // SPRITE STATES
  const [normalSprite, setNormalSprite] = useState(null);
  const [shinySprite, setShinySprite] = useState(null);
  const [spriteLoading, setSpriteLoading] = useState(false);

  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Load all Pokemon data on component mount
  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [pokemon, types] = await Promise.all([
          newPogoApi.getAllPokemon(),
          newPogoApi.getTypes()
        ]);

        setAllPokemon(pokemon);
        setTypesData(types);
        
      } catch (err) {
        setError('Failed to load Pokemon data');
        console.error('Error loading Pokemon data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPokemonData();
  }, []);

  // Filter Pokemon for autocomplete
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPokemon([]);
      setShowAutocomplete(false);
      setSelectedIndex(-1);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allPokemon
      .filter(pokemon => 
        pokemon.names.English.toLowerCase().includes(searchLower) ||
        pokemon.id.toLowerCase().includes(searchLower) ||
        pokemon.dexNr.toString().includes(searchLower)
      )
      .slice(0, 10); // Limit to 10 results

    setFilteredPokemon(filtered);
    setShowAutocomplete(filtered.length > 0);
    setSelectedIndex(-1);
  }, [searchTerm, allPokemon]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showAutocomplete) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredPokemon.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredPokemon[selectedIndex]) {
            selectPokemon(filteredPokemon[selectedIndex]);
          } else {
            searchPokemon();
          }
          break;
        case 'Escape':
          setShowAutocomplete(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAutocomplete, filteredPokemon, selectedIndex]);

  // Handle clicks outside autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load sprites when pokemonData changes
  useEffect(() => {
    const loadSprites = async () => {
      if (!pokemonData) {
        setNormalSprite(null);
        setShinySprite(null);
        return;
      }

      setSpriteLoading(true);
      try {
        const [normal, shiny] = await Promise.all([
          pokeApi.getPokemonSprite(pokemonData.dexNr, false),
          pokeApi.getPokemonSprite(pokemonData.dexNr, true)
        ]);
        
        setNormalSprite(normal);
        setShinySprite(shiny);
      } catch (err) {
        console.error('Error loading sprites:', err);
      } finally {
        setSpriteLoading(false);
      }
    };

    loadSprites();
  }, [pokemonData]);

  const selectPokemon = (pokemon) => {
    setPokemonData(pokemon);
    setSearchTerm(pokemon.names.English);
    setShowAutocomplete(false);
    setSelectedIndex(-1);
    setError(null);
  };

  const searchPokemon = () => {
    if (!searchTerm.trim()) return;

    const searchLower = searchTerm.toLowerCase();
    let foundPokemon = null;

    // Search by name
    foundPokemon = allPokemon.find(pokemon => 
      pokemon.names.English.toLowerCase().includes(searchLower) ||
      pokemon.id.toLowerCase().includes(searchLower)
    );

    // Search by ID
    if (!foundPokemon && !isNaN(searchTerm)) {
      foundPokemon = allPokemon.find(pokemon => pokemon.dexNr === parseInt(searchTerm));
    }

    setPokemonData(foundPokemon);
    setError(foundPokemon ? null : 'Pokemon not found');
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (filteredPokemon.length > 0) {
      setShowAutocomplete(true);
    }
  };

  const getTypeEffectivenessInfo = (pokemonTypes) => {
    if (!pokemonTypes || !typesData.length) return null;
    
    const effectiveness = {};
    const multipliers = {};
    
    pokemonTypes.forEach(type => {
      const typeData = typesData.find(t => t.type === type);
      if (typeData) {
        effectiveness[type] = {
          super_effective: typeData.doubleDamageFrom,
          not_very_effective: typeData.halfDamageFrom,
          no_effect: typeData.noDamageFrom
        };
      }
    });
    
    // Calculate combined multipliers for dual-type Pokemon
    if (pokemonTypes.length === 2) {
      const type1 = effectiveness[pokemonTypes[0]];
      const type2 = effectiveness[pokemonTypes[1]];
      
      // Get all unique types
      const allTypes = [...new Set([
        ...type1.super_effective,
        ...type1.not_very_effective,
        ...type1.no_effect,
        ...type2.super_effective,
        ...type2.not_very_effective,
        ...type2.no_effect
      ])];
      
      allTypes.forEach(attackingType => {
        let multiplier = 1;
        
        // Check type 1
        if (type1.super_effective.includes(attackingType)) multiplier *= 2;
        if (type1.not_very_effective.includes(attackingType)) multiplier *= 0.5;
        if (type1.no_effect.includes(attackingType)) multiplier *= 0;
        
        // Check type 2
        if (type2.super_effective.includes(attackingType)) multiplier *= 2;
        if (type2.not_very_effective.includes(attackingType)) multiplier *= 0.5;
        if (type2.no_effect.includes(attackingType)) multiplier *= 0;
        
        multipliers[attackingType] = multiplier;
      });
    } else {
      // Single type Pokemon
      const typeData = effectiveness[pokemonTypes[0]];
      typeData.super_effective.forEach(type => multipliers[type] = 2);
      typeData.not_very_effective.forEach(type => multipliers[type] = 0.5);
      typeData.no_effect.forEach(type => multipliers[type] = 0);
    }
    
    return { effectiveness, multipliers };
  };

  const getEffectivenessColor = (multiplier) => {
    if (multiplier >= 2) return '#ef4444'; // Red for super effective
    if (multiplier === 1) return '#6b7280'; // Gray for normal
    if (multiplier === 0.5) return '#10b981'; // Green for resistant
    if (multiplier === 0.25) return '#059669'; // Dark green for very resistant
    if (multiplier === 0) return '#1f2937'; // Dark gray for immune
    return '#6b7280';
  };

  const getEffectivenessText = (multiplier) => {
    if (multiplier >= 2) return `${multiplier}x Weakness`;
    if (multiplier === 1) return 'Normal';
    if (multiplier === 0.5) return 'Resistant';
    if (multiplier === 0.25) return 'Very Resistant';
    if (multiplier === 0) return 'Immune';
    return 'Normal';
  };

  const formatMultiplier = (multiplier) => {
    if (multiplier === 0) return '0×';
    if (multiplier === 0.25) return '¼×';
    if (multiplier === 0.5) return '½×';
    if (multiplier === 1) return '1×';
    if (multiplier === 2) return '2×';
    if (multiplier === 4) return '4×';
    return `${multiplier}×`;
  };

  const getMultiplierClass = (multiplier) => {
    if (multiplier === 0) return 'no-effect';
    if (multiplier < 1) return 'resistant';
    if (multiplier === 1) return 'normal';
    if (multiplier === 2) return 'weak';
    if (multiplier === 4) return 'very-weak';
    return 'weak';
  };

  const formatMoveName = (moveId) => {
    return moveId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPokemonTypes = (pokemon) => {
    const types = [];
    if (pokemon.primaryType) {
      types.push(pokemon.primaryType.names.English);
    }
    if (pokemon.secondaryType) {
      types.push(pokemon.secondaryType.names.English);
    }
    return types;
  };

  const getQuickMoves = (pokemon) => {
    if (!pokemon.quickMoves) return [];
    return Object.keys(pokemon.quickMoves).map(moveId => ({
      id: moveId,
      name: formatMoveName(moveId),
      power: pokemon.quickMoves[moveId].power,
      energy: pokemon.quickMoves[moveId].energy
    }));
  };

  const getChargedMoves = (pokemon) => {
    if (!pokemon.chargedMoves) return [];
    return Object.keys(pokemon.chargedMoves).map(moveId => ({
      id: moveId,
      name: formatMoveName(moveId),
      power: pokemon.chargedMoves[moveId].power,
      energy: pokemon.chargedMoves[moveId].energy
    }));
  };

  const pokemonTypes = pokemonData ? getPokemonTypes(pokemonData) : [];
  const typeEffectivenessInfo = pokemonTypes.length > 0 ? getTypeEffectivenessInfo(pokemonTypes) : null;

  if (loading) {
    return (
      <div className="pokemon-search">
        <div className="loading">Loading Pokemon data...</div>
      </div>
    );
  }

  return (
    <div className="pokemon-search">
      <div className="search-container">
        <h2>Pokemon Go Hub</h2>
        <p>Search for any Pokemon to get comprehensive information</p>
        
        <div className="search-box">
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Enter Pokemon name or ID (e.g., 'Bulbasaur' or '1')"
              className="search-input"
            />
            {showAutocomplete && (
              <div ref={autocompleteRef} className="autocomplete-dropdown">
                {filteredPokemon.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => selectPokemon(pokemon)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="pokemon-number">#{pokemon.dexNr}</span>
                    <span className="pokemon-name">{pokemon.names.English}</span>
                    {pokemon.primaryType && (
                      <span className="pokemon-type">{pokemon.primaryType.names.English}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={searchPokemon} className="search-button">
            Search
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      {pokemonData && (
        <div className="pokemon-details">
          <div className="pokemon-header">
            <div className="pokemon-title">
              <div className="pokemon-name-section">
                <h3>#{pokemonData.dexNr} - {pokemonData.names.English}</h3>
                <div className="pokemon-subtitle">
                  <span className="generation-badge">Gen {pokemonData.generation}</span>
                  {pokemonData.pokemonClass && <span className="class-badge">{pokemonData.pokemonClass}</span>}
                </div>
              </div>
              <div className="pokemon-badges">
                {pokemonData.formId !== pokemonData.id && <span className="badge form">{pokemonData.formId}</span>}
              </div>
            </div>
            
            {/* Pokemon Sprites */}
            <div className="pokemon-sprites">
              {spriteLoading ? (
                <div className="sprite-loading">Loading sprites...</div>
              ) : (
                <>
                  {normalSprite && (
                    <div className="sprite-container">
                      <img 
                        src={normalSprite} 
                        alt={`${pokemonData.names.English} (Normal)`}
                        className="pokemon-sprite normal"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="sprite-label">Normal</span>
                    </div>
                  )}
                  {shinySprite && (
                    <div className="sprite-container">
                      <img 
                        src={shinySprite} 
                        alt={`${pokemonData.names.English} (Shiny)`}
                        className="pokemon-sprite shiny"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="sprite-label">Shiny</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="pokemon-grid">
            {/* Types Section */}
            {pokemonTypes.length > 0 && (
              <div className="info-section types-section">
                <div className="section-header">
                  <h4>⚔️ Types</h4>
                  <div className="types-container">
                    {pokemonTypes.map(type => (
                      <span key={type} className="type-badge">{type}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Section */}
            {pokemonData.stats && (
              <div className="info-section stats-section">
                <div className="section-header">
                  <h4>📊 Base Stats</h4>
                  <div className="stats-grid">
                    <div className="stat">
                      <span className="stat-label">Attack</span>
                      <span className="stat-value">{pokemonData.stats.attack}</span>
                      <div className="stat-bar">
                        <div className="stat-fill attack" style={{width: `${(pokemonData.stats.attack / 255) * 100}%`}}></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Defense</span>
                      <span className="stat-value">{pokemonData.stats.defense}</span>
                      <div className="stat-bar">
                        <div className="stat-fill defense" style={{width: `${(pokemonData.stats.defense / 255) * 100}%`}}></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Stamina</span>
                      <span className="stat-value">{pokemonData.stats.stamina}</span>
                      <div className="stat-bar">
                        <div className="stat-fill stamina" style={{width: `${(pokemonData.stats.stamina / 255) * 100}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Type Effectiveness */}
            {typeEffectivenessInfo && (
              <div className="info-section effectiveness-section">
                <div className="section-header">
                  <h4>🛡️ Type Effectiveness</h4>
                  <div className="effectiveness-grid">
                    {Object.entries(typeEffectivenessInfo.effectiveness).map(([type, effectiveness]) => (
                      <div key={type} className="effectiveness-section">
                        <h5>{type} Type</h5>
                        <div className="effectiveness-details">
                          {effectiveness.super_effective && effectiveness.super_effective.length > 0 && (
                            <div className="effectiveness-row">
                              <span className="effectiveness-label">Super Effective:</span>
                              <div className="effectiveness-types">
                                {effectiveness.super_effective.map(t => (
                                  <span key={t} className="effectiveness-type super">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {effectiveness.not_very_effective && effectiveness.not_very_effective.length > 0 && (
                            <div className="effectiveness-row">
                              <span className="effectiveness-label">Not Very Effective:</span>
                              <div className="effectiveness-types">
                                {effectiveness.not_very_effective.map(t => (
                                  <span key={t} className="effectiveness-type not-very">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {effectiveness.no_effect && effectiveness.no_effect.length > 0 && (
                            <div className="effectiveness-row">
                              <span className="effectiveness-label">No Effect:</span>
                              <div className="effectiveness-types">
                                {effectiveness.no_effect.map(t => (
                                  <span key={t} className="effectiveness-type no-effect">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {typeEffectivenessInfo.multipliers && Object.entries(typeEffectivenessInfo.multipliers).length > 0 && (
                      <div className="effectiveness-section combined-section">
                        <h5>🎯 Combined Effectiveness</h5>
                        <div className="effectiveness-details">
                          <div className="multipliers-grid">
                            {Object.entries(typeEffectivenessInfo.multipliers)
                              .sort(([,a], [,b]) => b - a) // Sort by multiplier (highest first)
                              .map(([attackingType, multiplier]) => (
                                <div key={attackingType} className={`multiplier-item ${getMultiplierClass(multiplier)}`}>
                                  <span className="attacking-type">{attackingType}</span>
                                  <span className="multiplier-value">{formatMultiplier(multiplier)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Moves Section */}
            {(getQuickMoves(pokemonData).length > 0 || getChargedMoves(pokemonData).length > 0) && (
              <div className="info-section moves-section">
                <div className="section-header">
                  <h4>⚡ Available Moves</h4>
                  <div className="moves-container">
                    {getQuickMoves(pokemonData).length > 0 && (
                      <div className="moves-section">
                        <h5>Fast Moves</h5>
                        <div className="moves-list">
                          {getQuickMoves(pokemonData).map(move => (
                            <div key={move.id} className="move-badge fast" title={`Power: ${move.power}, Energy: ${move.energy}`}>
                              <span className="move-name">{move.name}</span>
                              <div className="move-stats">
                                <span className="move-power">⚔️ {move.power}</span>
                                <span className="move-energy">⚡ {move.energy}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {getChargedMoves(pokemonData).length > 0 && (
                      <div className="moves-section">
                        <h5>Charged Moves</h5>
                        <div className="moves-list">
                          {getChargedMoves(pokemonData).map(move => (
                            <div key={move.id} className="move-badge charged" title={`Power: ${move.power}, Energy: ${move.energy}`}>
                              <span className="move-name">{move.name}</span>
                              <div className="move-stats">
                                <span className="move-power">⚔️ {move.power}</span>
                                <span className="move-energy">⚡ {move.energy}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="info-section info-section">
              <div className="section-header">
                <h4>ℹ️ Additional Information</h4>
                <div className="additional-info">
                  <div className="info-row">
                    <span className="info-label">Generation:</span>
                    <span className="info-value">{pokemonData.generation}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Pokemon ID:</span>
                    <span className="info-value">{pokemonData.id}</span>
                  </div>
                  {pokemonData.formId !== pokemonData.id && (
                    <div className="info-row">
                      <span className="info-label">Form:</span>
                      <span className="info-value">{pokemonData.formId}</span>
                    </div>
                  )}
                  {pokemonData.pokemonClass && (
                    <div className="info-row">
                      <span className="info-label">Class:</span>
                      <span className="info-value">{pokemonData.pokemonClass}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonSearch; 
import { useState, useEffect } from 'react';
import { newPogoApi } from '../services/newPogoApi';
import { pokeApi } from '../services/pokeApi';
import './TeamBuilder.css';

const TeamBuilder = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sprite, setSprite] = useState(null);
  const [shinySprite, setShinySprite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Team state
  const [team, setTeam] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [savedTeams, setSavedTeams] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pokemonData, typesData] = await Promise.all([
          newPogoApi.getAllPokemon(),
          newPogoApi.getTypes()
        ]);
        setAllPokemon(pokemonData);
        setTypesData(typesData);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

  const addToTeam = () => {
    if (!selectedPokemon || team.length >= 6) return;
    
    const isAlreadyInTeam = team.some(p => p.id === selectedPokemon.id);
    if (isAlreadyInTeam) {
      alert('This Pokemon is already in your team!');
      return;
    }

    const teamMember = {
      ...selectedPokemon,
      sprite: sprite,
      shinySprite: shinySprite
    };

    setTeam([...team, teamMember]);
    setSelectedPokemon(null);
    setSprite(null);
    setShinySprite(null);
    setSearchTerm('');
  };

  const removeFromTeam = (index) => {
    const newTeam = team.filter((_, i) => i !== index);
    setTeam(newTeam);
  };

  const clearTeam = () => {
    setTeam([]);
    setTeamName('');
  };

  const saveTeam = () => {
    if (team.length === 0) {
      alert('Please add Pokemon to your team before saving!');
      return;
    }
    if (!teamName.trim()) {
      alert('Please enter a team name!');
      return;
    }

    const newTeam = {
      id: Date.now(),
      name: teamName,
      pokemon: team,
      createdAt: new Date().toISOString()
    };

    const updatedTeams = [...savedTeams, newTeam];
    setSavedTeams(updatedTeams);
    localStorage.setItem('savedTeams', JSON.stringify(updatedTeams));
    
    alert('Team saved successfully!');
    clearTeam();
  };

  const loadTeam = (savedTeam) => {
    setTeam(savedTeam.pokemon);
    setTeamName(savedTeam.name);
  };

  const deleteTeam = (teamId) => {
    const updatedTeams = savedTeams.filter(t => t.id !== teamId);
    setSavedTeams(updatedTeams);
    localStorage.setItem('savedTeams', JSON.stringify(updatedTeams));
  };

  // Load saved teams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedTeams');
    if (saved) {
      setSavedTeams(JSON.parse(saved));
    }
  }, []);

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

  const analyzeTeamCoverage = () => {
    const typeCounts = {};
    const allTypes = new Set();

    team.forEach(pokemon => {
      const types = getPokemonTypes(pokemon);
      types.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        allTypes.add(type);
      });
    });

    return {
      typeCounts,
      uniqueTypes: Array.from(allTypes),
      coverage: Object.keys(typeCounts).length
    };
  };

  const getTeamRecommendations = () => {
    const coverage = analyzeTeamCoverage();
    const recommendations = [];

    if (team.length < 6) {
      recommendations.push(`Add ${6 - team.length} more Pokemon to complete your team`);
    }

    if (coverage.coverage < 6) {
      recommendations.push('Consider adding more type diversity for better coverage');
    }

    const weakTypes = Object.entries(coverage.typeCounts)
      .filter(([_, count]) => count === 1)
      .map(([type, _]) => type);

    if (weakTypes.length > 0) {
      recommendations.push(`Types with single coverage: ${weakTypes.join(', ')}`);
    }

    return recommendations;
  };

  if (loading) {
    return <div className="team-builder-loading">Loading Pokemon data...</div>;
  }

  const teamCoverage = analyzeTeamCoverage();
  const recommendations = getTeamRecommendations();

  return (
    <div className="team-builder">
      <div className="builder-header">
        <h2>⚔️ Team Builder</h2>
        <p>Create optimal raid teams with type coverage and recommendations</p>
      </div>

      <div className="builder-content">
        <div className="builder-left">
          <div className="pokemon-selection">
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a Pokemon to add to your team..."
                className="builder-search"
              />
              {showAutocomplete && (
                <div className="builder-autocomplete">
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

          {selectedPokemon && (
            <div className="selected-pokemon">
              <div className="pokemon-preview">
                <div className="sprite-section">
                  <img 
                    src={sprite} 
                    alt={selectedPokemon.names.English}
                    className="pokemon-sprite"
                  />
                </div>
                <div className="pokemon-info">
                  <h3>#{selectedPokemon.dexNr} - {selectedPokemon.names.English}</h3>
                  <div className="types-container">
                    {getPokemonTypes(selectedPokemon).map(type => (
                      <span key={type} className="type-badge">{type}</span>
                    ))}
                  </div>
                  <div className="stats-preview">
                    <span>⚔️ {selectedPokemon.stats?.attack || 'N/A'}</span>
                    <span>🛡️ {selectedPokemon.stats?.defense || 'N/A'}</span>
                    <span>❤️ {selectedPokemon.stats?.stamina || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={addToTeam} 
                className="add-to-team-btn"
                disabled={team.length >= 6}
              >
                ➕ Add to Team ({team.length}/6)
              </button>
            </div>
          )}

          <div className="team-management">
            <div className="team-header">
              <h3>Your Team</h3>
              <div className="team-actions">
                <button onClick={clearTeam} className="clear-team-btn">
                  🗑️ Clear Team
                </button>
              </div>
            </div>

            <div className="team-name-input">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name..."
                className="team-name-field"
              />
              <button onClick={saveTeam} className="save-team-btn" disabled={team.length === 0}>
                💾 Save Team
              </button>
            </div>

            <div className="team-grid">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className={`team-slot ${team[index] ? 'filled' : 'empty'}`}>
                  {team[index] ? (
                    <div className="team-member">
                      <img 
                        src={team[index].sprite} 
                        alt={team[index].names.English}
                        className="member-sprite"
                      />
                      <div className="member-info">
                        <span className="member-name">{team[index].names.English}</span>
                        <div className="member-types">
                          {getPokemonTypes(team[index]).map(type => (
                            <span key={type} className="type-badge small">{type}</span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromTeam(index)}
                        className="remove-member-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <span>Empty</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="builder-right">
          <div className="team-analysis">
            <h3>📊 Team Analysis</h3>
            
            <div className="analysis-section">
              <h4>Type Coverage</h4>
              <div className="coverage-stats">
                <div className="stat-item">
                  <span className="stat-label">Team Size:</span>
                  <span className="stat-value">{team.length}/6</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Types:</span>
                  <span className="stat-value">{teamCoverage.coverage}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Type Diversity:</span>
                  <span className="stat-value">{teamCoverage.uniqueTypes.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <h4>Type Distribution</h4>
              <div className="type-distribution">
                {Object.entries(teamCoverage.typeCounts).map(([type, count]) => (
                  <div key={type} className="type-count">
                    <span className="type-name">{type}</span>
                    <span className="type-count-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analysis-section">
              <h4>💡 Recommendations</h4>
              <div className="recommendations">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      {rec}
                    </div>
                  ))
                ) : (
                  <div className="recommendation-item good">
                    ✅ Your team looks well-balanced!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="saved-teams">
            <h3>💾 Saved Teams</h3>
            <div className="teams-list">
              {savedTeams.length > 0 ? (
                savedTeams.map(team => (
                  <div key={team.id} className="saved-team">
                    <div className="team-info">
                      <h4>{team.name}</h4>
                      <span className="team-date">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                      <span className="team-size">{team.pokemon.length} Pokemon</span>
                    </div>
                    <div className="team-preview">
                      {team.pokemon.slice(0, 3).map((pokemon, index) => (
                        <img 
                          key={index}
                          src={pokemon.sprite} 
                          alt={pokemon.names.English}
                          className="preview-sprite"
                        />
                      ))}
                      {team.pokemon.length > 3 && (
                        <span className="more-pokemon">+{team.pokemon.length - 3}</span>
                      )}
                    </div>
                    <div className="team-actions">
                      <button onClick={() => loadTeam(team)} className="load-team-btn">
                        📂 Load
                      </button>
                      <button onClick={() => deleteTeam(team.id)} className="delete-team-btn">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-teams">
                  <p>No saved teams yet. Create and save your first team!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TeamBuilder; 
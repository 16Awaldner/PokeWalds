import { useState, useEffect } from 'react';
import { newPogoApi } from '../services/newPogoApi';
import { pokeApi } from '../services/pokeApi';
import './RaidBosses.css';

const RaidBosses = ({ onNavigateToPokemon }) => {
  const [raidData, setRaidData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [spriteCache, setSpriteCache] = useState({});

  useEffect(() => {
    const loadRaidData = async () => {
      try {
        setLoading(true);
        const data = await newPogoApi.getRaidBosses();
        setRaidData(data);
      } catch (err) {
        setError('Failed to load raid boss data');
        console.error('Error loading raid boss data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRaidData();
  }, []);

  const getPokemonSprite = async (pokemonName) => {
    if (spriteCache[pokemonName]) {
      return spriteCache[pokemonName];
    }

    try {
      // Try to get Pokemon data to find the ID
      const pokemonData = await newPogoApi.getPokemonByName(pokemonName.toLowerCase());
      if (pokemonData && pokemonData.id) {
        const spriteUrl = await pokeApi.getPokemonSprite(pokemonData.id);
        setSpriteCache(prev => ({ ...prev, [pokemonName]: spriteUrl }));
        return spriteUrl;
      }
    } catch (err) {
      console.error(`Failed to get sprite for ${pokemonName}:`, err);
    }
    return null;
  };

  const handleCardClick = (pokemonName) => {
    if (onNavigateToPokemon) {
      // Remove "Mega" prefix from Pokemon names
      const cleanName = pokemonName.replace(/^Mega\s+/i, '');
      onNavigateToPokemon(cleanName);
    }
  };

  const formatRaidLevel = (level) => {
    const levelMap = {
      '1': 'Tier 1',
      '3': 'Tier 3',
      '5': 'Tier 5',
      '6': 'Tier 6',
      'mega': 'Mega',
      'ultra_beast': 'Ultra Beast',
      'ex': 'EX Raid'
    };
    return levelMap[level] || level;
  };

  const getRaidBossesByLevel = (level) => {
    if (!raidData || !raidData.currentList) return [];
    return raidData.currentList[level] || [];
  };

  const getPreviousRaidBosses = () => {
    if (!raidData || !raidData.previousList) return [];
    return Object.values(raidData.previousList).flat();
  };

  const RaidBossCard = ({ boss, isPrevious = false }) => {
    const [spriteUrl, setSpriteUrl] = useState(null);
    const [spriteLoading, setSpriteLoading] = useState(true);

    useEffect(() => {
      const loadSprite = async () => {
        setSpriteLoading(true);
        try {
          const url = await getPokemonSprite(boss.names.English);
          setSpriteUrl(url);
        } catch (err) {
          console.error(`Failed to load sprite for ${boss.names.English}:`, err);
        } finally {
          setSpriteLoading(false);
        }
      };
      loadSprite();
    }, [boss.names.English]);

    return (
      <div 
        className={`raid-boss-card ${isPrevious ? 'previous' : ''}`}
        onClick={() => handleCardClick(boss.names.English)}
        style={{ cursor: 'pointer' }}
      >
        <div className="boss-header">
          <div className="boss-info">
            <h5>{boss.names.English}</h5>
            {boss.shiny && <span className="shiny-badge">✨ Shiny</span>}
          </div>
          <div className="boss-sprite">
            {spriteLoading ? (
              <div className="sprite-loading">Loading...</div>
            ) : spriteUrl ? (
              <img 
                src={spriteUrl} 
                alt={boss.names.English}
                className="raid-sprite"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <div className="sprite-placeholder">No Image</div>
            )}
          </div>
        </div>
        
        <div className="boss-details">
          <div className="boss-types">
            {boss.types.map(type => (
              <span key={type} className="type-badge">{type}</span>
            ))}
          </div>
          
          <div className="cp-ranges">
            <div className="cp-range">
              <span className="cp-label">CP Range:</span>
              <span className="cp-value">{boss.cpRange[0]} - {boss.cpRange[1]}</span>
            </div>
            {boss.cpRangeBoost && (
              <div className="cp-range">
                <span className="cp-label">Weather Boost:</span>
                <span className="cp-value">{boss.cpRangeBoost[0]} - {boss.cpRangeBoost[1]}</span>
              </div>
            )}
          </div>
          
          {boss.weather && boss.weather.length > 0 && (
            <div className="weather-boost">
              <span className="weather-label">Weather Boost:</span>
              <div className="weather-types">
                {boss.weather.map(weather => (
                  <span key={weather} className="weather-badge">{weather}</span>
                ))}
              </div>
            </div>
          )}
          
          {boss.counter && Object.keys(boss.counter).length > 0 && (
            <div className="counters">
              <span className="counter-label">Counters:</span>
              <div className="counter-types">
                {Object.entries(boss.counter).map(([type, multiplier]) => (
                  <span key={type} className="counter-badge" title={`${multiplier}x damage`}>
                    {type} ({multiplier}x)
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {boss.battleResult && (
            <div className="battle-info">
              <span className="battle-label">Battle Difficulty:</span>
              <div className="battle-results">
                {Object.entries(boss.battleResult).map(([difficulty, result]) => (
                  <div key={difficulty} className="battle-result">
                    <span className="difficulty">{difficulty}:</span>
                    <span className="estimator">{result.totalEstimator.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="raid-bosses">
        <div className="loading">Loading raid boss data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="raid-bosses">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="raid-bosses">
      <div className="raid-header">
        <h2>⚔️ Raid Bosses</h2>
        <p>Current and previous raid bosses with detailed information</p>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Raids
        </button>
        <button 
          className={`tab-button ${activeTab === 'previous' ? 'active' : ''}`}
          onClick={() => setActiveTab('previous')}
        >
          Previous Raids
        </button>
      </div>

      <div className="raid-content">
        {activeTab === 'current' && (
          <div className="current-raids">
            <h3>🔥 Current Raid Bosses</h3>
            {raidData && raidData.currentList ? (
              <div className="raid-tiers">
                {Object.entries(raidData.currentList).map(([level, bosses]) => (
                  <div key={level} className="raid-tier">
                    <h4>{formatRaidLevel(level)}</h4>
                    <div className="raid-bosses-grid">
                      {bosses.map((boss, index) => (
                        <RaidBossCard key={index} boss={boss} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-raids">No current raid data available</p>
            )}
          </div>
        )}

        {activeTab === 'previous' && (
          <div className="previous-raids">
            <h3>📚 Previous Raid Bosses</h3>
            {getPreviousRaidBosses().length > 0 ? (
              <div className="raid-bosses-grid">
                {getPreviousRaidBosses().map((boss, index) => (
                  <RaidBossCard key={index} boss={boss} isPrevious={true} />
                ))}
              </div>
            ) : (
              <p className="no-raids">No previous raid data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RaidBosses; 
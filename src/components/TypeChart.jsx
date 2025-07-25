import { useState, useEffect } from 'react';
import { newPogoApi } from '../services/newPogoApi';
import './TypeChart.css';

const TypeChart = () => {
  const [typesData, setTypesData] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const typeColors = {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Electric: '#F8D030',
    Grass: '#78C850',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC'
  };

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoading(true);
        const data = await newPogoApi.getTypes();
        setTypesData(data);
      } catch (err) {
        setError('Failed to load type data');
        console.error('Error loading types:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTypes();
  }, []);

  const getEffectiveness = (attackingType, defendingType) => {
    if (!attackingType || !defendingType) return 1;
    
    const typeData = typesData.find(t => t.type === attackingType);
    if (!typeData) return 1;

    if (defendingType.doubleDamageFrom && defendingType.doubleDamageFrom.includes(attackingType)) {
      return 2; // Super effective
    } else if (defendingType.halfDamageFrom && defendingType.halfDamageFrom.includes(attackingType)) {
      return 0.5; // Not very effective
    } else if (defendingType.noDamageFrom && defendingType.noDamageFrom.includes(attackingType)) {
      return 0; // No effect
    }
    
    return 1; // Normal effectiveness
  };

  const getEffectivenessClass = (effectiveness) => {
    if (effectiveness === 0) return 'no-effect';
    if (effectiveness === 0.5) return 'not-very-effective';
    if (effectiveness === 1) return 'normal';
    if (effectiveness === 2) return 'super-effective';
    return 'normal';
  };

  const getEffectivenessText = (effectiveness) => {
    if (effectiveness === 0) return '0×';
    if (effectiveness === 0.5) return '½×';
    if (effectiveness === 1) return '1×';
    if (effectiveness === 2) return '2×';
    return '1×';
  };

  const handleTypeClick = (type) => {
    setSelectedType(selectedType === type ? null : type);
  };

  const handleTypeHover = (type) => {
    setHoveredType(type);
  };

  const handleTypeLeave = () => {
    setHoveredType(null);
  };

  if (loading) {
    return <div className="type-chart-loading">Loading type data...</div>;
  }

  const allTypes = Object.keys(typeColors);

  return (
    <div className="type-chart">
      <div className="chart-header">
        <h2>📊 Type Effectiveness Chart</h2>
        <p>Click on a type to see its effectiveness against all other types</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="chart-container">
        <div className="chart-grid">
          {/* Header row with attacking types */}
          <div className="chart-header-row">
            <div className="chart-corner"></div>
            {allTypes.map(type => (
              <div 
                key={type} 
                className={`chart-header-cell ${selectedType === type ? 'selected' : ''}`}
                style={{ backgroundColor: typeColors[type] }}
                onClick={() => handleTypeClick(type)}
                onMouseEnter={() => handleTypeHover(type)}
                onMouseLeave={handleTypeLeave}
              >
                {type}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {allTypes.map(defendingType => (
            <div key={defendingType} className="chart-row">
              <div 
                className={`chart-row-header ${selectedType === defendingType ? 'selected' : ''}`}
                style={{ backgroundColor: typeColors[defendingType] }}
                onClick={() => handleTypeClick(defendingType)}
                onMouseEnter={() => handleTypeHover(defendingType)}
                onMouseLeave={handleTypeLeave}
              >
                {defendingType}
              </div>
              {allTypes.map(attackingType => {
                const effectiveness = getEffectiveness(attackingType, defendingType);
                const isHighlighted = selectedType === attackingType || selectedType === defendingType;
                const isHovered = hoveredType === attackingType || hoveredType === defendingType;
                
                return (
                  <div 
                    key={`${attackingType}-${defendingType}`}
                    className={`chart-cell ${getEffectivenessClass(effectiveness)} ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''}`}
                    onClick={() => handleTypeClick(attackingType)}
                    onMouseEnter={() => handleTypeHover(attackingType)}
                    onMouseLeave={handleTypeLeave}
                  >
                    {getEffectivenessText(effectiveness)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color no-effect"></div>
            <span>No Effect (0×)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color not-very-effective"></div>
            <span>Not Very Effective (½×)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color normal"></div>
            <span>Normal (1×)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color super-effective"></div>
            <span>Super Effective (2×)</span>
          </div>
        </div>
      </div>

      {selectedType && (
        <div className="type-details">
          <h3>Type Details: {selectedType}</h3>
          <div className="type-info">
            <div className="type-section">
              <h4>Super Effective Against:</h4>
              <div className="type-list">
                {typesData.find(t => t.type === selectedType)?.doubleDamageTo?.map(type => (
                  <span 
                    key={type} 
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {type}
                  </span>
                )) || <span className="no-types">None</span>}
              </div>
            </div>
            
            <div className="type-section">
              <h4>Not Very Effective Against:</h4>
              <div className="type-list">
                {typesData.find(t => t.type === selectedType)?.halfDamageTo?.map(type => (
                  <span 
                    key={type} 
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {type}
                  </span>
                )) || <span className="no-types">None</span>}
              </div>
            </div>
            
            <div className="type-section">
              <h4>No Effect Against:</h4>
              <div className="type-list">
                {typesData.find(t => t.type === selectedType)?.noDamageTo?.map(type => (
                  <span 
                    key={type} 
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {type}
                  </span>
                )) || <span className="no-types">None</span>}
              </div>
            </div>
            
            <div className="type-section">
              <h4>Weak To:</h4>
              <div className="type-list">
                {typesData.find(t => t.type === selectedType)?.doubleDamageFrom?.map(type => (
                  <span 
                    key={type} 
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {type}
                  </span>
                )) || <span className="no-types">None</span>}
              </div>
            </div>
            
            <div className="type-section">
              <h4>Resistant To:</h4>
              <div className="type-list">
                {typesData.find(t => t.type === selectedType)?.halfDamageFrom?.map(type => (
                  <span 
                    key={type} 
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {type}
                  </span>
                )) || <span className="no-types">None</span>}
              </div>
            </div>
            
            <div className="type-section">
              <h4>Immune To:</h4>
              <div className="type-list">
                {typesData.find(t => t.type === selectedType)?.noDamageFrom?.map(type => (
                  <span 
                    key={type} 
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {type}
                  </span>
                )) || <span className="no-types">None</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeChart; 
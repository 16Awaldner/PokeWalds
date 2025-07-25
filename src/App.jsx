import { useState } from 'react';
import PokemonSearch from './components/PokemonSearch';
import RaidBosses from './components/RaidBosses';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('pokemon');
  const [searchPokemon, setSearchPokemon] = useState('');

  const handleNavigateToPokemon = (pokemonName) => {
    setSearchPokemon(pokemonName);
    setActiveSection('pokemon');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎮 Pokemon GO Hub</h1>
        <p>Your ultimate companion for Pokemon GO information</p>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-button ${activeSection === 'pokemon' ? 'active' : ''}`}
          onClick={() => setActiveSection('pokemon')}
        >
          🔍 Pokemon Search
        </button>
        <button 
          className={`nav-button ${activeSection === 'raids' ? 'active' : ''}`}
          onClick={() => setActiveSection('raids')}
        >
          ⚔️ Raid Bosses
        </button>
      </nav>

      <main className="app-main">
        {activeSection === 'pokemon' && <PokemonSearch initialSearch={searchPokemon} />}
        {activeSection === 'raids' && <RaidBosses onNavigateToPokemon={handleNavigateToPokemon} />}
      </main>

      <footer className="app-footer">
        <p>Pokemon GO Hub - Your ultimate Pokemon GO companion</p>
      </footer>
    </div>
  );
}

export default App;

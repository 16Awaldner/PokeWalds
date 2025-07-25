# 🎮 Pokemon GO Hub

A comprehensive web application for Pokemon GO players, providing detailed information about Pokemon, raid bosses, and powerful tools for team building and analysis. Built with React and Vite, designed for optimal performance and user experience.

## 🌐 Live Demo

**🚀 Deployed on GitHub Pages**: [View Live Site](https://your-username.github.io/PokeGOAPi/)

## ✨ Features

### 🔍 Pokemon Search
- **Comprehensive Pokemon Database**: Search by name or ID to find detailed information
- **Autocomplete Search**: Smart search suggestions with Pokemon names and types
- **Detailed Pokemon Information**:
  - Base stats (Attack, Defense, Stamina) with visual progress bars
  - Type information and effectiveness
  - Available moves (Fast and Charged) with power and energy stats
  - Pokemon sprites (Normal and Shiny variants)
  - Generation and class information
- **Type Effectiveness Calculator**: Shows damage multipliers for dual-type Pokemon (e.g., 4× damage for Electric vs Water/Flying)
- **Visual Type Effectiveness**: Color-coded multipliers (0×, ¼×, ½×, 1×, 2×, 4×)

### ⚔️ Raid Bosses
- **Current Raid Bosses**: View all currently available raid bosses
- **Previous Raid Bosses**: Historical raid boss information
- **Detailed Raid Information**:
  - Raid level and CP ranges
  - Weather boost information
  - Recommended counters
  - Battle results and strategies

### ⚖️ Pokemon Comparison Tool
- **Side-by-Side Comparison**: Compare any two Pokemon directly
- **Visual Stat Comparison**: Color-coded stats showing which Pokemon is better
- **Move Comparison**: Compare available moves and their effectiveness
- **Type Analysis**: See how types stack up against each other
- **Quick Swap**: Easily swap Pokemon positions for different comparisons
- **Comprehensive Stats**: Attack, Defense, Stamina, and total stat comparisons

### 🧮 CP Calculator
- **Interactive CP Calculation**: Calculate CP at any level (1-60) with custom IVs
- **HP Calculator**: Determine HP values for any Pokemon configuration
- **IV Management**: Set individual Attack, Defense, and Stamina IVs (0-15)
- **Visual IV Display**: Color-coded IV indicators (Perfect, Good, Poor)
- **Real-time Updates**: See results update instantly as you adjust values
- **Shiny Toggle**: Switch between normal and shiny sprites

### 📊 Type Chart Visualizer
- **Interactive Type Chart**: Complete 18×18 type effectiveness matrix
- **Click to Analyze**: Click any type to see detailed effectiveness information
- **Hover Effects**: Hover over types to highlight relationships
- **Color-Coded Effectiveness**: Visual indicators for 0×, ½×, 1×, and 2× damage
- **Type Details Panel**: Comprehensive breakdown of type strengths and weaknesses
- **Responsive Design**: Works on desktop and mobile devices

### ⚔️ Team Builder
- **6-Pokemon Teams**: Build complete raid teams with up to 6 Pokemon
- **Type Coverage Analysis**: See your team's type diversity and coverage
- **Smart Recommendations**: Get suggestions for improving team balance
- **Team Management**: Save, load, and delete teams with custom names
- **Local Storage**: Teams persist between sessions
- **Visual Team Display**: See your team layout with sprites and types
- **Team Statistics**: Track team size, unique types, and type distribution

## 🛠️ Technical Features

- **Client-Side Caching**: 1-hour cache for all API requests to improve performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Fast Search**: Instant autocomplete with keyboard navigation
- **Optimized Performance**: Built with Vite for fast development and production builds
- **Local Storage**: Save teams and preferences locally
- **Real-time Calculations**: Instant updates for CP and team analysis

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PokeGOAPi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🌐 Deployment

### GitHub Pages
The application is configured for easy deployment to GitHub Pages:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy using the provided script:
   ```bash
   ./deploy.sh
   ```

Or use the GitHub Actions workflow for automatic deployment on push to main branch.

## 📡 API Integration

The application integrates with multiple APIs to provide comprehensive Pokemon GO data:

### Primary APIs
- **[Pokemon GO API](https://pokemon-go-api.github.io/pokemon-go-api/)**: Core Pokemon data, raid bosses, types, and moves
- **[PokeAPI](https://pokeapi.co/)**: Pokemon sprites and additional Pokemon information

### Data Sources
- **Pokemon Information**: Names, stats, types, moves, and more
- **Raid Bosses**: Current and historical raid information
- **Type Effectiveness**: Damage multipliers and type relationships
- **Pokemon Sprites**: Normal and shiny variants

## 🎨 UI/UX Features

- **Modern Design**: Clean, card-based layout with smooth animations
- **Color-Coded Information**: Visual indicators for different data types
- **Interactive Elements**: Hover effects and smooth transitions
- **Responsive Grid**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Gradient Backgrounds**: Beautiful visual design throughout
- **Consistent Styling**: Unified design language across all components

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── PokemonSearch.jsx      # Main Pokemon search component
│   ├── PokemonSearch.css      # Pokemon search styles
│   ├── RaidBosses.jsx         # Raid bosses component
│   ├── RaidBosses.css         # Raid bosses styles
│   ├── PokemonComparison.jsx  # Pokemon comparison tool
│   ├── PokemonComparison.css  # Comparison tool styles
│   ├── CPCalculator.jsx       # CP calculator component
│   ├── CPCalculator.css       # CP calculator styles
│   ├── TypeChart.jsx          # Type chart visualizer
│   ├── TypeChart.css          # Type chart styles
│   ├── TeamBuilder.jsx        # Team builder component
│   └── TeamBuilder.css        # Team builder styles
├── services/
│   ├── newPogoApi.js          # Pokemon GO API integration
│   └── pokeApi.js             # PokeAPI integration
├── App.jsx                    # Main application component
├── App.css                    # Application styles
└── index.css                  # Global styles
```

### Key Technologies
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **JavaScript ES6+**: Modern JavaScript features
- **Local Storage**: Browser-based data persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **[Pokemon GO API](https://pokemon-go-api.github.io/pokemon-go-api/)**: For comprehensive Pokemon GO data
- **[PokeAPI](https://pokeapi.co/)**: For Pokemon sprites and additional information
- **Pokemon Company**: For the Pokemon franchise and game data
- **Niantic**: For Pokemon GO game mechanics and data

## 📞 Support

If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.

---

**Pokemon GO Hub** - Your ultimate Pokemon GO companion! 🎮✨ 
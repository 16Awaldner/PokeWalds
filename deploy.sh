#!/bin/bash

# Pokemon Go Hub - Deployment Script for GitHub Pages

echo "🎮 Building Pokemon Go Hub for production..."

# Build the project
npm run build

echo "✅ Build completed successfully!"

echo "📁 Build files are ready in the 'dist' directory"
echo "🚀 To deploy to GitHub Pages:"
echo "   1. Push your code to GitHub"
echo "   2. Go to repository Settings > Pages"
echo "   3. Select 'Deploy from a branch' and choose 'main' branch"
echo "   4. Select the 'dist' folder as the source"
echo "   5. Your app will be available at: https://yourusername.github.io/PokeGOAPi/"

echo ""
echo "🎯 Happy Pokemon hunting! ✨" 
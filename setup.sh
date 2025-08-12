#!/bin/bash

echo "🎵 Setting up Top Albums - Spotify Music Discovery App"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 Setup complete! Here's what to do next:"
echo ""
echo "1. 🎵 Create a Spotify app at: https://developer.spotify.com/dashboard/"
echo "   - Add redirect URI: https://your-username.github.io/top-albums/callback"
echo "   - Copy your Client ID"
echo ""
echo "2. ⚙️  Configure environment variables:"
echo "   cd frontend"
echo "   cp env.example .env.local"
echo "   # Edit .env.local with your Spotify Client ID"
echo ""
echo "3. 🚀 Start development:"
echo "   npm run dev"
echo ""
echo "4. 🌐 Deploy to GitHub Pages:"
echo "   npm run deploy"
echo ""
echo "📚 Check README.md for detailed instructions!"
echo ""
echo "Happy coding! 🎵✨"

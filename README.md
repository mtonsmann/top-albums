# Top Albums - Spotify Music Discovery App

A modern web application that allows users to log in with their Spotify accounts and discover which albums released this year are likely to be their favorites.

## Features (Current Version)

- 🔐 **Spotify OAuth Authentication** - Secure login with Spotify accounts using Implicit Grant Flow
- 🎵 **Top Songs Display** - View your most-listened tracks with beautiful album artwork
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🚀 **GitHub Pages Hosting** - Free hosting with automated deployments
- ⚡ **Modern Tech Stack** - Built with React, TypeScript, and Vite

## Tech Stack

- **Frontend**: React 18 with TypeScript and modern hooks
- **Styling**: CSS with CSS variables and responsive design
- **Build Tool**: Vite for fast development and optimized builds
- **Hosting**: GitHub Pages with automated deployment via GitHub Actions
- **Authentication**: Spotify OAuth 2.0 Implicit Grant Flow

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- GitHub account
- Spotify Developer account

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd top-albums
npm run install:all
```

### 2. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Add these redirect URIs:
   - **Production**: `https://your-username.github.io/top-albums/callback`
   - **Development**: `http://localhost:3000/callback`
4. Copy your **Client ID** (you'll need this)

### 3. Environment Configuration

```bash
cd frontend
cp env.example .env.local
```

Edit `.env.local` with your Spotify credentials:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_REDIRECT_URI=https://your-username.github.io/top-albums/callback
```

### 4. Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 5. Deploy to GitHub Pages

```bash
npm run deploy
```

Or simply push to main branch - GitHub Actions will auto-deploy!

## Project Structure

```
top-albums/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # App entry point
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── .github/workflows/       # GitHub Actions
├── package.json             # Root package.json
└── README.md               # This file
```

## How It Works

### Authentication Flow
1. User clicks "Connect with Spotify" button
2. Redirected to Spotify OAuth page
3. User authorizes the app
4. Spotify redirects back with access token in URL hash
5. App extracts token and stores it securely
6. User can now view their top songs

### Top Songs Display
- Fetches user's top tracks from Spotify API
- Supports different time ranges (4 weeks, 6 months, all time)
- Beautiful grid layout with album artwork
- Links directly to Spotify for each track

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run install:all` - Install all dependencies

### Adding New Features

The app is structured to easily add new features:
- **New Components**: Add to `frontend/src/components/`
- **New Pages**: Add routes in `App.tsx`
- **Styling**: Use CSS variables in `index.css` for consistency

## Deployment

### GitHub Pages Setup

1. In your GitHub repository, go to **Settings** > **Pages**
2. Set source to **Deploy from a branch**
3. Select **gh-pages** branch
4. Your app will be available at `https://your-username.github.io/top-albums`

### Automated Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
- Builds the React app
- Deploys to GitHub Pages
- Runs on every push to main branch

## Future Features

- [ ] **Album Recommendations** - Suggest albums based on top songs
- [ ] **Music Discovery** - Find new artists and genres
- [ ] **Playlist Creation** - Generate playlists from recommendations
- [ ] **Social Features** - Share music taste with friends
- [ ] **Analytics** - Detailed listening statistics

## Contributing

This is a personal project for learning modern web development and Spotify API integration.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Check that your redirect URI exactly matches what's in Spotify Dashboard
   - Ensure no trailing slashes or typos

2. **"CORS error" in development**
   - The app uses Implicit Grant Flow, so CORS shouldn't be an issue
   - Make sure you're using the correct redirect URI for development

3. **Build fails on GitHub Actions**
   - Check that all dependencies are properly installed
   - Verify Node.js version compatibility

## License

MIT License - feel free to use this code for your own projects!

## Acknowledgments

- Spotify Web API for music data
- React team for the amazing framework
- GitHub for free hosting and CI/CD
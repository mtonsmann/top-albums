import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  external_urls: {
    spotify: string
  }
}

const Dashboard: React.FC = () => {
  const { accessToken, user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    fetchTopTracks()
  }, [isAuthenticated, navigate, timeRange])

  const fetchTopTracks = async () => {
    if (!accessToken) return

    try {
      setLoading(true)
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setTopTracks(data.items)
      } else {
        console.error('Failed to fetch top tracks')
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          {user?.images?.[0] && (
            <img 
              src={user.images[0].url} 
              alt={user.display_name} 
              className="user-avatar"
            />
          )}
          <div className="user-details">
            <h1>Welcome, {user?.display_name || 'Music Lover'}!</h1>
            <p>Discover your music taste and get recommendations</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="controls">
          <h2>Your Top Songs</h2>
          <div className="time-range-selector">
            <label htmlFor="timeRange">Time Range:</label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="short_term">Last 4 Weeks</option>
              <option value="medium_term">Last 6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your top tracks...</p>
          </div>
        ) : (
          <div className="tracks-grid">
            {topTracks.map((track, index) => (
              <div key={track.id} className="track-card">
                <div className="track-rank">#{index + 1}</div>
                <div className="track-image">
                  <img 
                    src={track.album.images[0]?.url || '/placeholder-album.png'} 
                    alt={track.album.name}
                  />
                </div>
                <div className="track-info">
                  <h3 className="track-name">{track.name}</h3>
                  <p className="track-artist">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                  <p className="track-album">{track.album.name}</p>
                </div>
                <a 
                  href={track.external_urls.spotify} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="spotify-link"
                >
                  🎵
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && topTracks.length === 0 && (
          <div className="no-tracks">
            <p>No tracks found for this time period.</p>
            <p>Try listening to more music on Spotify!</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard

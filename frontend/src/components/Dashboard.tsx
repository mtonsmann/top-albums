import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    id: string
    name: string
    images: Array<{ url: string; height: number; width: number }>
    release_date?: string
    release_date_precision?: 'year' | 'month' | 'day'
  }
  external_urls: {
    spotify: string
  }
}

interface AlbumEntry {
  id: string
  name: string
  artists: string[]
  images: Array<{ url: string; height: number; width: number }>
  release_date?: string
  score: number
  trackCount: number
  bestRank: number
}

const Dashboard: React.FC = () => {
  const { accessToken, user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>(
    'medium_term'
  )
  const [numToFetch, setNumToFetch] = useState<number>(250)
  const currentYear = new Date().getFullYear()
  const [releaseYear, setReleaseYear] = useState<string>(String(currentYear))
  const [topAlbums, setTopAlbums] = useState<AlbumEntry[]>([])
  const [showTracks, setShowTracks] = useState<boolean>(false)
  const [showMethodology, setShowMethodology] = useState<boolean>(false)

  const yearOptions = ['all', ...Array.from({ length: 10 }, (_, idx) => String(currentYear - idx))]

  const handleShare = () => {
    const lines = topAlbums.map(
      (album, idx) => `${idx + 1}. ${album.name} - ${album.artists.join(', ')}`
    )
    const yearText = releaseYear === 'all' ? 'All Time' : releaseYear
    const text = `My Top Albums (${yearText})\n\n${lines.join('\n')}`
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Top albums copied to clipboard!')
      })
      .catch((err) => {
        console.error('Failed to copy top albums:', err)
      })
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    fetchTopTracks()
  }, [isAuthenticated, navigate, timeRange, numToFetch, releaseYear])

  const fetchTopTracks = async () => {
    if (!accessToken) return

    try {
      setLoading(true)
      const pageLimit = 50
      const pagesToFetch = Math.ceil(numToFetch / pageLimit)
      let allItems: Track[] = []

      for (let page = 0; page < pagesToFetch; page++) {
        const offset = page * pageLimit
        const limit = pageLimit
        const resp = await fetch(
          `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&offset=${offset}&time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )
        if (!resp.ok) {
          console.error('Failed to fetch top tracks (page)', page)
          break
        }
        const data = await resp.json()
        const items: Track[] = data.items || []
        allItems = allItems.concat(items)
        if (items.length < limit) {
          // No more items available
          break
        }
      }

      const filteredByYear: Track[] =
        releaseYear === 'all'
          ? allItems
          : allItems.filter((track) => {
              const rd = track.album?.release_date || ''
              return rd.startsWith(releaseYear)
            })
      const trimmed = filteredByYear.slice(0, numToFetch)
      setTopTracks(trimmed)

      const albumMap = new Map<string, AlbumEntry>()
      for (let i = 0; i < trimmed.length; i++) {
        const track = trimmed[i]
        const albumId = track.album.id
        if (!albumId) continue
        const rankWeight = trimmed.length - i // simple Borda-like weight
        const existing = albumMap.get(albumId)
        if (existing) {
          existing.score += rankWeight
          existing.trackCount += 1
          existing.bestRank = Math.min(existing.bestRank, i + 1)
        } else {
          albumMap.set(albumId, {
            id: albumId,
            name: track.album.name,
            artists: track.artists.map((a) => a.name),
            images: track.album.images || [],
            release_date: track.album.release_date,
            score: rankWeight,
            trackCount: 1,
            bestRank: i + 1
          })
        }
      }
      const albums = Array.from(albumMap.values())
        .filter((a) => a.trackCount >= 2)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          if (b.trackCount !== a.trackCount) return b.trackCount - a.trackCount
          return a.bestRank - b.bestRank
        })
      setTopAlbums(albums)
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
          <h2>Your Top Albums ({releaseYear === 'all' ? 'all release years' : releaseYear})</h2>
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
          <div className="time-range-selector">
            <label htmlFor="releaseYear">Release year:</label>
            <select
              id="releaseYear"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
            >
              <option value="all">All release years</option>
              {yearOptions
                .filter((year) => year !== 'all')
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </div>
          <div className="time-range-selector">
            <label htmlFor="numToFetch">Songs to fetch:</label>
            <select
              id="numToFetch"
              value={numToFetch}
              onChange={(e) => setNumToFetch(parseInt(e.target.value, 10))}
            >
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={750}>750</option>
              <option value={1000}>1000</option>
              <option value={1250}>1250</option>
              <option value={1500}>1500</option>
              <option value={1750}>1750</option>
              <option value={2000}>2000</option>
              <option value={2250}>2250</option>
              <option value={2500}>2500</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="logout-btn" onClick={() => setShowMethodology((m) => !m)}>
              {showMethodology ? 'Hide methodology' : 'Show methodology'}
            </button>
            {!loading && topAlbums.length > 0 && (
              <button className="logout-btn" onClick={handleShare}>
                Copy top albums
              </button>
            )}
          </div>
          {showMethodology && (
            <div
              style={{
                marginTop: '0.75rem',
                background: 'var(--surface)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We infer your likely top albums for the selected release year from your top songs:
              </p>
              <ul
                style={{
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                  paddingLeft: '1.25rem'
                }}
              >
                <li>We fetch up to the selected number of your top songs (paged in batches of 50).</li>
                <li>
                  We {releaseYear === 'all'
                    ? 'skip filtering by release year'
                    : `filter to tracks whose album release date starts with ${releaseYear}`}.
                </li>
                <li>Tracks are grouped by album. Each track contributes a rank-based weight (higher-ranked songs contribute more).</li>
                <li>Albums are ranked by total score, then by how many of your top songs they contain, then by the best individual rank.</li>
                <li>Albums with only one contributing track are excluded to reduce noise.</li>
              </ul>
            </div>
          )}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your top tracks...</p>
          </div>
        )}

        {!loading && topAlbums.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div className="tracks-grid">
              {topAlbums.map((album, index) => (
                <div key={album.id} className="track-card">
                  <div className="track-rank">#{index + 1}</div>
                  <div className="track-image">
                    <img src={album.images[0]?.url || '/placeholder-album.png'} alt={album.name} />
                  </div>
                  <div className="track-info">
                    <h3 className="track-name">{album.name}</h3>
                    <p className="track-artist">{album.artists.join(', ')}</p>
                    <p className="track-album">
                      {album.release_date ? album.release_date.substring(0, 4) : ''}
                      {` • ${album.trackCount} track${album.trackCount > 1 ? 's' : ''} in your top songs`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: '1.5rem' }}>
            <button className="logout-btn" onClick={() => setShowTracks((s) => !s)}>
              {showTracks ? 'Hide top songs' : 'Show top songs'}
            </button>
            {showTracks && (
              <div className="tracks-list">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="track-row">
                    <div className="track-row-rank">{index + 1}</div>
                    <div className="track-row-image">
                      <img
                        src={track.album.images[0]?.url || '/placeholder-album.png'}
                        alt={track.album.name}
                      />
                    </div>
                    <div className="track-row-title">{track.name}</div>
                    <div className="track-row-meta">
                      {track.artists.map((artist) => artist.name).join(', ')} • {track.album.name}
                      {track.album.release_date ? ` • ${track.album.release_date.substring(0, 4)}` : ''}
                    </div>
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="track-row-link"
                    >
                      🎵
                    </a>
                  </div>
                ))}
              </div>
            )}
            {showTracks && topTracks.length === 0 && (
              <div className="no-tracks">
                <p>No tracks matching the selected release year were found for this time period.</p>
                <p>Try expanding the time range or release year filter.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard

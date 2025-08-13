import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Callback from './components/Callback'
import Dashboard from './components/Dashboard'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

// Component to handle Spotify's callback redirect
const SpotifyCallbackHandler = () => {
  useEffect(() => {
    // Check if we have a Spotify authorization code in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      console.log('Spotify callback detected with code, redirecting to callback route')
      // Smooth redirect without full reload: clear search, then set hash
      const base = `${window.location.origin}${window.location.pathname}`
      window.history.replaceState(null, '', base)
      window.location.hash = `/callback?code=${code}`
    }
  }, [])
  
  return null
}

// Debug component to see what's happening
const RouteDebugger = () => {
  const location = useLocation()
  
  useEffect(() => {
    console.log('=== ROUTE DEBUG ===')
    console.log('Current route location:', location)
    console.log('Pathname:', location.pathname)
    console.log('Hash:', location.hash)
    console.log('Search:', location.search)
    console.log('Full URL:', window.location.href)
    console.log('==================')
  }, [location])
  
  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <RouteDebugger />
          <SpotifyCallbackHandler />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

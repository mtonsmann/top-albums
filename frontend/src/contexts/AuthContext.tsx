import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  accessToken: string | null
  user: any | null
  login: () => void
  logout: () => void
  setAccessToken: (token: string) => void
  setUser: (user: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Generate a random string for PKCE
const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], "")
}

// Generate code challenge from code verifier
const generateCodeChallenge = async (codeVerifier: string) => {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [user, setUserState] = useState<any | null>(null)

  useEffect(() => {
    // Check if user is already authenticated (e.g., from localStorage)
    const token = localStorage.getItem('spotify_access_token')
    const userData = localStorage.getItem('spotify_user')
    
    if (token && userData) {
      setAccessTokenState(token)
      setUserState(JSON.parse(userData))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'https://mtonsmann.github.io/top-albums/callback'
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateRandomString(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    // Store code verifier for later use
    localStorage.setItem('spotify_code_verifier', codeVerifier)
    
    const scope = 'user-top-read user-read-private user-read-email'
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&code_challenge_method=S256&code_challenge=${codeChallenge}&show_dialog=true`
    
    window.location.href = authUrl
  }

  const logout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_user')
    localStorage.removeItem('spotify_code_verifier')
    setAccessTokenState(null)
    setUserState(null)
    setIsAuthenticated(false)
  }

  const setAccessToken = (token: string) => {
    setAccessTokenState(token)
    localStorage.setItem('spotify_access_token', token)
    setIsAuthenticated(true)
  }

  const setUser = (userData: any) => {
    setUserState(userData)
    localStorage.setItem('spotify_user', JSON.stringify(userData))
  }

  const value: AuthContextType = {
    isAuthenticated,
    accessToken,
    user,
    login,
    logout,
    setAccessToken,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

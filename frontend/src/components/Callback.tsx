import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getBaseRedirectUri } from '../utils/redirectUri'
import './Callback.css'

const Callback: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAccessToken, setUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Callback component mounted')
        console.log('Location hash:', location.hash)
        console.log('Location search:', location.search)
        console.log('Full location:', location)
        
        // Try to extract authorization code from URL hash (for HashRouter)
        let code = null
        let error = null
        
        // First try the hash (normal case)
        if (location.hash) {
          const hash = location.hash.substring(1) // Remove the leading #
          const searchParams = new URLSearchParams(hash)
          code = searchParams.get('code')
          error = searchParams.get('error')
          console.log('From hash - Code:', code, 'Error:', error)
        }
        
        // If no code in hash, try search params (fallback for encoded URLs)
        if (!code && location.search) {
          const searchParams = new URLSearchParams(location.search)
          code = searchParams.get('code')
          error = searchParams.get('error')
          console.log('From search - Code:', code, 'Error:', error)
        }

        if (error) {
          console.error('Spotify authorization error:', error)
          navigate('/?error=auth_failed')
          return
        }

        if (!code) {
          console.error('No authorization code received')
          console.log('Hash:', location.hash)
          console.log('Search:', location.search)
          navigate('/?error=no_code')
          return
        }

        // Guard: prevent double-processing the same code (React 18 StrictMode double-invokes effects in dev)
        const processedKey = `spotify_code_processed_${code}`
        if (sessionStorage.getItem(processedKey)) {
          console.log('Authorization code already processed; ignoring duplicate effect run')
          return
        }
        sessionStorage.setItem(processedKey, 'true')

        // Get the stored code verifier
        const codeVerifier = localStorage.getItem('spotify_code_verifier')
        if (!codeVerifier) {
          console.error('No code verifier found')
          navigate('/?error=no_verifier')
          return
        }

        // Exchange authorization code for access token
        try {
          const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
          // Use the same redirect URI that was sent in the authorization request (dynamic)
          const redirectUri = getBaseRedirectUri()
          
          console.log('Code received:', code)
          console.log('Code verifier found:', !!codeVerifier)
          console.log('Redirect URI:', redirectUri)

          const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: redirectUri,
              client_id: clientId,
              code_verifier: codeVerifier,
            }),
          })

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error('Token exchange failed:', errorData)
            navigate('/?error=token_exchange_failed')
            return
          }

          const tokenData = await tokenResponse.json()
          const accessToken = tokenData.access_token

          // Clean up the code verifier
          localStorage.removeItem('spotify_code_verifier')

          // Store the access token
          setAccessToken(accessToken)

          // Fetch user profile
          try {
            const userResponse = await fetch('https://api.spotify.com/v1/me', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })

            if (userResponse.ok) {
              const userData = await userResponse.json()
              setUser(userData)
              navigate('/dashboard')
            } else {
              console.error('Failed to fetch user profile')
              navigate('/?error=profile_fetch_failed')
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
            navigate('/?error=profile_fetch_failed')
          }

        } catch (error) {
          console.error('Error exchanging code for token:', error)
          navigate('/?error=token_exchange_failed')
        }

      } catch (error) {
        console.error('Error processing callback:', error)
        navigate('/?error=callback_failed')
      }
    }

    handleCallback()
  }, [location, navigate, setAccessToken, setUser])

  return (
    <div className="callback-container">
      <div className="callback-card">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>Connecting to Spotify...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}

export default Callback

// Spotify API Configuration
// Using Client Credentials Flow for public data access only
// See .env.example for setup instructions

// Debug: Log environment variables
console.log('🔍 Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    hasClientId: !!process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    hasClientSecret: !!process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
});

const spotifyConfig = {
    // App credentials from environment variables
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    
    // Spotify API endpoints
    tokenUrl: 'https://accounts.spotify.com/api/token',
    apiBaseUrl: 'https://api.spotify.com/v1',
    recommendationsUrl: 'https://api.spotify.com/v1/recommendations',
      // API settings
    defaultLimit: 10,
    requestTimeout: 8000,
    maxRetries: 3
};

// Debug: Log final config
console.log('🔧 Spotify config:', {
    hasClientId: !!spotifyConfig.clientId,
    hasClientSecret: !!spotifyConfig.clientSecret,
    endpoints: {
        token: spotifyConfig.tokenUrl,
        api: spotifyConfig.apiBaseUrl
    }
});

export default spotifyConfig;
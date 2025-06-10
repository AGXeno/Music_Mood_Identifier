// Spotify API Configuration
// To get these values:
// 1. Go to https://developer.spotify.com/dashboard
// 2. Create a new app
// 3. Get your Client ID and Client Secret
// 4. Add http://localhost:3000 to redirect URIs for development

const spotifyConfig = {
    // Replace with your actual Spotify app credentials
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID',
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET || 'YOUR_SPOTIFY_CLIENT_SECRET',
    
    // Spotify API endpoints
    tokenUrl: 'https://accounts.spotify.com/api/token',
    apiBaseUrl: 'https://api.spotify.com/v1',
    
    // Authentication scopes (if implementing user OAuth later)
    scopes: [
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private'
    ],
    
    // API settings
    defaultLimit: 10,
    maxRetries: 3,
    requestTimeout: 5000
};

export default spotifyConfig;
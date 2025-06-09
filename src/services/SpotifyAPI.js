class SpotifyService {
    constructor() {
        this.accessToken = null
        this.baseUrl = 'https://api.spotify.com/v1'
    }
    
    // Get Spotify access token (you'll need to implement OAuth or use client credentials)
    async getAccessToken() {
        // For demo purposes - in real app, implement proper Spotify OAuth
        // This is a simplified example
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa('YOUR_CLIENT_ID:YOUR_CLIENT_SECRET')
                },
                body: 'grant_type=client_credentials'
            })
            
            const data = await response.json()
            this.accessToken = data.access_token
            return this.accessToken
        } catch (error) {
            console.error('Failed to get Spotify token:', error)
            return null
        }
    }
    
    // Get music recommendations based on sentiment
    async getRecommendations(sentimentScores) {
        if (!this.accessToken) {
            await this.getAccessToken()
        }
        
        // Map sentiment to music attributes
        const musicAttributes = this.mapSentimentToMusic(sentimentScores)
        
        try {
            const queryParams = new URLSearchParams({
                seed_genres: musicAttributes.genres.join(','),
                target_valence: musicAttributes.valence,
                target_energy: musicAttributes.energy,
                target_danceability: musicAttributes.danceability,
                limit: 5
            })
            
            const response = await fetch(`${this.baseUrl}/recommendations?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            })
            
            const data = await response.json()
            
            return data.tracks.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                spotify_id: track.id
            }))
            
        } catch (error) {
            console.error('Spotify API error:', error)
            // Return mock data if API fails
            return this.getMockRecommendations(sentimentScores)
        }
    }
    
    // Map sentiment scores to Spotify audio features
    mapSentimentToMusic(sentiment) {
        const dominantEmotion = Object.keys(sentiment).reduce((a, b) => 
            sentiment[a] > sentiment[b] ? a : b
        )
        
        switch (dominantEmotion) {
            case 'joy':
                return {
                    genres: ['pop', 'funk', 'dance'],
                    valence: 0.8,
                    energy: 0.7,
                    danceability: 0.8
                }
            case 'sadness':
                return {
                    genres: ['indie', 'folk', 'blues'],
                    valence: 0.3,
                    energy: 0.4,
                    danceability: 0.3
                }
            case 'anger':
                return {
                    genres: ['rock', 'metal', 'punk'],
                    valence: 0.2,
                    energy: 0.9,
                    danceability: 0.6
                }
            case 'fear':
                return {
                    genres: ['ambient', 'classical', 'chill'],
                    valence: 0.4,
                    energy: 0.3,
                    danceability: 0.2
                }
            default:
                return {
                    genres: ['pop'],
                    valence: 0.5,
                    energy: 0.5,
                    danceability: 0.5
                }
        }
    }
    
    // Fallback mock recommendations
    getMockRecommendations(sentiment) {
        const mockSongs = {
            joy: [
                { name: 'Happy', artist: 'Pharrell Williams', spotify_id: '5b88tNINg4Q4nraccMNdvX' },
                { name: 'Good as Hell', artist: 'Lizzo', spotify_id: '1xzBco0xcoJEDXktl7Jxrr' },
                { name: "Can't Stop the Feeling!", artist: 'Justin Timberlake', spotify_id: '20I6sIOMTCkB6w7ryavxtO' },
                { name: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', spotify_id: '32OlwWuMpZ6b0aN2RZOeMS' },
                { name: 'Walking on Sunshine', artist: 'Katrina and the Waves', spotify_id: '05wIrZSwuaVWhcv5FfqeH0' }
            ],
            sadness: [
                { name: 'Someone Like You', artist: 'Adele', spotify_id: '1zwMYTA5nlNjZxYrvBB2pV' },
                { name: 'Mad World', artist: 'Gary Jules', spotify_id: '3JOVTQ5h4yzbdlMlJwLVzq' },
                { name: 'Hurt', artist: 'Johnny Cash', spotify_id: '2WOJUzPbYna8GhNIyR3ICP' },
                { name: 'Black', artist: 'Pearl Jam', spotify_id: '1HNkqx9Abjoe0l6aFfONBp' },
                { name: 'Tears in Heaven', artist: 'Eric Clapton', spotify_id: '2L7ZS6A0obYzP5l5xXbYzN' }
            ]
        }
        
        const dominantEmotion = Object.keys(sentiment).reduce((a, b) => 
            sentiment[a] > sentiment[b] ? a : b
        )
        
        return mockSongs[dominantEmotion] || mockSongs.joy
    }
}

export default SpotifyService
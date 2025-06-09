import SpotifyService from '../src/services/SpotifyAPI.js'

describe('Spotify Service Tests', () => {
    let spotifyService
    
    beforeEach(() => {
        spotifyService = new SpotifyService()
    })
    
    test('should map joy to upbeat music attributes', () => {
        const joyfulSentiment = { joy: 0.9, sadness: 0.03, anger: 0.02, fear: 0.05 }
        const attributes = spotifyService.mapSentimentToMusic(joyfulSentiment)
        
        expect(attributes.valence).toBeGreaterThan(0.7)
        expect(attributes.energy).toBeGreaterThan(0.6)
        expect(attributes.genres).toContain('pop')
    })
    
    test('should map sadness to mellow music attributes', () => {
        const sadSentiment = { joy: 0.1, sadness: 0.8, anger: 0.05, fear: 0.05 }
        const attributes = spotifyService.mapSentimentToMusic(sadSentiment)
        
        expect(attributes.valence).toBeLessThan(0.4)
        expect(attributes.energy).toBeLessThan(0.5)
        expect(attributes.genres).toContain('indie')
    })
    
    test('should return mock recommendations when API fails', async () => {
        const sentiment = { joy: 0.8, sadness: 0.1, anger: 0.05, fear: 0.05 }
        const recommendations = spotifyService.getMockRecommendations(sentiment)
        
        expect(recommendations).toHaveLength(5)
        expect(recommendations[0]).toHaveProperty('name')
        expect(recommendations[0]).toHaveProperty('artist')
        expect(recommendations[0]).toHaveProperty('spotify_id')
    })
})

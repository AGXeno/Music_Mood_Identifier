import MusicRecommenderMQTT from '../src/mqtt/MQTTClient.js'

// Mock MQTT client for testing
class MockMQTTClient {
    constructor() {
        this.publishedMessages = []
        this.subscribedTopics = []
        this.connected = false
    }
    
    connect() {
        this.connected = true
        return this
    }
    
    publish(topic, message, options, callback) {
        this.publishedMessages.push({ topic, message, options })
        if (callback) callback(null)
    }
    
    subscribe(topic, callback) {
        this.subscribedTopics.push(topic)
        if (callback) callback(null)
    }
}

describe('MQTT Integration Tests', () => {
    let musicMQTT
    
    beforeEach(() => {
        musicMQTT = new MusicRecommenderMQTT({
            host: 'test-broker.com',
            port: 8083
        })
    })
    
    test('should generate unique user IDs', () => {
        const id1 = musicMQTT.generateUserId()
        const id2 = musicMQTT.generateUserId()
        
        expect(id1).not.toBe(id2)
        expect(id1).toContain('user_')
        expect(id2).toContain('user_')
    })
    
    test('should create correct topic structure', () => {
        expect(musicMQTT.topics.newSession).toContain('musicapp/sessions/')
        expect(musicMQTT.topics.historyRequest).toContain('musicapp/history/')
        expect(musicMQTT.topics.feedback).toContain('musicapp/feedback/')
    })
    
    test('should format session data correctly', async () => {
        // Mock the MQTT client
        musicMQTT.client = new MockMQTTClient()
        musicMQTT.isConnected = true
        
        const testSentiment = { joy: 0.8, sadness: 0.1, anger: 0.05, fear: 0.05 }
        const testSongs = [
            { name: 'Happy', artist: 'Pharrell Williams', spotify_id: '123' },
            { name: 'Good as Hell', artist: 'Lizzo', spotify_id: '456' }
        ]
        
        await musicMQTT.saveSession('Test input text', testSentiment, testSongs)
        
        expect(musicMQTT.client.publishedMessages).toHaveLength(1)
        
        const publishedData = JSON.parse(musicMQTT.client.publishedMessages[0].message)
        expect(publishedData.userInput).toBe('Test input text')
        expect(publishedData.sentiment).toEqual(testSentiment)
        expect(publishedData.topSongs).toEqual(testSongs)
    })
})
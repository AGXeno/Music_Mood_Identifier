import SentimentAnalyzer from '../src/services/SentimentAnalysis.js'

describe('Sentiment Analysis Tests', () => {
    let analyzer
    
    beforeEach(() => {
        analyzer = new SentimentAnalyzer()
    })
    
    test('should analyze positive text correctly', async () => {
        const positiveText = "I'm feeling so happy and excited today!"
        const result = await analyzer.analyzeSentiment(positiveText)
        
        expect(result.joy).toBeGreaterThan(0.5)
        expect(result.joy + result.sadness + result.anger + result.fear).toBeCloseTo(1, 1)
    })
    
    test('should analyze negative text correctly', async () => {
        const negativeText = "I'm feeling really sad and down today"
        const result = await analyzer.analyzeSentiment(negativeText)
        
        expect(result.sadness).toBeGreaterThan(0.4)
        expect(typeof result.joy).toBe('number')
        expect(typeof result.sadness).toBe('number')
        expect(typeof result.anger).toBe('number')
        expect(typeof result.fear).toBe('number')
    })
    
    test('should return normalized scores', async () => {
        const text = "Mixed emotions today"
        const result = await analyzer.analyzeSentiment(text)
        
        const sum = result.joy + result.sadness + result.anger + result.fear
        expect(sum).toBeCloseTo(1, 1) // Sum should be approximately 1
    })
})

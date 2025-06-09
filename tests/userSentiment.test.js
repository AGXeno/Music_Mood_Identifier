import SentimentAnalyzer from '../src/services/SentimentAnalysis';
import MusicRecommenderMQTT from '../src/mqtt/MQTTClient';
import testUsers from '../src/data/users';

describe('User Sentiment Analysis Tests', () => {
    let analyzer;
    let mqttClient;
    
    beforeEach(() => {
        analyzer = new SentimentAnalyzer();
        mqttClient = new MusicRecommenderMQTT({
            host: 'test-broker.com',
            port: 8083
        });
    });

    test('should adjust sentiment scores for Jim', async () => {
        const text = "Today was pretty good actually";
        const scores = await analyzer.analyzeSentiment(text, 'user_jim123');
        
        // Jim's scores should be slightly more melancholic
        expect(scores.sadness).toBeGreaterThan(0.2);
        expect(scores.joy + scores.sadness + scores.anger + scores.fear).toBeCloseTo(1, 2);
    });

    test('should adjust sentiment scores for Stephanie', async () => {
        const text = "Having an okay day";
        const scores = await analyzer.analyzeSentiment(text, 'user_steph456');
        
        // Stephanie's scores should boost joy
        expect(scores.joy).toBeGreaterThan(0.3);
        expect(scores.joy + scores.sadness + scores.anger + scores.fear).toBeCloseTo(1, 2);
    });

    test('should retrieve correct user history', () => {
        const jimHistory = analyzer.getUserHistory('user_jim123');
        const stephHistory = analyzer.getUserHistory('user_steph456');
        
        expect(jimHistory.length).toBeGreaterThan(0);
        expect(stephHistory.length).toBeGreaterThan(0);
        expect(jimHistory[0].preferredGenre).toBe('country');
        expect(stephHistory[0].preferredGenre).toBe('pop');
    });

    test('should login test users correctly', async () => {
        const jim = await mqttClient.loginTestUser('jim');
        expect(jim.id).toBe('user_jim123');
        expect(jim.preferredGenre).toBe('country');

        const stephanie = await mqttClient.loginTestUser('stephanie');
        expect(stephanie.id).toBe('user_steph456');
        expect(stephanie.preferredGenre).toBe('pop');
    });

    test('should handle multilingual input', async () => {
        const textSamples = [
            { text: "I'm so happy today!", expected: 'joy' },
            { text: "Estoy muy feliz hoy!", expected: 'joy' },
            { text: "Je suis très heureux aujourd'hui!", expected: 'joy' }
        ];

        for (const sample of textSamples) {
            const scores = await analyzer.analyzeSentiment(sample.text);
            const dominantEmotion = Object.entries(scores)
                .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            expect(dominantEmotion).toBe(sample.expected);
        }
    });
});

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import testUsers from '../data/users'

class SentimentAnalyzer {
    constructor() {
        this.model = null;
        this.encoder = null;
        this.isLoaded = false;
        this.toxicityThreshold = 0.9;
        this.users = testUsers;
        
        // Categories for multilingual support
        this.emotionCategories = {
            positive: {
                en: ['happy', 'excited', 'great', 'wonderful', 'awesome', 'excellent'],
                es: ['feliz', 'emocionado', 'genial', 'maravilloso', 'increíble', 'excelente'],
                fr: ['heureux', 'excité', 'grand', 'merveilleux', 'génial', 'excellent']
            },
            negative: {
                en: ['sad', 'depressed', 'unhappy', 'terrible', 'awful', 'miserable'],
                es: ['triste', 'deprimido', 'infeliz', 'terrible', 'horrible', 'miserable'],
                fr: ['triste', 'déprimé', 'malheureux', 'terrible', 'affreux', 'misérable']
            }
        };
    }

    async loadModel() {
        try {
            // Initialize TensorFlow.js
            await tf.ready();
            
            // For demo purposes, we'll use a simpler sentiment analysis approach
            // In production, you would load the actual models
            this.isLoaded = true;
            console.log('✅ TensorFlow.js initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize TensorFlow.js:', error);
            return false;
        }
    }

    async analyzeSentiment(text, userId = null) {
        if (!this.isLoaded) {
            await this.loadModel();
        }

        try {
            // Get sentiment scores
            const sentimentScores = await this.calculateSentimentScores(text);
            
            // If userId is provided and matches test users, adjust scores based on user history
            if (userId) {
                return this.adjustScoresForUser(sentimentScores, userId);
            }
            
            return sentimentScores;
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return this.basicSentimentAnalysis(text);
        }
    }

    adjustScoresForUser(scores, userId) {
        // Adjust scores based on user's historical preferences
        if (userId === 'user_jim123') {
            // Jim tends to be more melancholic, boost sadness slightly
            scores.sadness = Math.min(1, scores.sadness * 1.2);
        } else if (userId === 'user_steph456') {
            // Stephanie tends to be more energetic, boost joy
            scores.joy = Math.min(1, scores.joy * 1.2);
        }

        // Renormalize scores
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        Object.keys(scores).forEach(key => {
            scores[key] = parseFloat((scores[key] / total).toFixed(2));
        });

        return scores;
    }

    async calculateSentimentScores(text) {
        const lowerText = text.toLowerCase();
        let scores = {
            joy: 0.1,
            sadness: 0.1,
            anger: 0.1,
            fear: 0.1
        };

        // Basic sentiment analysis using keyword matching
        // In production, this would use the actual TensorFlow.js models
        
        // Check for positive emotions
        if (/(happy|joy|great|excited|wonderful|love|amazing)/i.test(lowerText)) {
            scores.joy += 0.4;
        }
        
        // Check for sadness
        if (/(sad|depressed|down|unhappy|miss|lonely)/i.test(lowerText)) {
            scores.sadness += 0.4;
        }
        
        // Check for anger
        if (/(angry|mad|furious|frustrated|annoyed)/i.test(lowerText)) {
            scores.anger += 0.4;
        }
        
        // Check for fear/anxiety
        if (/(scared|afraid|nervous|anxious|worried)/i.test(lowerText)) {
            scores.fear += 0.4;
        }

        // Normalize scores
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        Object.keys(scores).forEach(key => {
            scores[key] = parseFloat((scores[key] / total).toFixed(2));
        });

        return scores;
    }

    getUserHistory(userId) {
        // Return user history if user exists in test data
        const user = Object.values(this.users).find(u => u.id === userId);
        return user ? user.history : [];
    }

    getPreferredGenre(userId) {
        const user = Object.values(this.users).find(u => u.id === userId);
        return user ? user.history[0].preferredGenre : null;
    }
}

export default SentimentAnalyzer

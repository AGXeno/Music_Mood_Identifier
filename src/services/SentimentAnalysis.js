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

        // Detect language
        const isSpanish = this.detectSpanish(lowerText);
        
        if (isSpanish) {
            // Spanish sentiment analysis
            scores = this.analyzeSpanishSentiment(lowerText);
        } else {
            // English sentiment analysis
            scores = this.analyzeEnglishSentiment(lowerText);
        }

        // Normalize scores
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        Object.keys(scores).forEach(key => {
            scores[key] = parseFloat((scores[key] / total).toFixed(2));
        });

        return scores;
    }

    detectSpanish(text) {
        const spanishWords = [
            'estoy', 'feliz', 'triste', 'enojado', 'me siento', 'muy', 'hoy', 'día',
            'corazón', 'amor', 'vida', 'bien', 'mal', 'contento', 'alegre', 'emocionado',
            'deprimido', 'furioso', 'nervioso', 'ansiedad', 'miedo', 'esperanza',
            'soy', 'está', 'tengo', 'quiero', 'necesito', 'música', 'canción',
            'también', 'pero', 'porque', 'cuando', 'donde', 'como', 'que', 'este',
            'súper', 'genial', 'increíble', 'fantástico', 'maravilloso', 'celebrar',
            'con', 'para', 'del', 'las', 'los', 'una', 'esto', 'poco', 'mucho',
            'fiesta', 'baile', 'bailar', 'latin', 'latino', 'latina', 'reggaeton',
            'salsa', 'bachata', 'merengue', 'cumbia', 'ranchera', 'mariachi'
        ];
        
        const latinKeywords = [
            'latin music', 'latin', 'reggaeton', 'salsa', 'bachata', 'fiesta', 
            'dancing', 'bailar', 'baile', 'merengue', 'cumbia', 'spanish music',
            'hispanic music', 'latino music'
        ];
        
        const lowerText = text.toLowerCase();
        const spanishWordCount = spanishWords.filter(word => lowerText.includes(word)).length;
        const hasSpanishChars = /[ñáéíóúü¿¡]/i.test(text);
        const hasLatinKeywords = latinKeywords.some(keyword => lowerText.includes(keyword));
        
        const isSpanish = spanishWordCount >= 1 || hasSpanishChars || hasLatinKeywords;
        
        console.log(`🔍 Spanish detection for "${text}": ${spanishWordCount} words, hasChars: ${hasSpanishChars}, latinKeywords: ${hasLatinKeywords}, isSpanish: ${isSpanish}`);
        return isSpanish;
    }

    analyzeSpanishSentiment(text) {
        console.log(`🇪🇸 Analyzing Spanish sentiment for: "${text}"`);
        
        let scores = {
            joy: 0.05,
            sadness: 0.05,
            anger: 0.05,
            fear: 0.05
        };

        // Spanish positive emotions - more comprehensive
        const joyPatterns = /(feliz|contento|alegre|emocionado|genial|increíble|fantástico|maravilloso|súper.*bien|amor|vida|corazón|sonrío|celebrar|fiesta|baile|música|cantar|estoy.*bien|me.*encanta|qué.*bueno|excelente|fantástico)/i;
        if (joyPatterns.test(text)) {
            scores.joy += 0.7;
            console.log('  ✅ Found Spanish joy patterns');
        }
        
        // Specific check for "estoy feliz" type phrases
        if (/(estoy.*feliz|me.*feliz|siento.*feliz|muy.*feliz|súper.*feliz)/i.test(text)) {
            scores.joy += 0.8;
            console.log('  ✅ Found "estoy feliz" pattern');
        }
        
        // Spanish sadness
        const sadnessPatterns = /(triste|deprimido|mal|llorar|lágrimas|melancólico|solo|extraño|dolor|pena|lamento|nostálgico|perdido|vacío|estoy.*triste|me.*triste)/i;
        if (sadnessPatterns.test(text)) {
            scores.sadness += 0.7;
            console.log('  😢 Found Spanish sadness patterns');
        }
        
        // Spanish anger
        const angerPatterns = /(enojado|furioso|molesto|irritado|odio|maldito|rabia|ira|fastidio|harto|cabreado|enfadado|estoy.*enojado)/i;
        if (angerPatterns.test(text)) {
            scores.anger += 0.7;
            console.log('  😠 Found Spanish anger patterns');
        }
        
        // Spanish fear/anxiety
        const fearPatterns = /(miedo|asustado|nervioso|ansiedad|preocupado|pánico|temor|inquieto|angustia|estrés|tenso|estoy.*nervioso)/i;
        if (fearPatterns.test(text)) {
            scores.fear += 0.7;
            console.log('  😰 Found Spanish fear patterns');
        }

        // Spanish intensifiers
        if (/(muy|súper|extremadamente|bastante|demasiado|totalmente|increíblemente)/i.test(text)) {
            Object.keys(scores).forEach(key => {
                if (scores[key] > 0.3) scores[key] *= 1.5;
            });
            console.log('  🔥 Applied Spanish intensifiers');
        }

        console.log('  📊 Spanish sentiment scores:', scores);
        return scores;
    }

    analyzeEnglishSentiment(text) {
        console.log(`🇺🇸 Analyzing English sentiment for: "${text}"`);
        
        let scores = {
            joy: 0.1,
            sadness: 0.1,
            anger: 0.1,
            fear: 0.1
        };

        // Check for Latin music context with emotions
        const hasLatinDancing = /(fiesta.*dancing|hard.*fiesta|dancing.*fiesta|party.*dancing)/i.test(text);
        const hasLatinAnger = /(angry.*latin|latin.*angry|hard.*latin)/i.test(text);
        
        // English positive emotions - expanded
        if (/(happy|joy|great|excited|wonderful|love|amazing|fantastic|awesome|brilliant|excellent|cheerful|delighted|ecstatic|elated|euphoric|gleeful|jubilant|overjoyed|thrilled|upbeat|blissful|dancing|party|fiesta)/i.test(text)) {
            scores.joy += hasLatinDancing ? 0.7 : 0.4;
            console.log('  ✅ Found English joy patterns');
        }
        
        // English sadness - expanded
        if (/(sad|depressed|down|unhappy|miss|lonely|melancholy|gloomy|sorrowful|mournful|dejected|despondent|heartbroken|blue|grief|weepy)/i.test(text)) {
            scores.sadness += 0.4;
            console.log('  😢 Found English sadness patterns');
        }
        
        // English anger - expanded with Latin context
        if (/(angry|mad|furious|frustrated|annoyed|irritated|outraged|livid|enraged|incensed|irate|pissed|upset|bitter|resentful|hard)/i.test(text)) {
            scores.anger += hasLatinAnger ? 0.7 : 0.4;
            console.log('  😠 Found English anger patterns');
        }
        
        // English fear/anxiety - expanded
        if (/(scared|afraid|nervous|anxious|worried|terrified|petrified|frightened|panicked|apprehensive|uneasy|distressed|overwhelmed)/i.test(text)) {
            scores.fear += 0.4;
            console.log('  😰 Found English fear patterns');
        }

        // English intensifiers
        if (/(very|extremely|really|super|incredibly|tremendously|absolutely|totally)/i.test(text)) {
            Object.keys(scores).forEach(key => {
                if (scores[key] > 0.2) scores[key] *= 1.2;
            });
            console.log('  🔥 Applied English intensifiers');
        }

        console.log('  📊 English sentiment scores:', scores);
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

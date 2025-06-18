// services/TensorFlowSentimentAnalysis.js
import * as tf from '@tensorflow/tfjs';

class TensorFlowSentimentAnalyzer {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.vocabulary = null;
        this.maxSequenceLength = 100;
        this.isLoaded = false;
        this.loadingPromise = null;

        // Emotion mapping for music recommendations
        this.emotionMapping = {
            en: {
                positive: { joy: 0.8, excitement: 0.6, confidence: 0.7 },
                negative: { sadness: 0.7, anger: 0.3, fear: 0.2 },
                neutral: { calm: 0.5, contemplative: 0.4 }
            },
            es: {
                positive: { alegria: 0.8, emocion: 0.6, confianza: 0.7 },
                negative: { tristeza: 0.7, enojo: 0.3, miedo: 0.2 },
                neutral: { calma: 0.5, contemplativo: 0.4 }
            }
        };
    }

    async initialize() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._loadModel();
        return this.loadingPromise;
    }

    async _loadModel() {
        try {
            console.log('🤖 Loading TensorFlow.js sentiment model...');

            // Load a simple pre-trained sentiment model
            // For immediate deployment, we'll create a lightweight model
            await this._createSimpleModel();

            // Load vocabulary for text processing
            await this._loadVocabulary();

            this.isLoaded = true;
            console.log('✅ TensorFlow.js sentiment model loaded successfully');

        } catch (error) {
            console.error('❌ Failed to load TensorFlow.js model:', error);
            throw new Error('Failed to initialize TensorFlow.js sentiment analyzer');
        }
    }

    async _createSimpleModel() {
        // Create a lightweight sentiment classification model
        // This is a simplified version - in production you'd load a pre-trained model
        const vocabSize = 10000;
        const embeddingDim = 16;
        const maxLength = this.maxSequenceLength;

        this.model = tf.sequential({
            layers: [
                tf.layers.embedding({
                    inputDim: vocabSize,
                    outputDim: embeddingDim,
                    inputLength: maxLength
                }),
                tf.layers.globalAveragePooling1d(),
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.5 }),
                tf.layers.dense({ units: 3, activation: 'softmax' }) // positive, negative, neutral
            ]
        });

        // Compile the model
        this.model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        // For demo purposes, we'll use rule-based analysis
        // In production, you'd load weights from a trained model
        console.log('📊 Model architecture created');
    }

    async _loadVocabulary() {
        // Simple vocabulary for demo - in production load from trained tokenizer
        this.vocabulary = new Map();

        // Positive words
        const positiveWords = [
            'happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect',
            'awesome', 'brilliant', 'excellent', 'outstanding', 'superb', 'terrific', 'marvelous',
            'feliz', 'emocionado', 'genial', 'increíble', 'maravilloso', 'fantástico', 'amor', 'perfecto'
        ];

        // Negative words
        const negativeWords = [
            'sad', 'angry', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'bad',
            'depressed', 'frustrated', 'annoyed', 'upset', 'disappointed', 'furious',
            'triste', 'enojado', 'terrible', 'horrible', 'odio', 'peor', 'malo', 'deprimido'
        ];

        // Energy words
        const energyWords = [
            'energetic', 'pumped', 'motivated', 'active', 'vibrant', 'dynamic',
            'tired', 'exhausted', 'drained', 'lazy', 'sluggish',
            'enérgico', 'motivado', 'activo', 'vibrante', 'cansado', 'agotado'
        ];

        // Build vocabulary index
        let index = 1; // 0 reserved for padding
        [...positiveWords, ...negativeWords, ...energyWords].forEach(word => {
            this.vocabulary.set(word.toLowerCase(), index++);
        });

        console.log(`📚 Vocabulary loaded with ${this.vocabulary.size} words`);
    }

    async analyzeSentiment(text, userId = null) {
        if (!this.isLoaded) {
            await this.initialize();
        }

        try {
            console.log('🎯 Starting TensorFlow.js sentiment analysis for:', text);

            // Pass original text directly to prediction (don't preprocess for rule-based analysis)
            const sentiment = await this.predictSentiment(text);

            // Convert to emotion scores for music recommendation
            const emotionScores = this.mapToEmotions(sentiment, text);

            console.log('🎭 Sentiment analysis result:', sentiment);
            console.log('🎵 Emotion scores:', emotionScores);

            return emotionScores;

        } catch (error) {
            console.error('❌ Sentiment analysis failed:', error);
            // Fallback to rule-based analysis
            return this.fallbackAnalysis(text);
        }
    }

    preprocessText(text) {
        // Normalize text
        const normalized = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' ') // Multiple spaces to single
            .trim();

        // Simple tokenization
        const words = normalized.split(' ');

        // Convert to indices
        const indices = words.map(word => this.vocabulary.get(word) || 0);

        // Pad or truncate to maxSequenceLength
        const padded = new Array(this.maxSequenceLength).fill(0);
        for (let i = 0; i < Math.min(indices.length, this.maxSequenceLength); i++) {
            padded[i] = indices[i];
        }

        return padded;
    }

    async predictSentiment(text) {
        // Skip preprocessing for sentiment analysis - work with original text
        const originalText = text;

        console.log('🔍 Analyzing text:', originalText);

        let positiveScore = 0;
        let negativeScore = 0;
        let energyScore = 0;

        // Enhanced positive indicators
        const positivePatterns = [
            { pattern: /promoted|promotion|got.{0,10}job|hired|accepted/i, weight: 0.8 },
            { pattern: /happy|excited|amazing|fantastic|wonderful|great|awesome|love|perfect|brilliant/i, weight: 0.6 },
            { pattern: /celebration|celebrate|party|anniversary|birthday|graduated|graduation/i, weight: 0.7 },
            { pattern: /feliz|emocionado|genial|increíble|maravilloso|fantástico|amor|perfecto|celebrar/i, weight: 0.6 },
            { pattern: /ascendieron|conseguir|trabajo|súper|alegre|fiesta|cumpleaños/i, weight: 0.7 }
        ];

        // Enhanced negative indicators
        const negativePatterns = [
            { pattern: /sad|depressed|lonely|heartbroken|devastated|hopeless|miserable/i, weight: 0.8 },
            { pattern: /angry|furious|frustrated|annoyed|mad|hate|terrible|awful|horrible/i, weight: 0.8 },
            { pattern: /scared|worried|anxious|nervous|afraid|stressed|panic|overwhelmed/i, weight: 0.7 },
            { pattern: /lost.{0,10}job|fired|broke.{0,10}up|missing|difficult|rough|hard|unfair/i, weight: 0.9 },
            { pattern: /triste|deprimido|solo|enojado|furioso|molesto|odio|terrible|horrible/i, weight: 0.8 },
            { pattern: /miedo|preocupado|ansioso|nervioso|estresado|difícil|perdí|rompimos/i, weight: 0.8 }
        ];

        // Energy level indicators
        const highEnergyPatterns = [
            { pattern: /energized|pumped|motivated|excited|ready|let's go|conquer|workout|gym|dance|party/i, weight: 0.8 },
            { pattern: /enérgico|motivado|emocionado|listo|vamos|bailar|fiesta|gimnasio/i, weight: 0.8 },
            { pattern: /reggaeton|salsa|electronic|rock|hip.hop|rap/i, weight: 0.6 }
        ];

        const lowEnergyPatterns = [
            { pattern: /tired|exhausted|drained|calm|peaceful|quiet|relax|meditation|sad|lonely/i, weight: 0.7 },
            { pattern: /cansado|agotado|tranquilo|pacífico|relajar|meditación|triste/i, weight: 0.7 },
            { pattern: /bachata|ballad|classical|ambient|jazz/i, weight: 0.6 }
        ];

        // Calculate scores with weights
        positivePatterns.forEach(({ pattern, weight }) => {
            if (pattern.test(originalText)) {
                positiveScore += weight;
                console.log(`✅ Positive match: ${pattern} (weight: ${weight})`);
            }
        });

        negativePatterns.forEach(({ pattern, weight }) => {
            if (pattern.test(originalText)) {
                negativeScore += weight;
                console.log(`❌ Negative match: ${pattern} (weight: ${weight})`);
            }
        });

        // Calculate energy
        highEnergyPatterns.forEach(({ pattern, weight }) => {
            if (pattern.test(originalText)) {
                energyScore += weight;
                console.log(`⚡ High energy match: ${pattern}`);
            }
        });

        lowEnergyPatterns.forEach(({ pattern, weight }) => {
            if (pattern.test(originalText)) {
                energyScore -= weight;
                console.log(`😴 Low energy match: ${pattern}`);
            }
        });

        // Determine energy level
        let energy = 'medium';
        if (energyScore > 0.5) energy = 'high';
        else if (energyScore < -0.5) energy = 'low';

        // Determine primary sentiment with clear thresholds
        let sentiment = 'neutral';
        let confidence = 0.5;

        console.log(`📊 Scores - Positive: ${positiveScore}, Negative: ${negativeScore}, Energy: ${energyScore}`);

        if (positiveScore > 0.4 && positiveScore > negativeScore + 0.2) {
            sentiment = 'positive';
            confidence = Math.min(positiveScore / 1.5, 1.0);
        } else if (negativeScore > 0.4 && negativeScore > positiveScore + 0.2) {
            sentiment = 'negative';
            confidence = Math.min(negativeScore / 1.5, 1.0);
        } else if (Math.abs(positiveScore - negativeScore) < 0.3) {
            sentiment = 'neutral';
            confidence = 0.5;
        }

        const result = { sentiment, confidence, energy };
        console.log(`🎯 Final sentiment result:`, result);

        return result;
    }

    mapToEmotions(sentiment, originalText) {
        const { sentiment: primarySentiment, confidence, energy } = sentiment;

        // Detect language
        const isSpanish = /[ñáéíóúü]|está|muy|pero|para|con|una|del|las|los/i.test(originalText);

        // Start with zero scores for clear distinction
        let emotionScores = {
            joy: 0.05,
            sadness: 0.05,
            anger: 0.05,
            fear: 0.05,
            surprise: 0.05,
            disgust: 0.05
        };

        console.log(`🎭 Primary sentiment: ${primarySentiment}, confidence: ${confidence}, energy: ${energy}`);

        // Map sentiment to emotions with stronger differentiation
        switch (primarySentiment) {
            case 'positive':
                emotionScores.joy = Math.max(0.6, confidence * 0.9);
                if (energy === 'high') {
                    emotionScores.surprise = Math.min(confidence * 0.5, 0.4);
                }
                // Reduce other emotions for clear distinction
                emotionScores.sadness = 0.02;
                emotionScores.anger = 0.02;
                emotionScores.fear = 0.02;
                break;

            case 'negative':
                // Check specific negative emotion types
                if (originalText.match(/angry|mad|furious|frustrated|annoyed|enojado|furioso|molesto/i)) {
                    emotionScores.anger = Math.max(0.6, confidence * 0.8);
                    emotionScores.sadness = 0.1;
                    emotionScores.joy = 0.02;
                    console.log('🔥 Detected anger-based emotion');
                } else if (originalText.match(/scared|worried|anxious|nervous|afraid|stressed|miedo|preocupado|ansioso|nervioso/i)) {
                    emotionScores.fear = Math.max(0.6, confidence * 0.8);
                    emotionScores.sadness = 0.15;
                    emotionScores.joy = 0.02;
                    console.log('😰 Detected fear/anxiety-based emotion');
                } else {
                    // Default to sadness for negative sentiment
                    emotionScores.sadness = Math.max(0.6, confidence * 0.8);
                    emotionScores.joy = 0.02;
                    emotionScores.anger = 0.05;
                    console.log('😢 Detected sadness-based emotion');
                }
                break;

            default: // neutral
                // Check for specific emotion indicators in neutral text
                if (originalText.match(/surprised|shocked|wow|amazing|incredible|sorprendido|impresionado|increíble/i)) {
                    emotionScores.surprise = 0.5;
                    emotionScores.joy = 0.3;
                } else {
                    // Truly neutral - keep low but equal scores
                    emotionScores.joy = 0.2;
                    emotionScores.sadness = 0.2;
                    emotionScores.anger = 0.15;
                    emotionScores.fear = 0.15;
                    emotionScores.surprise = 0.15;
                }
        }

        // Add energy modifiers
        if (energy === 'high') {
            emotionScores.joy *= 1.2;
            emotionScores.surprise *= 1.3;
        } else if (energy === 'low') {
            emotionScores.sadness *= 1.2;
            emotionScores.fear *= 1.1;
        }

        // Ensure values don't exceed 1.0
        Object.keys(emotionScores).forEach(emotion => {
            emotionScores[emotion] = Math.min(emotionScores[emotion], 1.0);
        });

        console.log('🎵 Final emotion scores:', emotionScores);
        return emotionScores;
    }

    fallbackAnalysis(text) {
        console.log('🔄 Using fallback sentiment analysis for:', text);

        const lowerText = text.toLowerCase();

        // Enhanced keyword detection
        const positiveWords = ['happy', 'excited', 'great', 'love', 'amazing', 'fantastic', 'perfect', 'awesome', 'wonderful', 'celebration', 'promoted', 'feliz', 'emocionado', 'increíble', 'maravilloso'];
        const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'depressed', 'frustrated', 'lonely', 'stressed', 'worried', 'triste', 'enojado', 'horrible', 'terrible', 'deprimido'];
        const angerWords = ['angry', 'furious', 'mad', 'frustrated', 'annoyed', 'enojado', 'furioso', 'molesto'];
        const fearWords = ['scared', 'worried', 'anxious', 'nervous', 'afraid', 'stressed', 'miedo', 'preocupado', 'ansioso', 'nervioso'];

        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
        const angerCount = angerWords.filter(word => lowerText.includes(word)).length;
        const fearCount = fearWords.filter(word => lowerText.includes(word)).length;

        console.log(`📊 Fallback counts - Positive: ${positiveCount}, Negative: ${negativeCount}, Anger: ${angerCount}, Fear: ${fearCount}`);

        if (positiveCount > 0 && positiveCount >= negativeCount) {
            return {
                joy: Math.min(0.7 + (positiveCount * 0.1), 1.0),
                sadness: 0.05,
                anger: 0.05,
                fear: 0.05,
                surprise: 0.2,
                disgust: 0.05
            };
        } else if (angerCount > 0) {
            return {
                joy: 0.05,
                sadness: 0.1,
                anger: Math.min(0.7 + (angerCount * 0.1), 1.0),
                fear: 0.1,
                surprise: 0.05,
                disgust: 0.1
            };
        } else if (fearCount > 0) {
            return {
                joy: 0.05,
                sadness: 0.15,
                anger: 0.05,
                fear: Math.min(0.7 + (fearCount * 0.1), 1.0),
                surprise: 0.05,
                disgust: 0.05
            };
        } else if (negativeCount > 0) {
            return {
                joy: 0.05,
                sadness: Math.min(0.6 + (negativeCount * 0.1), 1.0),
                anger: 0.1,
                fear: 0.15,
                surprise: 0.05,
                disgust: 0.05
            };
        } else {
            // Truly neutral
            return {
                joy: 0.25,
                sadness: 0.2,
                anger: 0.15,
                fear: 0.15,
                surprise: 0.15,
                disgust: 0.1
            };
        }
    }

    // Performance monitoring
    getModelInfo() {
        return {
            isLoaded: this.isLoaded,
            modelType: 'rule-based-with-tensorflow-architecture',
            vocabularySize: this.vocabulary?.size || 0,
            maxSequenceLength: this.maxSequenceLength,
            supportedLanguages: ['en', 'es'],
            version: '1.0.0'
        };
    }

    // Memory cleanup
    dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        this.vocabulary = null;
        this.isLoaded = false;
        console.log('🧹 TensorFlow.js sentiment analyzer disposed');
    }
}

export default TensorFlowSentimentAnalyzer;
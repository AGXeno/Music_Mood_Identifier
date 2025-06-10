const mqtt = window.mqtt;

class MusicRecommenderMQTT {
    constructor(brokerConfig) {        // MQTTx connection configuration
        this.brokerConfig = {
            ...brokerConfig,  // Spread the incoming config
            protocol: 'ws',   // Always use WebSocket for browser
            clientId: `music_app_${Math.random().toString(16).substr(2, 8)}`,
            clean: true,
            keepalive: 60
        }
        
        this.client = null
        this.userId = this.generateUserId()
        this.isConnected = false
        this.messageHandlers = new Map()
        
        // Topic structure for your app
        this.topics = {
            newSession: `musicapp/sessions/${this.userId}/new`,
            endSession: `musicapp/sessions/${this.userId}/end`,
            historyRequest: `musicapp/history/${this.userId}/request`, 
            historyResponse: `musicapp/history/${this.userId}/response`,
            feedback: `musicapp/feedback/${this.userId}/rating`,
            feedbackConfirm: `musicapp/feedback/${this.userId}/confirm`,
            login: `musicapp/users/${this.userId}/login`,
            logout: `musicapp/users/${this.userId}/logout`,
            status: 'musicapp/system/status',
            errors: 'musicapp/system/errors'
        }

        // System-wide topics that don't need user ID
        this.systemTopics = {
            status: 'musicapp/system/status',
            errors: 'musicapp/system/errors'
        }
        
        // Initialize with test users
        this.testUsers = {
            jim: {
                id: 'user_jim123',
                name: 'Jim',
                preferredGenre: 'country'
            },
            stephanie: {
                id: 'user_steph456',
                name: 'Stephanie',
                preferredGenre: 'pop'
            }
        };
    }
    
    // Initialize MQTT connection    
    async connect() {
        return new Promise((resolve, reject) => {
            try {                // Create connection string for WebSocket
                const connectUrl = `${this.brokerConfig.protocol}://${this.brokerConfig.host}:${this.brokerConfig.port}/mqtt`
                
                // Use mqtt.js library (works with MQTTx broker)
                this.client = mqtt.connect(connectUrl, {
                    clientId: this.brokerConfig.clientId,
                    username: this.brokerConfig.username,
                    password: this.brokerConfig.password,
                    keepalive: this.brokerConfig.keepalive,
                    clean: this.brokerConfig.clean,
                    reconnectPeriod: 1000,
                    connectTimeout: 30000
                })
                
                this.client.on('connect', () => {
                    console.log('✅ Connected to MQTTx broker:', this.brokerConfig.host)
                    this.isConnected = true
                    this.setupSubscriptions()
                    resolve(true)
                })
                
                this.client.on('error', (error) => {
                    console.error('❌ MQTT connection error:', error)
                    this.isConnected = false
                    reject(error)
                })
                
                this.client.on('message', (topic, message) => {
                    this.handleIncomingMessage(topic, message)
                })
                
                this.client.on('disconnect', () => {
                    console.log('🔌 Disconnected from MQTTx broker')
                    this.isConnected = false
                })
                
            } catch (error) {
                reject(error)
            }
        })
    }
      // Set up subscriptions for receiving data
    setupSubscriptions() {
        // User-specific topics
        const userTopics = [
            this.topics.historyResponse,           // History responses
            this.topics.newSession,                // New sessions
            this.topics.endSession,                // Session end events
            this.topics.feedbackConfirm,           // Feedback confirmations
            `musicapp/users/${this.userId}/+`,     // All user events
            `musicapp/sessions/${this.userId}/+`,  // All session events
            `musicapp/history/${this.userId}/+`,   // All history events
            `musicapp/feedback/${this.userId}/+`   // All feedback events
        ];

        // System-wide topics
        const systemTopics = [
            this.systemTopics.status,              // System status
            this.systemTopics.errors               // System errors
        ];

        // Subscribe to all topics
        [...userTopics, ...systemTopics].forEach(topic => {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Failed to subscribe to ${topic}:`, err);
                    // Publish error to system error topic
                    this.publishSystemError('subscription_failed', { topic, error: err.message });
                } else {
                    console.log(`📥 Subscribed to ${topic}`);
                }
            });
        });
    }
      // Login as a test user
    async loginTestUser(username) {
        const user = this.testUsers[username.toLowerCase()];
        if (user) {
            this.userId = user.id;
            
            // Update topics with new user ID
            this.topics = {
                newSession: `musicapp/sessions/${this.userId}/new`,
                endSession: `musicapp/sessions/${this.userId}/end`,
                historyRequest: `musicapp/history/${this.userId}/request`, 
                historyResponse: `musicapp/history/${this.userId}/response`,
                feedback: `musicapp/feedback/${this.userId}/rating`,
                feedbackConfirm: `musicapp/feedback/${this.userId}/confirm`,
                login: `musicapp/users/${this.userId}/login`,
                logout: `musicapp/users/${this.userId}/logout`,
                status: 'musicapp/system/status',
                errors: 'musicapp/system/errors'
            };
            
            // Set up subscriptions for the new user
            this.setupSubscriptions();
            
            // Publish login event
            if (this.isConnected) {
                await this.client.publish(
                    `musicapp/users/${this.userId}/login`,
                    JSON.stringify({
                        userId: user.id,
                        name: user.name,
                        timestamp: new Date().toISOString(),
                        preferredGenre: user.preferredGenre
                    }),
                    { qos: 1 }
                );
            }
            
            console.log(`Logged in as test user: ${user.name}`);
            return user;
        }
        return null;
    }

    // Login method for MQTT user authentication
    async login(username) {
        if (!this.isConnected) {
            await this.connect();
        }

        const user = this.testUsers[username.toLowerCase()];
        if (!user) {
            throw new Error('Invalid test user');
        }

        this.userId = user.id;
        
        // Update topics for the new user
        this.topics = {
            newSession: `musicapp/sessions/${this.userId}/new`,
            endSession: `musicapp/sessions/${this.userId}/end`,
            historyRequest: `musicapp/history/${this.userId}/request`,
            historyResponse: `musicapp/history/${this.userId}/response`,
            feedback: `musicapp/feedback/${this.userId}/rating`,
            feedbackConfirm: `musicapp/feedback/${this.userId}/confirm`,
            login: `musicapp/users/${this.userId}/login`,
            logout: `musicapp/users/${this.userId}/logout`,
            status: 'musicapp/system/status',
            errors: 'musicapp/system/errors'
        };

        // Subscribe to user-specific topics
        await this.setupSubscriptions();

        // Publish login event
        this.client.publish(this.topics.login, JSON.stringify({
            userId: this.userId,
            name: user.name,
            timestamp: new Date().toISOString(),
            event: 'login'
        }));

        return user;
    }

    // Logout method for MQTT user authentication
    async logout() {
        if (this.isConnected && this.userId) {
            // Publish logout event
            this.client.publish(this.topics.logout, JSON.stringify({
                userId: this.userId,
                timestamp: new Date().toISOString(),
                event: 'logout'
            }));

            // Unsubscribe from all topics
            Object.values(this.topics).forEach(topic => {
                this.client.unsubscribe(topic);
            });

            // Disconnect from broker
            this.client.end();
            this.isConnected = false;
            this.userId = null;
        }
    }

    // Save new session data to MQTT
    async saveSession(userInput, sentimentScores, spotifySongs) {
        if (!this.isConnected) {
            throw new Error('Not connected to MQTT broker')
        }

        // Get user preferences if it's a test user
        let userPreferences = null;
        if (this.userId === 'user_jim123') {
            userPreferences = { preferredGenre: 'country' };
        } else if (this.userId === 'user_steph456') {
            userPreferences = { preferredGenre: 'pop' };
        }

        const sessionData = {
            sessionId: `sess_${Date.now()}`,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            userInput: userInput,
            sentiment: sentimentScores,
            topSongs: spotifySongs.slice(0, 5),
            userPreferences: userPreferences
        }
        
        return new Promise((resolve, reject) => {
            this.client.publish(
                this.topics.newSession,
                JSON.stringify(sessionData),
                { qos: 1, retain: false },
                (error) => {
                    if (error) {
                        console.error('Failed to save session:', error)
                        reject(error)
                    } else {
                        console.log('💾 Session saved to MQTT:', sessionData.sessionId)
                        resolve(sessionData.sessionId)
                    }
                }
            )
        })
    }
    
    // Request user history
    async requestHistory() {
        if (!this.isConnected) {
            throw new Error('Not connected to MQTT broker')
        }
        
        const requestData = {
            userId: this.userId,
            requestTime: new Date().toISOString()
        }
        
        return new Promise((resolve, reject) => {
            // Set up one-time handler for history response
            const timeoutId = setTimeout(() => {
                reject(new Error('History request timeout'))
            }, 10000) // 10 second timeout
            
            this.messageHandlers.set('history', (data) => {
                clearTimeout(timeoutId)
                resolve(data)
            })
            
            this.client.publish(
                this.topics.historyRequest,
                JSON.stringify(requestData),
                { qos: 1 },
                (error) => {
                    if (error) {
                        clearTimeout(timeoutId)
                        reject(error)
                    }
                }
            )
        })
    }
    
    // Save user feedback (for extra credit)
    async saveFeedback(sessionId, rating, likedSongs, comments = '') {
        if (!this.isConnected) {
            throw new Error('Not connected to MQTT broker')
        }
        
        const feedbackData = {
            sessionId: sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            rating: rating,
            likedSongs: likedSongs,
            comments: comments
        }
        
        return new Promise((resolve, reject) => {
            this.client.publish(
                this.topics.feedback,
                JSON.stringify(feedbackData),
                { qos: 1 },
                (error) => {
                    if (error) {
                        reject(error)
                    } else {
                        console.log('👍 Feedback saved:', sessionId)
                        resolve(true)
                    }
                }
            )
        })
    }
    
    // Publish system status update
    publishSystemStatus(status) {
        if (this.isConnected) {
            this.client.publish(
                this.systemTopics.status,
                JSON.stringify({
                    status,
                    timestamp: new Date().toISOString(),
                    clientId: this.brokerConfig.clientId
                }),
                { qos: 1 }
            );
        }
    }

    // Publish system error
    publishSystemError(errorType, errorDetails) {
        if (this.isConnected) {
            this.client.publish(
                this.systemTopics.errors,
                JSON.stringify({
                    type: errorType,
                    details: errorDetails,
                    timestamp: new Date().toISOString(),
                    clientId: this.brokerConfig.clientId,
                    userId: this.userId
                }),
                { qos: 1 }
            );
        }
    }

    // Handle incoming MQTT messages
    handleIncomingMessage(topic, message) {
        try {
            const data = JSON.parse(message.toString())
            
            if (topic === this.topics.historyResponse) {
                const handler = this.messageHandlers.get('history')
                if (handler) {
                    handler(data)
                    this.messageHandlers.delete('history')
                }
            }
            
            // Add more message handlers as needed
            
        } catch (error) {
            console.error('Error parsing MQTT message:', error)
        }
    }
    
    // Generate unique user ID
    generateUserId() {
        return `user_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Disconnect from broker
    disconnect() {
        if (this.client) {
            this.client.end()
            this.isConnected = false
            console.log('🔌 Disconnected from MQTT broker')
        }
    }
    
    // Test connection (useful for debugging)
    async testConnection() {
        try {
            await this.connect()
            
            // Test publish
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Connection test successful'
            }
            
            this.client.publish(
                `musicapp/test/${this.userId}`,
                JSON.stringify(testData),
                { qos: 1 },
                (error) => {
                    if (error) {
                        console.error('❌ Test publish failed:', error)
                    } else {
                        console.log('✅ Test publish successful')
                    }
                }
            )
            
            return true
        } catch (error) {
            console.error('❌ Connection test failed:', error)
            return false
        }
    }
    
}

// Export for use in other files
export default MusicRecommenderMQTT
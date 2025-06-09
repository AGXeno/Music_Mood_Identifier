// MQTT Connection Test Script
import MusicRecommenderMQTT from '../mqtt/MQTTClient';
import mqttConfig from '../config/mqttConfig';

async function testMQTTConnection() {
    console.log('🔌 Testing MQTT Connection...');
    
    try {
        // Create MQTT client
        const mqttClient = new MusicRecommenderMQTT(mqttConfig);
        
        // Try to connect
        await mqttClient.connect();
        
        // If connected, try to publish a test message
        if (mqttClient.isConnected) {
            console.log('✅ Successfully connected to MQTT broker');
            
            // Test publish
            const testMessage = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Test message from MoodTunes'
            };
            
            await mqttClient.client.publish(
                'musicapp/test',
                JSON.stringify(testMessage),
                { qos: 1 }
            );
            
            console.log('📤 Test message published');
            
            // Wait a bit and disconnect
            setTimeout(() => {
                mqttClient.disconnect();
                console.log('🔌 Test complete - Disconnected from broker');
            }, 2000);
            
        } else {
            console.error('❌ Failed to connect to MQTT broker');
        }
        
    } catch (error) {
        console.error('❌ Error during MQTT test:', error);
    }
}

// Run the test
testMQTTConnection();

export default testMQTTConnection;

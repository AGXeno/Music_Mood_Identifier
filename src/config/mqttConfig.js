const mqttConfig = {
    host: 'broker.hivemq.com',     // HiveMQ's public broker
    port: 8000,                    // WebSocket port
    protocol: 'ws',                // Using WebSocket protocol
    path: '/mqtt',                 // Required for HiveMQ WebSocket
    clientId: 'moodtunes_' + Math.random().toString(16).substr(2, 8),
    clean: true,
    connectTimeout: 4000,          // Reduced timeout
    reconnectPeriod: 1000,
    keepalive: 60,
    hostname: 'broker.hivemq.com'  // Explicitly set hostname
}

export default mqttConfig
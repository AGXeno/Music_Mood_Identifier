const mqttConfig = {
    host: 'broker.hivemq.com',     // HiveMQ's public broker
    port: 8884,                    // Secure WebSocket port
    protocol: 'wss',               // Using secure WebSocket protocol
    path: '/mqtt',                 // Required for HiveMQ WebSocket
    clientId: 'moodtunes_' + Math.random().toString(16).substr(2, 8),
    clean: true,
    connectTimeout: 4000,          // Reduced timeout
    reconnectPeriod: 1000,
    keepalive: 60,
    hostname: 'broker.hivemq.com'  // Explicitly set hostname
}

export default mqttConfig
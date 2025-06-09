# MQTT Setup Guide

## What is MQTT?

MQTT (Message Queuing Telemetry Transport) is a lightweight messaging protocol that works on a publish/subscribe model. Think of it like a radio station:

- Publishers are like radio stations broadcasting on specific channels (topics)
- Subscribers are like radio receivers tuned to specific channels
- The MQTT broker is like the air that carries the radio waves

## Setting up MQTTX for Development

1. **Install MQTTX**

   - Download MQTTX from https://mqttx.app/
   - Install it on your computer
   - Launch MQTTX

2. **Configure MQTTX Connection**
   In MQTTX, create a new connection with these settings:

   ```
   Name: MoodTunes-Dev
   Host: broker.hivemq.com
   Port: 8000
   Protocol: ws (WebSocket)
   Path: /mqtt
   Client ID: moodtunes_test (or any unique identifier)
   ```

3. **Test Topics to Subscribe**
   Subscribe to these topics in MQTTX to see the data flow:

   ```
   musicapp/sessions/+/new         # New session data
   musicapp/history/+/request      # History requests
   musicapp/history/+/response     # History responses
   musicapp/feedback/+/rating      # User feedback
   ```

   (The '+' is a wildcard that matches any user ID)

4. **Sample Data Structure**
   When the app sends data, you'll see JSON messages like this:
   ```json
   // For a new session:
   {
     "sessionId": "sess_1234567890",
     "userId": "user_jim123",
     "timestamp": "2025-06-08T10:30:00Z",
     "userInput": "Feeling pretty good today!",
     "sentiment": {
       "joy": 0.7,
       "sadness": 0.1,
       "anger": 0.1,
       "fear": 0.1
     },
     "topSongs": [
       {
         "name": "Life is a Highway",
         "artist": "Rascal Flatts",
         "genre": "country"
       }
     ]
   }
   ```

## Testing the Connection

1. Open MQTTX and connect to the broker
2. Subscribe to `musicapp/sessions/+/new`
3. Start your React application (`npm start`)
4. Log in as "jim" or "stephanie"
5. Enter some text and submit
6. You should see the message appear in MQTTX

## Troubleshooting

1. **No Connection**

   - Check if the broker is reachable: Try pinging broker.hivemq.com
   - Verify your internet connection
   - Make sure port 8000 isn't blocked by your firewall

2. **No Messages**

   - Verify you're subscribed to the correct topics
   - Check the browser console for MQTT-related errors
   - Make sure the client IDs are unique

3. **Common Issues**
   - WebSocket connection failed: Check if the protocol is set to 'ws'
   - Messages not appearing: Verify the topic patterns match exactly
   - Connection drops: Check your internet stability

## Data Persistence

Note: The public HiveMQ broker doesn't persist data. For development:

- Messages are temporary and will be lost on broker restart
- Test user data (Jim and Stephanie) is stored locally
- For production, you would need a dedicated MQTT broker with persistence

## Security Note

The current setup uses a public broker for development. In production:

- Use a secure, dedicated MQTT broker
- Enable SSL/TLS (WSS protocol)
- Implement proper authentication
- Set up access control rules

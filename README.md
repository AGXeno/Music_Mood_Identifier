MoodTunes

# 🎵 Sentiment-Based Music Recommender

AI-powered web application that analyzes your mood and recommends music using TensorFlow.js and MQTT data persistence. The application uses sentiment analysis to understand your emotional state and provides personalized music recommendations.

## ✨ Features

- 🤖 Real-time sentiment analysis using TensorFlow.js
- 🌐 Multilingual support for emotion detection
- 🎯 Personalized music recommendations based on mood
- 💾 User history tracking via MQTT
- 🔄 Automatic genre preference learning
- 📊 Emotional pattern visualization
- 💡 Smart recommendations that adapt to your taste

## 🎮 How to Use

1. **Login**: You can either:

   - Create a new account
   - Use test accounts for demonstration:
     - Username: "jim" (prefers country music, tends toward melancholic)
     - Username: "stephanie" (prefers pop music, typically energetic)

2. **Express Your Mood**:

   - Write about your current feelings in the text input
   - Support for English, Spanish, and French
   - Can be a journal entry, mood description, or social media style post

3. **Get Recommendations**:

   - Click "Analyze & Get Recommendations" to process your entry
   - View your emotion breakdown (joy, sadness, anger, fear)
   - See personalized music recommendations based on your mood

4. **Save & Track**:
   - Save your favorite recommendations
   - View your mood history and music preferences
   - Track emotional patterns over time

## 💡 Example Usage

```
Input: "I'm feeling really energetic and happy today! Can't wait to start the day!"
Result: High joy score (0.8) → Upbeat pop/dance music recommendations

Input: "Feeling a bit down today, need something to lift my spirits"
Result: Elevated sadness score (0.6) → Encouraging, gentle music recommendations
```

```
sentiment-music-recommender/
├── index.html                 # Main HTML file (Lines 1-80)
├── styles.css                 # CSS styling (Lines 1-200)
├── package.json              # NPM configuration (Lines 1-45)
├── README.md                 # This file
├── src/
│   ├── main.js              # Main app logic (Lines 1-185)
│   ├── config/
│   │   └── mqttConfig.js    # MQTT settings (Lines 1-15)
│   ├── mqtt/
│   │   └── MQTTClient.js    # MQTT integration (Lines 1-200)
│   └── services/
│       ├── SentimentAnalysis.js  # AI sentiment analysis (Lines 1-50)
│       └── SpotifyAPI.js    # Music recommendations (Lines 1-80)
└── tests/
    ├── setup.js             # Test configuration (Lines 1-15)
    ├── mqtt.test.js         # MQTT unit tests (Lines 1-60)
    ├── sentiment.test.js    # Sentiment tests (Lines 1-40)
    └── spotify.test.js      # Spotify tests (Lines 1-45)
```

## 🚀 Quick Start

## 🛠️ Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd project2_team3_summer_2025
npm install
```

### 2. Configure MQTT (REQUIRED)

Edit `src/config/mqttConfig.js`:

```javascript
const mqttConfig = {
  host: 'YOUR_TEACHER_BROKER_ADDRESS', // Line 6
  port: 8083, // Line 7
  username: 'YOUR_USERNAME', // Line 8 (if required)
  password: 'YOUR_PASSWORD', // Line 9 (if required)
}
// MQTT bus
// Save
// Load
// Data is published on data/
```

### 3. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

### 4. Run Tests

```bash
npm test
```

## 🧪 Testing Features

1. **Test Users**:

   - Login as "jim" to experience country music preferences and slightly melancholic mood adjustments
   - Login as "stephanie" to see pop music recommendations and energetic mood patterns

2. **Multilingual Testing**:

   ```
   English: "I'm feeling happy today!"
   Spanish: "¡Estoy muy feliz hoy!"
   French: "Je suis très heureux aujourd'hui!"
   ```

3. **Emotion Detection**:

   - Joy: Detected through positive words and expressions
   - Sadness: Identified through melancholic or down expressions
   - Anger: Recognized through frustrated or angry language
   - Fear: Detected through anxious or nervous expressions

4. **History and Preferences**:
   - View past mood entries
   - Track emotional patterns
   - See how recommendations adapt to your preferences

## 📱 User Interface

The application features a modern, responsive interface with:

- Dark/Light theme toggle
- Intuitive mood input interface
- Visual emotion analysis results
- Clean music recommendation cards
- Easy-to-navigate history view

## 🔒 Data Privacy

- All user data is stored securely via MQTT
- Sentiment analysis is performed locally using TensorFlow.js
- User preferences and history are private to each user
- Test user data is reset periodically

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

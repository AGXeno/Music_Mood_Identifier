# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MoodTunes** is a React-based AI-powered music recommendation web application that analyzes user sentiment and provides personalized music recommendations. The app uses TensorFlow.js for sentiment analysis and MQTT for data persistence.

## Core Architecture

### Frontend Structure
- **React App**: Built with Create React App (React 19.1.0)
- **Theme System**: Context-based dark/light theme switching with custom color palette
- **Internationalization**: Support for English and Spanish with React Context
- **Page Navigation**: Single-page application with state-based routing

### Data Flow
1. **User Authentication**: Mock login system with predefined test users (Jim, Stephanie)
2. **Text Analysis**: User input → TensorFlow.js sentiment analysis → mood breakdown
3. **Music Recommendations**: Sentiment scores → genre matching → song suggestions
4. **Data Persistence**: All sessions saved via MQTT to broker.hivemq.com

### Key Services
- **MQTT Client** (`src/mqtt/MQTTClient.js`): Handles all data persistence and real-time messaging
- **Sentiment Analysis** (`src/services/SentimentAnalysis.js`): TensorFlow.js-based emotion detection
- **Spotify API** (`src/services/SpotifyAPI.js`): Music recommendation engine

## Common Development Commands

### Running the Application
```bash
npm start          # Start development server (localhost:3000)
npm test           # Run Jest test suite
npm run build      # Production build
```

### Testing
```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm test mqtt.test.js       # Run specific test file
```

## MQTT Integration

The application uses HiveMQ's public broker for data persistence:
- **Broker**: `broker.hivemq.com:8000` (WebSocket)
- **Topic Pattern**: `musicapp/{category}/{userId}/{action}`
- **Test Users**: 
  - `jim` (user_jim123) - prefers country music, tends melancholic
  - `stephanie` (user_steph456) - prefers pop music, more energetic

### MQTT Topics Structure
- Sessions: `musicapp/sessions/{userId}/new`
- History: `musicapp/history/{userId}/request|response`
- Feedback: `musicapp/feedback/{userId}/rating`
- User events: `musicapp/users/{userId}/login|logout`

## Test Users & Data

Two predefined test users with different musical preferences:
- **Jim**: Country music preference, slightly melancholic sentiment adjustment
- **Stephanie**: Pop music preference, energetic sentiment boost

User data is stored locally in `src/data/users.js` and synced via MQTT.

## Development Notes

### Key Files to Understand
- `src/App.js`: Main React component with internationalization and theming
- `app.js`: Alternative/backup version without i18n
- `src/mqtt/MQTTClient.js`: Core MQTT functionality and connection management
- `src/config/mqttConfig.js`: MQTT broker configuration

### Testing Strategy
- Jest with jsdom environment
- Mocked MQTT and TensorFlow.js dependencies in `tests/setup.js`
- Test files mirror source structure in `/tests` directory

### Theme & Styling
- CSS-in-JS approach using React inline styles
- Responsive design with Tailwind-like utility classes
- Custom color palette: primary (#4300FF), secondary (#0065F8), tertiary (#00CAFF), accent (#08D9D6)

## MQTT Development Setup

For testing MQTT functionality:
1. Install MQTTX desktop client
2. Connect to `broker.hivemq.com:8000` via WebSocket
3. Subscribe to `musicapp/sessions/+/new` to monitor new sessions
4. Check `docs/MQTT_SETUP.md` for detailed setup instructions
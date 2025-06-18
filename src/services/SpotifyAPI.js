import spotifyConfig from '../config/spotifyConfig';

class SpotifyService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.baseUrl = spotifyConfig.apiBaseUrl;
        this.isUsingMockData = false;

        // Check if we have valid Spotify credentials
        if (!spotifyConfig.clientId || spotifyConfig.clientId === 'YOUR_SPOTIFY_CLIENT_ID') {
            console.warn('⚠️ Spotify credentials not configured. Using mock data.');
            this.isUsingMockData = true;
        }
    }

    // Get Spotify access token using Client Credentials flow
    async getAccessToken() {
        // Return mock data if no credentials
        if (this.isUsingMockData) {
            return null;
        }

        // Check if token is still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const credentials = btoa(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`);

            const response = await fetch(spotifyConfig.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            // Set expiry time (subtract 60 seconds for safety)
            this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

            console.log('✅ Spotify access token obtained');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Failed to get Spotify token:', error);
            this.isUsingMockData = true;
            return null;
        }
    }

    // Get music recommendations based on sentiment
    async getRecommendations(sentimentScores, userPreferences = null) {
        // Use mock data if no Spotify credentials
        if (this.isUsingMockData) {
            console.log('🎵 Using mock recommendations (no Spotify credentials)');
            const isSpanishText = this.detectSpanish(userPreferences?.inputText || '');
            return this.getMockRecommendations(sentimentScores, isSpanishText);
        }

        // Get access token
        const token = await this.getAccessToken();
        if (!token) {
            console.log('🎵 Using mock recommendations (token failed)');
            const isSpanishText = this.detectSpanish(userPreferences?.inputText || '');
            return this.getMockRecommendations(sentimentScores, isSpanishText);
        }

        try {
            // Map sentiment to music attributes
            const musicAttributes = this.mapSentimentToMusic(sentimentScores, userPreferences);

            const queryParams = new URLSearchParams({
                seed_genres: musicAttributes.genres.slice(0, 3).join(','), // Max 3 genres
                target_valence: musicAttributes.valence,
                target_energy: musicAttributes.energy,
                target_danceability: musicAttributes.danceability,
                target_popularity: musicAttributes.popularity,
                limit: spotifyConfig.defaultLimit
            });

            console.log('🎯 Spotify search params:', Object.fromEntries(queryParams));

            const response = await fetch(`${this.baseUrl}/recommendations?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(spotifyConfig.requestTimeout)
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.tracks || data.tracks.length === 0) {
                throw new Error('No tracks returned from Spotify');
            }

            const recommendations = data.tracks.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                genre: musicAttributes.primaryGenre || 'Pop',
                preview_url: track.preview_url,
                external_url: track.external_urls.spotify,
                spotify_id: track.id,
                popularity: track.popularity,
                duration_ms: track.duration_ms
            }));

            console.log(`✅ Got ${recommendations.length} real Spotify recommendations`);
            return recommendations;

        } catch (error) {
            console.error('❌ Spotify API error, falling back to mock data:', error);
            const isSpanishText = this.detectSpanish(userPreferences?.inputText || '');
            return this.getMockRecommendations(sentimentScores, isSpanishText);
        }
    }

    // Map sentiment scores to Spotify audio features
    mapSentimentToMusic(sentiment, userPreferences = null) {
        // Get the dominant emotion
        const dominantEmotion = Object.keys(sentiment).reduce((a, b) =>
            sentiment[a] > sentiment[b] ? a : b
        );

        // Calculate weighted attributes based on all emotions
        let valence = 0.5;
        let energy = 0.5;
        let danceability = 0.5;
        let popularity = 40; // Lower default for more diverse music

        // Weight each emotion's contribution
        valence = (sentiment.joy * 0.9 + sentiment.sadness * 0.1 + sentiment.anger * 0.2 + sentiment.fear * 0.3);
        energy = (sentiment.joy * 0.8 + sentiment.anger * 0.9 + sentiment.fear * 0.3 + sentiment.sadness * 0.4);
        danceability = (sentiment.joy * 0.8 + sentiment.anger * 0.6 + sentiment.sadness * 0.3 + sentiment.fear * 0.2);

        // Detect language for genre selection
        const isSpanish = this.detectSpanish(userPreferences?.inputText || '');

        // Select genres based on dominant emotion, user preferences, and language
        let genres = [];
        let primaryGenre = '';

        if (isSpanish) {
            // Spanish/Latin music genres - using exact Spotify genre names
            console.log(`🎵 Using Spanish/Latin genres for ${dominantEmotion}`);
            switch (dominantEmotion) {
                case 'joy':
                    genres = ['reggaeton', 'latin', 'salsa', 'latin-pop','merengue', 'cumbia'];
                    primaryGenre = 'Reggaeton';
                    popularity = 60; // Higher for Latin hits
                    break;
                case 'sadness':
                    genres = ['bachata', 'bolero', 'latin', 'ranchera'];
                    primaryGenre = 'Bachata';
                    popularity = 45;
                    break;
                case 'anger':
                    genres = ['reggaeton', 'latin-rock', 'latin', 'rock en español'];
                    primaryGenre = 'Latin Rock';
                    popularity = 50;
                    break;
                case 'fear':
                    genres = ['nueva-cancion', 'latin', 'folk'];
                    primaryGenre = 'Nueva Canción';
                    popularity = 35;
                    break;
                default:
                    genres = ['latin', 'reggaeton', 'latin-pop'];
                    primaryGenre = 'Latin';
                    popularity = 55;
            }
        } else {
            // Enhanced genre diversity for English
            const genrePool = this.getGenrePool(dominantEmotion, userPreferences?.preferredGenre);
            genres = genrePool.genres;
            primaryGenre = genrePool.primaryGenre;
            popularity = genrePool.popularity;
        }

        // Adjust audio features based on preferences
        if (userPreferences?.preferredGenre === 'country') {
            valence *= 0.8;
            energy *= 0.7;
            popularity = 35; // Less mainstream country
        } else if (userPreferences?.preferredGenre === 'pop') {
            energy *= 1.1;
            danceability *= 1.1;
            popularity = 55; // Moderately popular pop
        } else if (userPreferences?.preferredGenre === 'hip-hop') {
            energy *= 1.2;
            danceability *= 1.3;
            popularity = 45;
        } else if (userPreferences?.preferredGenre === 'electronic') {
            energy *= 1.1;
            danceability *= 1.4;
            popularity = 40;
        } else if (userPreferences?.preferredGenre === 'indie') {
            popularity = 25; // Very underground indie
            valence *= 0.9;
        } else if (userPreferences?.preferredGenre === 'jazz') {
            popularity = 30;
            danceability *= 0.7;
        }

        // Clamp values between 0 and 1
        valence = Math.max(0, Math.min(1, valence));
        energy = Math.max(0, Math.min(1, energy));
        danceability = Math.max(0, Math.min(1, danceability));

        return {
            genres: genres.slice(0, 3), // Spotify limit
            primaryGenre,
            valence: parseFloat(valence.toFixed(2)),
            energy: parseFloat(energy.toFixed(2)),
            danceability: parseFloat(danceability.toFixed(2)),
            popularity: Math.round(Math.max(5, Math.min(85, popularity))), // Ensure reasonable range
            dominantEmotion,
            isSpanish
        };
    }

    // Detect Spanish text
    detectSpanish(text) {
        if (!text) return false;

        const spanishWords = [
            'estoy', 'feliz', 'triste', 'enojado', 'me siento', 'muy', 'hoy', 'día',
            'corazón', 'amor', 'vida', 'bien', 'mal', 'contento', 'alegre', 'emocionado',
            'deprimido', 'furioso', 'nervioso', 'ansiedad', 'miedo', 'esperanza',
            'soy', 'está', 'tengo', 'quiero', 'necesito', 'música', 'canción',
            'súper', 'genial', 'increíble', 'fantástico', 'maravilloso', 'celebrar',
            'con', 'para', 'del', 'las', 'los', 'una', 'esto', 'poco', 'mucho',
            'fiesta', 'baile', 'bailar', 'latin', 'latino', 'latina', 'reggaeton',
            'salsa', 'bachata', 'merengue', 'cumbia', 'ranchera', 'mariachi'
        ];

        const latinKeywords = [
            'latin music', 'latin', 'reggaeton', 'salsa', 'bachata', 'fiesta',
            'dancing', 'bailar', 'baile', 'merengue', 'cumbia', 'spanish music',
            'hispanic music', 'latino music', 'hard fiesta'
        ];

        const lowerText = text.toLowerCase();
        const spanishWordCount = spanishWords.filter(word => lowerText.includes(word)).length;
        const hasSpanishChars = /[ñáéíóúü¿¡]/i.test(text);
        const hasLatinKeywords = latinKeywords.some(keyword => lowerText.includes(keyword));

        const isSpanish = spanishWordCount >= 1 || hasSpanishChars || hasLatinKeywords;
        console.log(`🎵 Spotify Spanish detection for "${text}": ${spanishWordCount} words, hasChars: ${hasSpanishChars}, latinKeywords: ${hasLatinKeywords}, isSpanish: ${isSpanish}`);

        return isSpanish;
    }

    // Get diverse genre pool based on emotion and preference
    getGenrePool(emotion, preferredGenre) {
        const genrePools = {
            joy: {
                pop: { genres: ['pop', 'dance-pop', 'electropop', 'indie-pop'], primaryGenre: 'Pop', popularity: 55 },
                indie: { genres: ['indie-rock', 'indie-pop', 'garage-rock', 'surf-rock'], primaryGenre: 'Indie', popularity: 30 },
                electronic: { genres: ['house', 'tech-house', 'progressive-house', 'electro'], primaryGenre: 'Electronic', popularity: 40 },
                'hip-hop': { genres: ['hip-hop', 'trap', 'boom-bap', 'conscious-hip-hop'], primaryGenre: 'Hip-Hop', popularity: 50 },
                jazz: { genres: ['smooth-jazz', 'jazz-funk', 'fusion', 'contemporary-jazz'], primaryGenre: 'Jazz', popularity: 35 },
                country: { genres: ['country', 'country-pop', 'bluegrass', 'americana'], primaryGenre: 'Country', popularity: 40 },
                default: { genres: ['funk', 'disco', 'afrobeat', 'world-music', 'reggae'], primaryGenre: 'World', popularity: 35 }
            },
            sadness: {
                pop: { genres: ['indie-pop', 'dream-pop', 'shoegaze', 'alt-pop'], primaryGenre: 'Dream Pop', popularity: 40 },
                indie: { genres: ['indie-folk', 'folk-rock', 'singer-songwriter', 'lo-fi'], primaryGenre: 'Indie Folk', popularity: 25 },
                electronic: { genres: ['ambient', 'chillwave', 'downtempo', 'trip-hop'], primaryGenre: 'Ambient', popularity: 30 },
                jazz: { genres: ['jazz-blues', 'vocal-jazz', 'cool-jazz', 'ballad'], primaryGenre: 'Jazz Blues', popularity: 30 },
                country: { genres: ['country', 'alt-country', 'folk', 'americana'], primaryGenre: 'Alt-Country', popularity: 35 },
                default: { genres: ['blues', 'soul', 'r-n-b', 'neo-soul', 'acoustic'], primaryGenre: 'Blues', popularity: 30 }
            },
            anger: {
                pop: { genres: ['pop-punk', 'pop-rock', 'alternative', 'emo'], primaryGenre: 'Pop Punk', popularity: 45 },
                indie: { genres: ['indie-rock', 'garage-rock', 'post-punk', 'noise-rock'], primaryGenre: 'Indie Rock', popularity: 30 },
                electronic: { genres: ['industrial', 'drum-and-bass', 'dubstep', 'breakbeat'], primaryGenre: 'Industrial', popularity: 35 },
                'hip-hop': { genres: ['hardcore-hip-hop', 'trap', 'drill', 'gangsta-rap'], primaryGenre: 'Hardcore Hip-Hop', popularity: 40 },
                default: { genres: ['metal', 'punk', 'hardcore', 'grunge', 'hard-rock'], primaryGenre: 'Metal', popularity: 40 }
            },
            fear: {
                pop: { genres: ['chillout', 'indie-pop', 'soft-rock', 'acoustic-pop'], primaryGenre: 'Chillout', popularity: 35 },
                indie: { genres: ['post-rock', 'ambient-folk', 'experimental', 'minimal'], primaryGenre: 'Post-Rock', popularity: 25 },
                electronic: { genres: ['ambient', 'drone', 'new-age', 'meditation'], primaryGenre: 'Ambient', popularity: 20 },
                jazz: { genres: ['smooth-jazz', 'piano-jazz', 'cool-jazz', 'meditation'], primaryGenre: 'Smooth Jazz', popularity: 30 },
                default: { genres: ['classical', 'neoclassical', 'piano', 'string-quartet'], primaryGenre: 'Classical', popularity: 25 }
            }
        };

        const emotionPool = genrePools[emotion] || genrePools.joy;
        return emotionPool[preferredGenre] || emotionPool.default;
    }

    // Fallback mock recommendations
    getMockRecommendations(sentiment, isSpanish = false) {
        // Check if we should use Spanish songs
        if (isSpanish) {
            return this.getSpanishMockRecommendations(sentiment);
        }

        const mockSongs = {
            joy: [
                { id: '5b88tNINg4Q4nraccMNdvX', title: 'Happy', artist: 'Pharrell Williams', album: 'G I R L', genre: 'Pop', spotify_id: '5b88tNINg4Q4nraccMNdvX', popularity: 85 },
                { id: '1xzBco0xcoJEDXktl7Jxrr', title: 'Good as Hell', artist: 'Lizzo', album: 'Cuz I Love You', genre: 'Pop', spotify_id: '1xzBco0xcoJEDXktl7Jxrr', popularity: 82 },
                { id: '20I6sIOMTCkB6w7ryavxtO', title: "Can't Stop the Feeling!", artist: 'Justin Timberlake', album: 'Trolls Soundtrack', genre: 'Pop', spotify_id: '20I6sIOMTCkB6w7ryavxtO', popularity: 79 },
                { id: '32OlwWuMpZ6b0aN2RZOeMS', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album: 'Uptown Special', genre: 'Funk', spotify_id: '32OlwWuMpZ6b0aN2RZOeMS', popularity: 88 },
                { id: '05wIrZSwuaVWhcv5FfqeH0', title: 'Walking on Sunshine', artist: 'Katrina and the Waves', album: 'Walking on Sunshine', genre: 'Rock', spotify_id: '05wIrZSwuaVWhcv5FfqeH0', popularity: 74 },
                { id: 'mock_6', title: "Don't Stop Me Now", artist: 'Queen', album: 'Jazz', genre: 'Rock', spotify_id: 'mock_6', popularity: 86 },
                { id: 'mock_7', title: 'September', artist: 'Earth, Wind & Fire', album: 'The Best of Earth, Wind & Fire', genre: 'R&B', spotify_id: 'mock_7', popularity: 81 },
                { id: 'mock_8', title: 'I Gotta Feeling', artist: 'The Black Eyed Peas', album: 'The E.N.D.', genre: 'Hip-Hop', spotify_id: 'mock_8', popularity: 77 },
                { id: 'mock_9', title: 'Good Vibrations', artist: 'The Beach Boys', album: 'Smiley Smile', genre: 'Rock', spotify_id: 'mock_9', popularity: 73 },
                { id: 'mock_10', title: 'Three Little Birds', artist: 'Bob Marley', album: 'Exodus', genre: 'Reggae', spotify_id: 'mock_10', popularity: 78 }
            ],
            sadness: [
                { id: '1zwMYTA5nlNjZxYrvBB2pV', title: 'Someone Like You', artist: 'Adele', album: '21', genre: 'Pop', spotify_id: '1zwMYTA5nlNjZxYrvBB2pV', popularity: 85 },
                { id: '3JOVTQ5h4yzbdlMlJwLVzq', title: 'Mad World', artist: 'Gary Jules', album: 'Trading Snakeoil for Wolftickets', genre: 'Alternative', spotify_id: '3JOVTQ5h4yzbdlMlJwLVzq', popularity: 68 },
                { id: '2WOJUzPbYna8GhNIyR3ICP', title: 'Hurt', artist: 'Johnny Cash', album: 'American IV: The Man Comes Around', genre: 'Country', spotify_id: '2WOJUzPbYna8GhNIyR3ICP', popularity: 72 },
                { id: '1HNkqx9Abjoe0l6aFfONBp', title: 'Black', artist: 'Pearl Jam', album: 'Ten', genre: 'Rock', spotify_id: '1HNkqx9Abjoe0l6aFfONBp', popularity: 76 },
                { id: '2L7ZS6A0obYzP5l5xXbYzN', title: 'Tears in Heaven', artist: 'Eric Clapton', album: 'Unplugged', genre: 'Blues', spotify_id: '2L7ZS6A0obYzP5l5xXbYzN', popularity: 74 },
                { id: 'mock_sad_6', title: 'The Sound of Silence', artist: 'Simon & Garfunkel', album: 'Sounds of Silence', genre: 'Folk', spotify_id: 'mock_sad_6', popularity: 79 },
                { id: 'mock_sad_7', title: 'Everybody Hurts', artist: 'R.E.M.', album: 'Automatic for the People', genre: 'Alternative', spotify_id: 'mock_sad_7', popularity: 73 },
                { id: 'mock_sad_8', title: 'Breathe Me', artist: 'Sia', album: 'Colour the Small One', genre: 'Indie', spotify_id: 'mock_sad_8', popularity: 69 },
                { id: 'mock_sad_9', title: 'Mad About You', artist: 'Sting', album: 'Ten Summoners Tales', genre: 'Pop', spotify_id: 'mock_sad_9', popularity: 67 },
                { id: 'mock_sad_10', title: 'Skinny Love', artist: 'Bon Iver', album: 'For Emma, Forever Ago', genre: 'Indie', spotify_id: 'mock_sad_10', popularity: 71 }
            ],
            anger: [
                { id: 'mock_anger_1', title: 'Break Stuff', artist: 'Limp Bizkit', album: 'Significant Other', genre: 'Rock', spotify_id: 'mock_anger_1', popularity: 72 },
                { id: 'mock_anger_2', title: 'Bodies', artist: 'Drowning Pool', album: 'Sinner', genre: 'Metal', spotify_id: 'mock_anger_2', popularity: 69 },
                { id: 'mock_anger_3', title: 'Killing in the Name', artist: 'Rage Against the Machine', album: 'Rage Against the Machine', genre: 'Rock', spotify_id: 'mock_anger_3', popularity: 78 },
                { id: 'mock_anger_4', title: 'Chop Suey!', artist: 'System of a Down', album: 'Toxicity', genre: 'Metal', spotify_id: 'mock_anger_4', popularity: 80 },
                { id: 'mock_anger_5', title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', genre: 'Grunge', spotify_id: 'mock_anger_5', popularity: 85 }
            ],
            fear: [
                { id: 'mock_fear_1', title: 'Weightless', artist: 'Marconi Union', album: 'Ambient', genre: 'Ambient', spotify_id: 'mock_fear_1', popularity: 45 },
                { id: 'mock_fear_2', title: 'Clair de Lune', artist: 'Claude Debussy', album: 'Classical', genre: 'Classical', spotify_id: 'mock_fear_2', popularity: 68 },
                { id: 'mock_fear_3', title: 'River', artist: 'Max Richter', album: 'The Blue Notebooks', genre: 'Ambient', spotify_id: 'mock_fear_3', popularity: 52 },
                { id: 'mock_fear_4', title: 'Spiegel im Spiegel', artist: 'Arvo Pärt', album: 'Classical', genre: 'Classical', spotify_id: 'mock_fear_4', popularity: 48 },
                { id: 'mock_fear_5', title: 'Aqueous Transmission', artist: 'Incubus', album: 'Morning View', genre: 'Alternative', spotify_id: 'mock_fear_5', popularity: 58 }
            ]
        };

        const dominantEmotion = Object.keys(sentiment).reduce((a, b) =>
            sentiment[a] > sentiment[b] ? a : b
        );

        console.log(`🎵 Using mock recommendations for ${dominantEmotion}`);
        return mockSongs[dominantEmotion] || mockSongs.joy;
    }

    // Spanish/Latin mock recommendations
    getSpanishMockRecommendations(sentiment) {
        const spanishSongs = {
            joy: [
                { id: 'spanish_joy_1', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', album: 'VIDA', genre: 'Reggaeton', spotify_id: 'spanish_joy_1', popularity: 95 },
                { id: 'spanish_joy_2', title: 'La Gozadera', artist: 'Gente de Zona ft. Marc Anthony', album: 'Visualízate', genre: 'Salsa', spotify_id: 'spanish_joy_2', popularity: 88 },
                { id: 'spanish_joy_3', title: 'Danza Kuduro', artist: 'Don Omar ft. Lucenzo', album: 'Meet the Orphans', genre: 'Reggaeton', spotify_id: 'spanish_joy_3', popularity: 87 },
                { id: 'spanish_joy_4', title: 'Vivir Mi Vida', artist: 'Marc Anthony', album: '3.0', genre: 'Salsa', spotify_id: 'spanish_joy_4', popularity: 85 },
                { id: 'spanish_joy_5', title: 'Gasolina', artist: 'Daddy Yankee', album: 'Barrio Fino', genre: 'Reggaeton', spotify_id: 'spanish_joy_5', popularity: 90 },
                { id: 'spanish_joy_6', title: 'Con Altura', artist: 'Rosalía ft. J Balvin', album: 'Single', genre: 'Latin Pop', spotify_id: 'spanish_joy_6', popularity: 91 },
                { id: 'spanish_joy_7', title: 'Mi Gente', artist: 'J Balvin ft. Willy William', album: 'Energía', genre: 'Reggaeton', spotify_id: 'spanish_joy_7', popularity: 89 },
                { id: 'spanish_joy_8', title: 'La Camisa Negra', artist: 'Juanes', album: 'Mi Sangre', genre: 'Latin Rock', spotify_id: 'spanish_joy_8', popularity: 84 },
                { id: 'spanish_joy_9', title: 'Baila Baila Baila', artist: 'Ozuna', album: 'Odisea', genre: 'Reggaeton', spotify_id: 'spanish_joy_9', popularity: 83 },
                { id: 'spanish_joy_10', title: 'La Vida Es Una Fiesta', artist: 'Manu Chao', album: 'Próxima Estación: Esperanza', genre: 'Latin Alternative', spotify_id: 'spanish_joy_10', popularity: 82 }
            ],
            sadness: [
                { id: 'spanish_sad_1', title: 'Obsesión', artist: 'Aventura', album: 'We Broke the Rules', genre: 'Bachata', spotify_id: 'spanish_sad_1', popularity: 88 },
                { id: 'spanish_sad_2', title: 'Propuesta Indecente', artist: 'Romeo Santos', album: 'Fórmula, Vol. 2', genre: 'Bachata', spotify_id: 'spanish_sad_2', popularity: 87 },
                { id: 'spanish_sad_3', title: 'Bésame Mucho', artist: 'Consuelo Velázquez', album: 'Boleros Inmortales', genre: 'Bolero', spotify_id: 'spanish_sad_3', popularity: 75 },
                { id: 'spanish_sad_4', title: 'Lágrimas Negras', artist: 'Bebo Valdés & Diego El Cigala', album: 'Lágrimas Negras', genre: 'Bolero', spotify_id: 'spanish_sad_4', popularity: 72 },
                { id: 'spanish_sad_5', title: 'Corazón Partío', artist: 'Alejandro Sanz', album: 'Más', genre: 'Latin Pop', spotify_id: 'spanish_sad_5', popularity: 79 },
                { id: 'spanish_sad_6', title: 'Te Amo', artist: 'Franco de Vita', album: 'Extranjero', genre: 'Latin Ballad', spotify_id: 'spanish_sad_6', popularity: 76 },
                { id: 'spanish_sad_7', title: 'Un Beso', artist: 'Jesse & Joy', album: 'Un Besito Más', genre: 'Latin Pop', spotify_id: 'spanish_sad_7', popularity: 74 },
                { id: 'spanish_sad_8', title: 'Rayando el Sol', artist: 'Maná', album: 'Cuando los Ángeles Lloran', genre: 'Latin Rock', spotify_id: 'spanish_sad_8', popularity: 78 },
                { id: 'spanish_sad_9', title: 'Como Llora una Estrella', artist: 'Antonio Carrillo', album: 'Boleros de Oro', genre: 'Bolero', spotify_id: 'spanish_sad_9', popularity: 70 },
                { id: 'spanish_sad_10', title: 'Lluvia', artist: 'Jesse & Joy', album: 'Jesse & Joy', genre: 'Latin Pop', spotify_id: 'spanish_sad_10', popularity: 73 }
            ],
            anger: [
                { id: 'spanish_anger_1', title: 'Safaera', artist: 'Bad Bunny', album: 'YHLQMDLG', genre: 'Reggaeton', spotify_id: 'spanish_anger_1', popularity: 92 },
                { id: 'spanish_anger_2', title: 'Chambea', artist: 'Bad Bunny', album: 'X 100PRE', genre: 'Trap Latino', spotify_id: 'spanish_anger_2', popularity: 86 },
                { id: 'spanish_anger_3', title: 'La Botella', artist: 'Anuel AA', album: 'Real Hasta la Muerte', genre: 'Trap Latino', spotify_id: 'spanish_anger_3', popularity: 84 },
                { id: 'spanish_anger_4', title: 'Yo Perreo Sola', artist: 'Bad Bunny', album: 'YHLQMDLG', genre: 'Reggaeton', spotify_id: 'spanish_anger_4', popularity: 89 },
                { id: 'spanish_anger_5', title: 'Con Dinero Baila el Perro', artist: 'El Gran Combo', album: 'Salsa Classics', genre: 'Salsa', spotify_id: 'spanish_anger_5', popularity: 75 }
            ],
            fear: [
                { id: 'spanish_fear_1', title: 'Te Recuerdo Amanda', artist: 'Víctor Jara', album: 'Te Recuerdo Amanda', genre: 'Nueva Canción', spotify_id: 'spanish_fear_1', popularity: 68 },
                { id: 'spanish_fear_2', title: 'Ojalá', artist: 'Silvio Rodríguez', album: 'Días y Flores', genre: 'Nueva Canción', spotify_id: 'spanish_fear_2', popularity: 65 },
                { id: 'spanish_fear_3', title: 'Gracias a la Vida', artist: 'Violeta Parra', album: 'Las Últimas Composiciones', genre: 'Folk Latino', spotify_id: 'spanish_fear_3', popularity: 72 },
                { id: 'spanish_fear_4', title: 'La Llorona', artist: 'Chavela Vargas', album: 'La Llorona', genre: 'Ranchera', spotify_id: 'spanish_fear_4', popularity: 70 },
                { id: 'spanish_fear_5', title: 'Alfonsina y el Mar', artist: 'Mercedes Sosa', album: 'Cantora 1', genre: 'Folk Latino', spotify_id: 'spanish_fear_5', popularity: 74 }
            ]
        };

        const dominantEmotion = Object.keys(sentiment).reduce((a, b) =>
            sentiment[a] > sentiment[b] ? a : b
        );

        console.log(`🎵 Using Spanish mock recommendations for ${dominantEmotion}`);
        return spanishSongs[dominantEmotion] || spanishSongs.joy;
    }
}

export default SpotifyService
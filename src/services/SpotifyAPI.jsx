// services/SpotifyAPI.jsx
import spotifyConfig from '../config/spotifyConfig';

/**
 * Service class for handling Spotify API interactions
 * @class
 */
class SpotifyService {
    constructor() {
        /** @type {string|null} */
        this.accessToken = null;
        /** @type {number|null} */
        this.tokenExpiry = null;
        /** @type {string} */
        this.baseUrl = spotifyConfig.apiBaseUrl;
        /** @type {boolean} */
        this.isUsingMockData = false;

        // Debug logging for Spotify credentials
        console.log('🔍 Checking Spotify credentials:', {
            hasClientId: !!spotifyConfig.clientId,
            clientIdLength: spotifyConfig.clientId?.length,
            hasClientSecret: !!spotifyConfig.clientSecret,
            clientSecretLength: spotifyConfig.clientSecret?.length,
            baseUrl: this.baseUrl
        });

        // Check if we have valid Spotify credentials
        if (!spotifyConfig.clientId || !spotifyConfig.clientSecret) {
            console.warn('⚠️ Spotify credentials missing or invalid');
            this.isUsingMockData = true;
        }
    }

    /**
     * Get Spotify access token using Client Credentials flow
     * @returns {Promise<string|null>}
     */
    async getAccessToken() {
        if (this.isUsingMockData) {
            console.warn('⚠️ Using mock data - no Spotify credentials');
            return null;
        }

        // Use cached token if still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            console.log('✅ Using cached Spotify token');
            return this.accessToken;
        }

        try {
            // Use URLSearchParams for the body
            const body = new URLSearchParams();
            body.append('grant_type', 'client_credentials');

            const response = await fetch(spotifyConfig.tokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(spotifyConfig.clientId + ':' + spotifyConfig.clientSecret)}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });

            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

            console.log('✅ New Spotify access token obtained');
            return this.accessToken;

        } catch (error) {
            console.error('❌ Failed to get Spotify token:', error);
            this.isUsingMockData = true;
            return null;
        }
    }

    /**
     * Get music recommendations based on sentiment and user preferences
     * @param {Object} sentimentScores - The sentiment scores for the user's input
     * @param {Object} [userPreferences=null] - Optional user genre preferences
     * @returns {Promise<Array>} List of recommended tracks
     */
    async getRecommendations(sentimentScores, userPreferences = null) {
        console.log('🎵 Getting music recommendations for sentiment:', sentimentScores);
        console.log('👤 User preferences:', userPreferences);

        // Use mock data if no API credentials or if API fails
        if (this.isUsingMockData) {
            console.log('🎭 Using mock recommendations');
            return this.getMockRecommendations(sentimentScores, userPreferences);
        }

        try {
            const token = await this.getAccessToken();
            if (!token) {
                return this.getMockRecommendations(sentimentScores, userPreferences);
            }

            // Map sentiment to music attributes
            const musicAttributes = this.mapSentimentToMusic(sentimentScores, userPreferences);
            console.log('🎼 Music attributes:', musicAttributes);

            // Get genres from user preferences and emotion
            const dominantEmotion = this.getDominantEmotion(sentimentScores);
            const genres = this.getGenresFromPreferences(
                userPreferences?.preferredGenres || ['pop'],
                dominantEmotion
            );

            // Build Spotify recommendations request
            const params = new URLSearchParams({
                limit: '10',
                seed_genres: genres.slice(0, 3).join(','), // Spotify allows max 3 genres
                target_valence: musicAttributes.valence.toString(),
                target_energy: musicAttributes.energy.toString(),
                target_danceability: musicAttributes.danceability.toString(),
                min_popularity: '30',
                market: 'US'
            });

            const response = await fetch(
                `${spotifyConfig.recommendationsUrl}?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: spotifyConfig.requestTimeout
                }
            );

            if (!response.ok) {
                console.warn(`🚨 Spotify API request failed: ${response.status}`);
                return this.getMockRecommendations(sentimentScores, userPreferences);
            }

            const data = await response.json();
            console.log('✅ Spotify API response received');

            // Transform Spotify tracks to our format
            const recommendations = data.tracks.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                genre: genres[0] || 'unknown',
                preview_url: track.preview_url,
                external_url: track.external_urls.spotify,
                popularity: track.popularity,
                duration_ms: track.duration_ms
            }));

            console.log(`🎵 ${recommendations.length} Spotify recommendations generated`);
            return recommendations;

        } catch (error) {
            console.error('❌ Spotify API error:', error);
            console.log('🔄 Falling back to mock recommendations');
            return this.getMockRecommendations(sentimentScores, userPreferences);
        }
    }

    /**
     * Get the dominant emotion from sentiment scores
     * @param {Object} sentimentScores - Sentiment analysis results
     * @returns {string} Dominant emotion name
     */
    getDominantEmotion(sentimentScores) {
        const emotions = Object.entries(sentimentScores);
        const dominant = emotions.reduce((max, current) => 
            current[1] > max[1] ? current : max
        );
        return dominant[0];
    }

    /**
     * Get genres based on multiple preferred genres and emotion
     * @param {Array<string>} preferredGenres - List of preferred genres
     * @param {string} emotion - The dominant emotion
     * @returns {Array<string>} List of weighted and sorted genres
     */
    getGenresFromPreferences(preferredGenres, emotion) {
        // Emotion to genre mapping
        const emotionGenreMap = {
            joy: ['pop', 'dance', 'funk', 'reggae', 'latin'],
            sadness: ['indie', 'folk', 'blues', 'country', 'alternative'],
            anger: ['rock', 'metal', 'punk', 'hip-hop', 'electronic'],
            fear: ['ambient', 'classical', 'indie', 'folk', 'acoustic'],
            surprise: ['electronic', 'experimental', 'jazz', 'funk'],
            disgust: ['alternative', 'punk', 'metal', 'grunge']
        };

        const emotionGenres = emotionGenreMap[emotion] || ['pop'];
        
        // Combine user preferences with emotion-based genres
        const combinedGenres = [...new Set([...preferredGenres, ...emotionGenres])];
        
        console.log(`🎭 Emotion: ${emotion}, Combined genres:`, combinedGenres);
        return combinedGenres;
    }

    /**
     * Map sentiment scores to Spotify audio features
     * @param {Object} sentiment - The sentiment scores
     * @param {Object} [userPreferences=null] - Optional user preferences
     * @returns {Object} Mapped music attributes
     */
    mapSentimentToMusic(sentiment, userPreferences = null) {
        const { joy = 0, sadness = 0, anger = 0, fear = 0 } = sentiment;

        // Base calculations
        let valence = Math.max(0.1, Math.min(0.9, joy * 0.8 + (1 - sadness) * 0.2));
        let energy = Math.max(0.2, Math.min(0.9, (joy + anger) * 0.6 + (1 - fear) * 0.4));
        let danceability = Math.max(0.3, Math.min(0.8, joy * 0.7 + energy * 0.3));

        // Adjust based on user preferences
        if (userPreferences?.preferredGenres) {
            const genres = userPreferences.preferredGenres;
            
            // High-energy genres boost energy and danceability
            if (genres.some(g => ['electronic', 'dance', 'latin', 'reggaeton'].includes(g))) {
                energy = Math.min(0.9, energy * 1.2);
                danceability = Math.min(0.8, danceability * 1.1);
            }
            
            // Mellow genres reduce energy
            if (genres.some(g => ['folk', 'ambient', 'classical', 'indie'].includes(g))) {
                energy = Math.max(0.2, energy * 0.8);
                valence = Math.max(0.3, valence * 0.9);
            }
            
            // Country and blues have specific characteristics
            if (genres.includes('country') || genres.includes('blues')) {
                if (sadness > 0.4) {
                    valence = Math.max(0.2, valence * 0.7);
                }
            }
        }

        return {
            valence: Math.round(valence * 100) / 100,
            energy: Math.round(energy * 100) / 100,
            danceability: Math.round(danceability * 100) / 100
        };
    }

    /**
     * Get mock recommendations when Spotify API is unavailable
     * @param {Object} sentimentScores - The sentiment scores
     * @param {Object} [userPreferences=null] - Optional user preferences
     * @returns {Array} Mock song recommendations
     */
    getMockRecommendations(sentimentScores, userPreferences = null) {
        console.log('🎭 Generating mock recommendations');
        
        const dominantEmotion = this.getDominantEmotion(sentimentScores);
        const isSpanish = userPreferences?.inputText && 
            this.detectSpanishText(userPreferences.inputText);
        
        console.log(`🎵 Dominant emotion: ${dominantEmotion}, Spanish context: ${isSpanish}`);

        // Check for user-specific preferences
        const hasCountryPreference = userPreferences?.preferredGenres?.includes('country');
        const hasLatinPreference = userPreferences?.preferredGenres?.includes('latin');

        if (isSpanish || hasLatinPreference) {
            return this.getSpanishMockRecommendations(dominantEmotion);
        }

        if (hasCountryPreference) {
            return this.getCountryMockRecommendations(dominantEmotion);
        }

        return this.getGeneralMockRecommendations(dominantEmotion);
    }

    /**
     * Detect if text is Spanish for Latin music recommendations
     * @param {string} text - Input text to analyze
     * @returns {boolean} True if text appears to be Spanish
     */
    detectSpanishText(text) {
        const spanishIndicators = [
            'estoy', 'feliz', 'triste', 'enojado', 'me siento', 'muy', 'hoy',
            'súper', 'genial', 'increíble', 'fiesta', 'bailar', 'música',
            'español', 'latino', 'reggaeton', 'salsa', 'bachata'
        ];
        
        const lowerText = text.toLowerCase();
        return spanishIndicators.some(word => lowerText.includes(word)) ||
               /[ñáéíóúü¿¡]/i.test(text);
    }

    /**
     * Get Spanish/Latin mock recommendations
     * @param {string} emotion - Dominant emotion
     * @returns {Array} Spanish song recommendations
     */
    getSpanishMockRecommendations(emotion) {
        const spanishSongs = {
            joy: [
                { id: 1, title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", album: "Vida", genre: "Reggaeton" },
                { id: 2, title: "La Gozadera", artist: "Gente de Zona ft. Marc Anthony", album: "Visualízate", genre: "Salsa" },
                { id: 3, title: "Danza Kuduro", artist: "Don Omar ft. Lucenzo", album: "Meet the Orphans", genre: "Reggaeton" },
                { id: 4, title: "Gasolina", artist: "Daddy Yankee", album: "Barrio Fino", genre: "Reggaeton" },
                { id: 5, title: "Bamboléo", artist: "Gipsy Kings", album: "Gipsy Kings", genre: "Rumba Flamenca" },
                { id: 6, title: "Macarena", artist: "Los Del Rio", album: "A mí me gusta", genre: "Latin Pop" },
                { id: 7, title: "Vivir Mi Vida", artist: "Marc Anthony", album: "3.0", genre: "Salsa" },
                { id: 8, title: "Bailando", artist: "Enrique Iglesias", album: "Sex and Love", genre: "Latin Pop" },
                { id: 9, title: "La Vida Es Una Fiesta", artist: "Manu Chao", album: "Próxima Estación: Esperanza", genre: "Latin Alternative" },
                { id: 10, title: "Propuesta Indecente", artist: "Romeo Santos", album: "Fórmula, Vol. 2", genre: "Bachata" }
            ],
            sadness: [
                { id: 11, title: "Obsesión", artist: "Aventura", album: "We Broke the Rules", genre: "Bachata" },
                { id: 12, title: "Bésame Mucho", artist: "Consuelo Velázquez", album: "Clásicos", genre: "Bolero" },
                { id: 13, title: "Lágrimas Negras", artist: "Bebo Valdés & Diego El Cigala", album: "Lágrimas Negras", genre: "Son Cubano" },
                { id: 14, title: "Como Quien Pierde Una Estrella", artist: "Alejandro Fernández", album: "Me Estoy Enamorando", genre: "Ranchera" },
                { id: 15, title: "Si No Te Hubieras Ido", artist: "Marco Antonio Solís", album: "Trozos de Mi Alma", genre: "Balada" },
                { id: 16, title: "El Cuarto de Tula", artist: "Buena Vista Social Club", album: "Buena Vista Social Club", genre: "Son Cubano" },
                { id: 17, title: "Amor Eterno", artist: "Juan Gabriel", album: "Recuerdos II", genre: "Ranchera" },
                { id: 18, title: "La Llorona", artist: "Lila Downs", album: "Border", genre: "Folk Mexicano" },
                { id: 19, title: "Corazón Partío", artist: "Alejandro Sanz", album: "Más", genre: "Latin Pop" },
                { id: 20, title: "Sin Ti", artist: "Maná", album: "Falta Amor", genre: "Latin Rock" }
            ],
            anger: [
                { id: 21, title: "Safaera", artist: "Bad Bunny", album: "YHLQMDLG", genre: "Trap Latino" },
                { id: 22, title: "Ella Quiere Beber", artist: "Anuel AA", album: "Real Hasta la Muerte", genre: "Trap Latino" },
                { id: 23, title: "Con Altura", artist: "Rosalía ft. J Balvin", album: "Single", genre: "Latin Trap" },
                { id: 24, title: "Mala Mía", artist: "Maluma", album: "11:11", genre: "Reggaeton" },
                { id: 25, title: "Que Tire Pa Lante", artist: "Daddy Yankee", album: "Con Calma & Mis Grandes Éxitos", genre: "Reggaeton" },
                { id: 26, title: "Loco", artist: "Enrique Iglesias ft. Romeo Santos", album: "Sex and Love", genre: "Latin Pop" },
                { id: 27, title: "Rata de Dos Patas", artist: "Paquita la del Barrio", album: "Sus Grandes Éxitos", genre: "Ranchera" },
                { id: 28, title: "Fuego", artist: "Eleni Foureira", album: "Single", genre: "Latin Pop" },
                { id: 29, title: "Dale Don Dale", artist: "Don Omar", album: "The Last Don", genre: "Reggaeton" },
                { id: 30, title: "Bandolero", artist: "Don Omar ft. Tego Calderón", album: "King of Kings", genre: "Reggaeton" }
            ],
            fear: [
                { id: 31, title: "Te Recuerdo Amanda", artist: "Víctor Jara", album: "Te Recuerdo Amanda", genre: "Nueva Canción" },
                { id: 32, title: "La Maza", artist: "Silvio Rodríguez", album: "Días y Flores", genre: "Nueva Trova" },
                { id: 33, title: "Ojalá", artist: "Silvio Rodríguez", album: "Días y Flores", genre: "Nueva Trova" },
                { id: 34, title: "Volver a los 17", artist: "Violeta Parra", album: "Las Últimas Composiciones", genre: "Folk Chileno" },
                { id: 35, title: "Alfonsina y el Mar", artist: "Mercedes Sosa", album: "Gracias a la Vida", genre: "Folk Argentino" },
                { id: 36, title: "Como la Cigarra", artist: "Mercedes Sosa", album: "Como la Cigarra", genre: "Folk Argentino" },
                { id: 37, title: "Canción con Todos", artist: "Mercedes Sosa", album: "Homenaje a Violeta Parra", genre: "Folk Argentino" },
                { id: 38, title: "El Aparecido", artist: "Víctor Jara", album: "Canto Libre", genre: "Nueva Canción" },
                { id: 39, title: "Unicornio", artist: "Silvio Rodríguez", album: "Al Final de Este Viaje", genre: "Nueva Trova" },
                { id: 40, title: "La Era Está Pariendo un Corazón", artist: "Silvio Rodríguez", album: "Días y Flores", genre: "Nueva Trova" }
            ]
        };

        return spanishSongs[emotion] || spanishSongs.joy;
    }

    /**
     * Get country mock recommendations
     * @param {string} emotion - Dominant emotion
     * @returns {Array} Country song recommendations
     */
    getCountryMockRecommendations(emotion) {
        const countrySongs = {
            joy: [
                { id: 41, title: "Life is a Highway", artist: "Rascal Flatts", album: "Me and My Gang", genre: "Country" },
                { id: 42, title: "Wagon Wheel", artist: "Darius Rucker", album: "True Believers", genre: "Country" },
                { id: 43, title: "Chicken Fried", artist: "Zac Brown Band", album: "The Foundation", genre: "Country" },
                { id: 44, title: "Cruise", artist: "Florida Georgia Line", album: "Here's to the Good Times", genre: "Country" },
                { id: 45, title: "God's Country", artist: "Blake Shelton", album: "Fully Loaded: God's Country", genre: "Country" },
                { id: 46, title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", album: "Second Helping", genre: "Southern Rock" },
                { id: 47, title: "Tennessee Whiskey", artist: "Chris Stapleton", album: "Traveller", genre: "Country" },
                { id: 48, title: "Body Like a Back Road", artist: "Sam Hunt", album: "Montevallo", genre: "Country Pop" },
                { id: 49, title: "Knee Deep", artist: "Zac Brown Band ft. Jimmy Buffett", album: "You Get What You Give", genre: "Country" },
                { id: 50, title: "Friends in Low Places", artist: "Garth Brooks", album: "No Fences", genre: "Country" }
            ],
            sadness: [
                { id: 51, title: "The Dance", artist: "Garth Brooks", album: "Garth Brooks", genre: "Country" },
                { id: 52, title: "Hurt", artist: "Johnny Cash", album: "American IV: The Man Comes Around", genre: "Country" },
                { id: 53, title: "Whiskey Lullaby", artist: "Brad Paisley ft. Alison Krauss", album: "Mud on the Tires", genre: "Country" },
                { id: 54, title: "Tears in Heaven", artist: "Eric Clapton", album: "Rush Soundtrack", genre: "Country Rock" },
                { id: 55, title: "Go Rest High on That Mountain", artist: "Vince Gill", album: "When I Call Your Name", genre: "Country" },
                { id: 56, title: "I Hope You Dance", artist: "Lee Ann Womack", album: "I Hope You Dance", genre: "Country" },
                { id: 57, title: "Live Like You Were Dying", artist: "Tim McGraw", album: "Live Like You Were Dying", genre: "Country" },
                { id: 58, title: "Concrete Angel", artist: "Martina McBride", album: "Greatest Hits", genre: "Country" },
                { id: 59, title: "He Stopped Loving Her Today", artist: "George Jones", album: "I Am What I Am", genre: "Country" },
                { id: 60, title: "Alyssa Lies", artist: "Jason Michael Carroll", album: "Waitin' in the Country", genre: "Country" }
            ],
            anger: [
                { id: 61, title: "Before He Cheats", artist: "Carrie Underwood", album: "Some Hearts", genre: "Country" },
                { id: 62, title: "Goodbye Earl", artist: "Dixie Chicks", album: "Fly", genre: "Country" },
                { id: 63, title: "Gunpowder & Lead", artist: "Miranda Lambert", album: "Crazy Ex-Girlfriend", genre: "Country" },
                { id: 64, title: "Two Black Cadillacs", artist: "Carrie Underwood", album: "Blown Away", genre: "Country" },
                { id: 65, title: "White Liar", artist: "Miranda Lambert", album: "Revolution", genre: "Country" },
                { id: 66, title: "Somebody Like You", artist: "Keith Urban", album: "Golden Road", genre: "Country" },
                { id: 67, title: "Picture to Burn", artist: "Taylor Swift", album: "Taylor Swift", genre: "Country Pop" },
                { id: 68, title: "Should've Been a Cowboy", artist: "Toby Keith", album: "Toby Keith", genre: "Country" },
                { id: 69, title: "Redneck Woman", artist: "Gretchen Wilson", album: "Here for the Party", genre: "Country" },
                { id: 70, title: "Country Boys", artist: "Little Big Town", album: "The Road to Here", genre: "Country" }
            ],
            fear: [
                { id: 71, title: "Amazing Grace", artist: "Alan Jackson", album: "Precious Memories", genre: "Country Gospel" },
                { id: 72, title: "I Can Only Imagine", artist: "MercyMe", album: "Almost There", genre: "Christian Country" },
                { id: 73, title: "Jesus, Take the Wheel", artist: "Carrie Underwood", album: "Some Hearts", genre: "Country" },
                { id: 74, title: "Holes in the Floor of Heaven", artist: "Steve Wariner", album: "Burnin' the Roadhouse Down", genre: "Country" },
                { id: 75, title: "Three Wooden Crosses", artist: "Randy Travis", album: "Rise and Shine", genre: "Country" },
                { id: 76, title: "There Goes My Life", artist: "Kenny Chesney", album: "When the Sun Goes Down", genre: "Country" },
                { id: 77, title: "Godspeed", artist: "Dixie Chicks", album: "Home", genre: "Country" },
                { id: 78, title: "In Color", artist: "Jamey Johnson", album: "That Lonesome Song", genre: "Country" },
                { id: 79, title: "If Tomorrow Never Comes", artist: "Garth Brooks", album: "Garth Brooks", genre: "Country" },
                { id: 80, title: "The Night the Lights Went Out in Georgia", artist: "Reba McEntire", album: "For My Broken Heart", genre: "Country" }
            ]
        };

        return countrySongs[emotion] || countrySongs.sadness;
    }

    /**
     * Get general mock recommendations
     * @param {string} emotion - Dominant emotion
     * @returns {Array} General song recommendations
     */
    getGeneralMockRecommendations(emotion) {
        const generalSongs = {
            joy: [
                { id: 81, title: "Happy", artist: "Pharrell Williams", album: "Girl", genre: "Pop" },
                { id: 82, title: "Can't Stop the Feeling!", artist: "Justin Timberlake", album: "Trolls Soundtrack", genre: "Pop" },
                { id: 83, title: "Good as Hell", artist: "Lizzo", album: "Cuz I Love You", genre: "Pop" },
                { id: 84, title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", album: "Uptown Special", genre: "Funk" },
                { id: 85, title: "Walking on Sunshine", artist: "Katrina and the Waves", album: "Walking on Sunshine", genre: "Rock" },
                { id: 86, title: "I Gotta Feeling", artist: "The Black Eyed Peas", album: "The E.N.D.", genre: "Hip-Hop" },
                { id: 87, title: "Don't Stop Me Now", artist: "Queen", album: "Jazz", genre: "Rock" },
                { id: 88, title: "September", artist: "Earth, Wind & Fire", album: "The Best of Earth, Wind & Fire", genre: "R&B" },
                { id: 89, title: "Good Vibrations", artist: "The Beach Boys", album: "Smiley Smile", genre: "Rock" },
                { id: 90, title: "Three Little Birds", artist: "Bob Marley", album: "Exodus", genre: "Reggae" }
            ],
            sadness: [
                { id: 91, title: "Someone Like You", artist: "Adele", album: "21", genre: "Pop" },
                { id: 92, title: "Mad World", artist: "Gary Jules", album: "Trading Snakeoil for Wolftickets", genre: "Alternative" },
                { id: 93, title: "The Sound of Silence", artist: "Simon & Garfunkel", album: "Sounds of Silence", genre: "Folk" },
                { id: 94, title: "Everybody Hurts", artist: "R.E.M.", album: "Automatic for the People", genre: "Alternative" },
                { id: 95, title: "Hallelujah", artist: "Jeff Buckley", album: "Grace", genre: "Alternative" },
                { id: 96, title: "Black", artist: "Pearl Jam", album: "Ten", genre: "Grunge" },
                { id: 97, title: "Creep", artist: "Radiohead", album: "Pablo Honey", genre: "Alternative" },
                { id: 98, title: "Hurt", artist: "Nine Inch Nails", album: "The Downward Spiral", genre: "Industrial" },
                { id: 99, title: "Skinny Love", artist: "Bon Iver", album: "For Emma, Forever Ago", genre: "Indie Folk" },
                { id: 100, title: "The Night We Met", artist: "Lord Huron", album: "Strange Trails", genre: "Indie Folk" }
            ],
            anger: [
                { id: 101, title: "Break Stuff", artist: "Limp Bizkit", album: "Significant Other", genre: "Nu Metal" },
                { id: 102, title: "Bodies", artist: "Drowning Pool", album: "Sinner", genre: "Nu Metal" },
                { id: 103, title: "Chop Suey!", artist: "System of a Down", album: "Toxicity", genre: "Metal" },
                { id: 104, title: "B.Y.O.B.", artist: "System of a Down", album: "Mezmerize", genre: "Metal" },
                { id: 105, title: "Killing in the Name", artist: "Rage Against the Machine", album: "Rage Against the Machine", genre: "Rap Metal" },
                { id: 106, title: "Freak on a Leash", artist: "Korn", album: "Follow the Leader", genre: "Nu Metal" },
                { id: 107, title: "Stronger", artist: "Kanye West", album: "Graduation", genre: "Hip-Hop" },
                { id: 108, title: "Till I Collapse", artist: "Eminem", album: "The Eminem Show", genre: "Hip-Hop" },
                { id: 109, title: "Lose Yourself", artist: "Eminem", album: "8 Mile Soundtrack", genre: "Hip-Hop" },
                { id: 110, title: "Pump It", artist: "The Black Eyed Peas", album: "Monkey Business", genre: "Hip-Hop" }
            ],
            fear: [
                { id: 111, title: "Mad World", artist: "Tears for Fears", album: "The Hurting", genre: "New Wave" },
                { id: 112, title: "Breathe Me", artist: "Sia", album: "Colour the Small One", genre: "Pop" },
                { id: 113, title: "Heavy", artist: "Linkin Park ft. Kiiara", album: "One More Light", genre: "Alternative" },
                { id: 114, title: "Numb", artist: "Linkin Park", album: "Meteora", genre: "Nu Metal" },
                { id: 115, title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", genre: "Nu Metal" },
                { id: 116, title: "Crawling", artist: "Linkin Park", album: "Hybrid Theory", genre: "Nu Metal" },
                { id: 117, title: "Anxiety", artist: "Julia Michaels ft. Selena Gomez", album: "Single", genre: "Pop" },
                { id: 118, title: "Stressed Out", artist: "Twenty One Pilots", album: "Blurryface", genre: "Alternative" },
                { id: 119, title: "Heathens", artist: "Twenty One Pilots", album: "Suicide Squad Soundtrack", genre: "Alternative" },
                { id: 120, title: "Car Radio", artist: "Twenty One Pilots", album: "Vessel", genre: "Alternative" }
            ]
        };

        return generalSongs[emotion] || generalSongs.joy;
    }
}

export default SpotifyService;
import React, { useState } from 'react';
import { Moon, Sun, Music, Send, ArrowLeft, Heart, Smile, Activity, Save, History, Clock, Trash2 } from 'lucide-react';
import MusicRecommenderMQTT from './mqtt/MQTTClient';
import mqttConfig from './config/mqttConfig';
import SpotifyService from './services/SpotifyAPI';
import SentimentAnalyzer from './services/SentimentAnalysis';

const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark(!isDark);

    const theme = {
        isDark,
        toggleTheme,
        colors: {
            primary: '#4300FF',
            secondary: '#0065F8',
            tertiary: '#00CAFF',
            accent: '#08D9D6',
            background: isDark ? '#0a0a0a' : '#ffffff',
            surface: isDark ? '#1a1a1a' : '#f8f9fa',
            text: isDark ? '#ffffff' : '#1a1a1a',
            textSecondary: isDark ? '#a0a0a0' : '#6b7280',
            border: isDark ? '#333333' : '#e5e7eb',
            cardBg: isDark ? '#1f1f1f' : '#ffffff',
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            <div
                className="min-h-screen transition-colors duration-300"
                style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const Header = ({ onNavigateHome, onNavigateHistory, currentPage, currentUser, onLogout }) => {
    const theme = useTheme();

    return (
        <header className="border-b transition-colors duration-300 sticky top-0 z-50 backdrop-blur-sm"
            style={{
                borderColor: theme.colors.border,
                backgroundColor: `${theme.colors.background}95`
            }}>
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={onNavigateHome}
                >
                    <div
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: theme.colors.primary }}
                    >
                        <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">MoodTunes</h1>
                        <p
                            className="text-sm"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            AI-Powered Music Recommendations
                        </p>
                    </div>
                </div>                <div className="flex items-center space-x-2">
                    {currentUser && (
                        <>
                            <div className="text-sm mr-4" style={{ color: theme.colors.textSecondary }}>
                                Logged in as <span className="font-semibold">{currentUser.name}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 mr-2"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    border: `1px solid ${theme.colors.border}`,
                                    color: theme.colors.text
                                }}
                            >
                                <span className="text-sm">Logout</span>
                            </button>
                        </>
                    )}
                    {currentPage !== 'history' && (
                        <button
                            onClick={onNavigateHistory}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                            style={{
                                backgroundColor: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.text
                            }}
                        >
                            <History className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">History</span>
                        </button>
                    )}

                    <button
                        onClick={theme.toggleTheme}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`
                        }}
                    >
                        {theme.isDark ? (
                            <Sun className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        ) : (
                            <Moon className="w-5 h-5" style={{ color: theme.colors.primary }} />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

const LoginPage = ({ onLogin, isLoading, error }) => {
    const theme = useTheme();
    
    return (
        <div className="max-w-md mx-auto mt-20 p-6 rounded-xl"
            style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
            <h2 className="text-2xl font-bold mb-6">Login to MoodTunes</h2>
            
            {error && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">
                    {error}
                </div>
            )}
            
            <div className="space-y-4">
                <button
                    onClick={() => onLogin('jim')}
                    disabled={isLoading}
                    className="w-full p-3 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                        backgroundColor: theme.colors.primary,
                        color: '#ffffff'
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login as Jim'}
                </button>
                
                <button
                    onClick={() => onLogin('stephanie')}
                    disabled={isLoading}
                    className="w-full p-3 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                        backgroundColor: theme.colors.secondary,
                        color: '#ffffff'
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login as Stephanie'}
                </button>
            </div>
        </div>
    );
};

const GenrePreferenceSelector = ({ currentUser, onGenreSelected, onSkip }) => {
    const theme = useTheme();
    const [selectedGenre, setSelectedGenre] = useState('');

    const genres = [
        { id: 'pop', name: 'Pop', description: 'Mainstream, catchy, popular music', icon: '🎵' },
        { id: 'indie', name: 'Indie', description: 'Alternative, underground, artistic', icon: '🎸' },
        { id: 'hip-hop', name: 'Hip-Hop', description: 'Rap, urban, rhythmic beats', icon: '🎤' },
        { id: 'electronic', name: 'Electronic', description: 'EDM, house, techno, synth', icon: '🎛️' },
        { id: 'jazz', name: 'Jazz', description: 'Smooth, sophisticated, improvised', icon: '🎺' },
        { id: 'country', name: 'Country', description: 'Folk, americana, southern', icon: '🤠' },
        { id: 'latin', name: 'Latin', description: 'Reggaeton, salsa, bachata', icon: '💃' },
        { id: 'rock', name: 'Rock', description: 'Guitar-driven, energetic', icon: '🤘' }
    ];

    const handleGenreSelect = (genreId) => {
        setSelectedGenre(genreId);
        onGenreSelected(genreId);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                    Choose Your Preferred 
                    <span
                        className="ml-2"
                        style={{ color: theme.colors.primary }}
                    >
                        Music Genre
                    </span>
                </h2>
                <p
                    className="text-lg max-w-2xl mx-auto mb-4"
                    style={{ color: theme.colors.textSecondary }}
                >
                    Help us personalize your music recommendations by selecting your favorite genre.
                </p>
                <p
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                >
                    Welcome, <strong>{currentUser.name}</strong>! You can always change this later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {genres.map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => handleGenreSelect(genre.id)}
                        className="p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-center"
                        style={{
                            backgroundColor: selectedGenre === genre.id ? `${theme.colors.primary}20` : theme.colors.surface,
                            borderColor: selectedGenre === genre.id ? theme.colors.primary : theme.colors.border,
                            color: theme.colors.text
                        }}
                    >
                        <div className="text-3xl mb-3">{genre.icon}</div>
                        <h3 className="text-lg font-semibold mb-2">{genre.name}</h3>
                        <p 
                            className="text-sm"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            {genre.description}
                        </p>
                    </button>
                ))}
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={onSkip}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.text
                    }}
                >
                    Skip for Now
                </button>
                
                {selectedGenre && (
                    <button
                        onClick={() => onGenreSelected(selectedGenre)}
                        className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: theme.colors.primary,
                            color: 'white'
                        }}
                    >
                        Continue with {genres.find(g => g.id === selectedGenre)?.name}
                    </button>
                )}
            </div>
        </div>
    );
};

const TextInputPage = ({ onSubmit, currentUser, isLoading, error }) => {
    const [text, setText] = useState('');
    const [selectedExample, setSelectedExample] = useState('');
    const theme = useTheme();

    // Customize examples based on user preferences
    const examples = currentUser ? [
        `I'm in the mood for some ${currentUser.preferredGenre || 'great'} music today!`,
        "Just got promoted at work! I'm so excited and energized right now!",
        "Had a rough day at work, feeling stressed and need something to calm down.",
        "It's a beautiful sunny morning and I'm ready to conquer the world!",
        "Missing my best friend who moved away last month. Feeling a bit lonely.",
        "Celebrating my anniversary with my partner. Love is in the air!",
        
        // Spanish examples for Latin music testing
        "¡Estoy súper feliz hoy! Quiero celebrar con música alegre.",
        "Me siento un poco triste, necesito canciones que me levanten el ánimo.",
        "¡Tengo ganas de bailar! Dame reggaeton y salsa.",
        "Estoy nostálgico, extraño mi país y mi familia.",
        "Muy enojado con la situación, necesito música para desahogarme.",
        "Me siento nervioso por la entrevista de mañana."
    ] : [
        "I'm feeling nostalgic today, thinking about old memories and simpler times.",
        "Just got promoted at work! I'm so excited and energized right now!",
        "Had a rough day at work, feeling stressed and need something to calm down.",
        "It's a beautiful sunny morning and I'm ready to conquer the world!",
        "Missing my best friend who moved away last month. Feeling a bit lonely.",
        "Celebrating my anniversary with my partner. Love is in the air!",
        
        // Spanish examples for testing
        "¡Estoy muy feliz hoy! Quiero música latina para bailar.",
        "Me siento triste, necesito bachata o boleros.",
        "Tengo mucha energía, dame reggaeton!",
        "Estoy enojado, quiero rock en español."
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text.trim());
        }
    };

    const selectExample = (example) => {
        setText(example);
        setSelectedExample(example);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                    Discover Music Based on Your
                    <span
                        className="ml-2"
                        style={{ color: theme.colors.primary }}
                    >
            Mood
          </span>
                </h2>
                <p
                    className="text-lg max-w-2xl mx-auto"
                    style={{ color: theme.colors.textSecondary }}
                >
                    Share your thoughts, feelings, or what's on your mind. Our AI will analyze your text and recommend the perfect songs to match your mood.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="text-input"
                        className="block text-sm font-medium mb-2"
                    >
                        Tell us how you're feeling or what's on your mind
                    </label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Express your thoughts, emotions, or describe your current situation..."
                        rows={6}
                        className="w-full rounded-xl p-4 text-base transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                        style={{
                            backgroundColor: theme.colors.surface,
                            border: `2px solid ${theme.colors.border}`,
                            color: theme.colors.text,
                        }}
                        onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || isLoading}
                        className="px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{
                            backgroundColor: (text.trim() && !isLoading) ? theme.colors.primary : theme.colors.border,
                            color: 'white'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Analyze & Get Recommendations</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-center">
                    Need inspiration? Try one of these examples:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {examples.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => selectExample(example)}
                            className="p-4 text-left rounded-lg transition-all duration-200 hover:scale-[1.02] border"
                            style={{
                                backgroundColor: selectedExample === example ? `${theme.colors.primary}20` : theme.colors.surface,
                                borderColor: selectedExample === example ? theme.colors.primary : theme.colors.border,
                                color: theme.colors.text
                            }}
                        >
                            <p className="text-sm leading-relaxed">{example}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ResultsPage = ({ analysis, onNavigateBack, onSaveAnalysis, savedAnalyses }) => {
    const theme = useTheme();
    const [isSaved, setIsSaved] = useState(false);

    // Check if this analysis is already saved
    React.useEffect(() => {
        if (analysis && analysis.text) {
            const isAlreadySaved = savedAnalyses.some(savedAnalysis => savedAnalysis.text === analysis.text);
            setIsSaved(isAlreadySaved);
        }
    }, [analysis, savedAnalyses]);

    // Generate dynamic AI insight based on sentiment
    const generateAIInsight = (moodAnalysis, sentimentScores, text) => {
        if (!moodAnalysis || moodAnalysis.length === 0) return "Analysis complete.";
        
        const primaryMood = moodAnalysis[0];
        const percentage = primaryMood.percentage;
        const moodName = primaryMood.mood.toLowerCase();
        
        // Detect if Latin/Spanish context
        const isLatinContext = /latin|fiesta|dancing|reggaeton|salsa|bachata|español/i.test(text);
        
        let insight = "";
        
        if (moodName === 'happy') {
            if (percentage > 70) {
                insight = isLatinContext 
                    ? `Your text radiates pure joy and energy! Perfect for upbeat Latin rhythms like reggaeton and salsa.`
                    : `Your text shows overwhelming positivity with ${percentage}% happiness. Perfect for upbeat, energetic music!`;
            } else if (percentage > 40) {
                insight = isLatinContext
                    ? `You're feeling good vibes! Time for some celebratory Latin music to match your mood.`
                    : `You're feeling quite positive today. Great for uplifting music that matches your optimistic energy.`;
            } else {
                insight = `You're experiencing moderate happiness. Gentle, positive music would complement your mood well.`;
            }
        } else if (moodName === 'sad') {
            if (percentage > 60) {
                insight = isLatinContext
                    ? `You're going through a tough time. Let some soulful bachata or boleros help you process these feelings.`
                    : `You're feeling quite down with ${percentage}% sadness. Gentle, comforting music might help you through this.`;
            } else {
                insight = `You seem a bit melancholic. Some reflective music could resonate with your current state.`;
            }
        } else if (moodName === 'angry') {
            insight = isLatinContext
                ? `You're feeling intense emotions! High-energy reggaeton or Latin rock could be the perfect outlet.`
                : `You're experiencing anger and frustration. Powerful, energetic music might help you channel these feelings.`;
        } else if (moodName === 'anxious') {
            insight = isLatinContext
                ? `You're feeling nervous. Some calming nueva canción or gentle acoustic Latin music might help soothe you.`
                : `You're feeling anxious. Calm, peaceful music could help ease your worries.`;
        } else {
            insight = `Your emotions are complex. Let music be your companion through this journey.`;
        }
        
        return insight;
    };

    if (!analysis) {
        return <div>No analysis data available</div>;
    }

    const { text, moodAnalysis, songs, sentimentScores } = analysis;
    const aiInsight = generateAIInsight(moodAnalysis, sentimentScores, text);

    const handleSave = () => {
        if (!isSaved) {
            const analysisData = {
                id: Date.now(),
                ...analysis
            };
            onSaveAnalysis(analysisData);
            setIsSaved(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={onNavigateBack}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.text
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Analyze New Text</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div
                        className="p-6 rounded-xl border"
                        style={{
                            backgroundColor: theme.colors.cardBg,
                            borderColor: theme.colors.border
                        }}
                    >
                        <h3 className="text-xl font-bold mb-4">Mood Analysis</h3>

                        <div
                            className="p-4 rounded-lg mb-4 text-sm"
                            style={{
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.textSecondary
                            }}
                        >
                            <strong>Your Text:</strong> "{text.length > 100 ? text.substring(0, 100) + '...' : text}"
                        </div>

                        <div className="space-y-3">
                            {moodAnalysis.map((mood, index) => {
                                const IconComponent = mood.icon;
                                return (
                                    <div
                                        key={index}
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: theme.colors.surface,
                                            borderColor: theme.colors.border
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <IconComponent className="w-5 h-5" style={{ color: mood.color }} />
                                                <span className="font-medium">{mood.mood}</span>
                                            </div>
                                            <span className="font-bold" style={{ color: mood.color }}>{mood.percentage}%</span>
                                        </div>
                                        <div
                                            className="w-full rounded-full h-2"
                                            style={{ backgroundColor: theme.colors.border }}
                                        >
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${mood.percentage}%`,
                                                    backgroundColor: mood.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            className="mt-4 p-3 rounded-lg text-sm"
                            style={{
                                backgroundColor: `${theme.colors.primary}15`,
                                color: theme.colors.textSecondary
                            }}
                        >
                            <strong>AI Insight:</strong> {aiInsight}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div
                        className="p-6 rounded-xl border"
                        style={{
                            backgroundColor: theme.colors.cardBg,
                            borderColor: theme.colors.border
                        }}
                    >
                        <h3 className="text-xl font-bold mb-4">Recommended Songs</h3>
                        <p
                            className="mb-6"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            Based on your mood analysis, here are 10 songs perfectly matched to your current vibe:
                        </p>

                        <div className="space-y-3">
                            {songs.map((song, index) => (
                                <div
                                    key={song.id}
                                    className="flex items-center p-4 rounded-lg transition-all duration-200 hover:scale-[1.01] border"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4"
                                        style={{ backgroundColor: theme.colors.primary }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{song.title}</h4>
                                        <p
                                            className="text-sm"
                                            style={{ color: theme.colors.textSecondary }}
                                        >
                                            {song.artist} • {song.album}
                                        </p>
                                    </div>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: `${theme.colors.tertiary}20`,
                                            color: theme.colors.tertiary
                                        }}
                                    >
                    {song.genre}
                  </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-center space-x-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaved}
                                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{
                                    backgroundColor: isSaved ? theme.colors.border : theme.colors.accent,
                                    color: isSaved ? theme.colors.textSecondary : 'white'
                                }}
                            >
                                <Save className="w-5 h-5" />
                                <span>{isSaved ? 'Saved' : 'Save Analysis'}</span>
                            </button>

                            <button
                                onClick={onNavigateBack}
                                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: theme.colors.secondary,
                                    color: 'white'
                                }}
                            >
                                Discover More Music
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryPage = ({ savedAnalyses, onNavigateBack, onViewAnalysis, onDeleteAnalysis }) => {
    const theme = useTheme();

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getPrimaryMood = (moodAnalysis) => {
        return moodAnalysis.reduce((prev, current) =>
            prev.percentage > current.percentage ? prev : current
        );
    };

    if (savedAnalyses.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <button
                        onClick={onNavigateBack}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.text
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </button>
                </div>

                <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                    <h2 className="text-2xl font-bold mb-2">No Saved Analyses</h2>
                    <p style={{ color: theme.colors.textSecondary }}>
                        Start analyzing your mood and save your results to see them here!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={onNavigateBack}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.text
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>

                <h1 className="text-2xl font-bold">Your Saved Analyses</h1>
                <div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedAnalyses.map((analysis) => {
                    const primaryMood = getPrimaryMood(analysis.moodAnalysis);
                    const IconComponent = primaryMood.icon;

                    return (
                        <div
                            key={analysis.id}
                            className="border rounded-xl p-6 transition-all duration-200 hover:scale-[1.02]"
                            style={{
                                backgroundColor: theme.colors.cardBg,
                                borderColor: theme.colors.border
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <IconComponent
                                        className="w-5 h-5"
                                        style={{ color: primaryMood.color }}
                                    />
                                    <span className="font-semibold" style={{ color: primaryMood.color }}>
                    {primaryMood.mood}
                  </span>
                                    <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {primaryMood.percentage}%
                  </span>
                                </div>

                                <button
                                    onClick={() => onDeleteAnalysis(analysis.id)}
                                    className="p-1 rounded transition-colors hover:bg-red-100"
                                    style={{ color: theme.colors.textSecondary }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p
                                className="text-sm mb-4 line-clamp-3"
                                style={{ color: theme.colors.text }}
                            >
                                {analysis.text.length > 120 ? analysis.text.substring(0, 120) + '...' : analysis.text}
                            </p>

                            <div className="flex items-center justify-between text-xs mb-4" style={{ color: theme.colors.textSecondary }}>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(analysis.timestamp)}</span>
                                </div>
                                <span>{analysis.songs.length} songs</span>
                            </div>

                            <button
                                onClick={() => onViewAnalysis(analysis)}
                                className="w-full py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    color: 'white'
                                }}
                            >
                                View Analysis
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('login'); // Start with login
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [savedAnalyses, setSavedAnalyses] = useState([]);
    const mqttClient = React.useRef(new MusicRecommenderMQTT(mqttConfig)).current;
    const spotifyService = React.useRef(new SpotifyService()).current;
    const sentimentAnalyzer = React.useRef(new SentimentAnalyzer()).current;

    const handleTextSubmit = async (text) => {
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('🎯 Starting sentiment analysis and music recommendations...');
            
            // Perform sentiment analysis
            const sentimentScores = await sentimentAnalyzer.analyzeSentiment(text, currentUser?.id);
            console.log('📊 Sentiment scores:', sentimentScores);
            
            // Get user preferences for Spotify
            const userPreferences = currentUser ? {
                preferredGenre: currentUser.preferredGenre || (currentUser.name === 'Jim' ? 'country' : 'pop'),
                inputText: text
            } : { inputText: text };
            
            // Get Spotify recommendations based on sentiment
            const spotifyRecommendations = await spotifyService.getRecommendations(sentimentScores, userPreferences);
            console.log('🎵 Spotify recommendations:', spotifyRecommendations);
            
            // Save session to MQTT
            await mqttClient.saveSession(text, sentimentScores, spotifyRecommendations);
            
            // Convert sentiment scores to mood analysis format for UI
            const moodAnalysis = [
                { mood: 'Happy', percentage: Math.round(sentimentScores.joy * 100), icon: Smile, color: '#08D9D6' },
                { mood: 'Sad', percentage: Math.round(sentimentScores.sadness * 100), icon: Heart, color: '#0065F8' },
                { mood: 'Angry', percentage: Math.round(sentimentScores.anger * 100), icon: Activity, color: '#FF4444' },
                { mood: 'Anxious', percentage: Math.round(sentimentScores.fear * 100), icon: Activity, color: '#FFA500' }
            ].filter(mood => mood.percentage > 0).sort((a, b) => b.percentage - a.percentage);
            
            // Set current analysis with real data
            setCurrentAnalysis({
                text,
                timestamp: new Date().toISOString(),
                moodAnalysis,
                songs: spotifyRecommendations,
                sentimentScores
            });

            console.log('✅ Analysis complete, navigating to results');
            setCurrentPage('results');
        } catch (err) {
            setError('Failed to analyze text: ' + err.message);
            console.error('❌ Text analysis failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAnalysis = (analysisData) => {
        setSavedAnalyses(prev => [...prev, analysisData]);
    };

    const handleViewAnalysis = (analysis) => {
        setCurrentAnalysis(analysis);
        setCurrentPage('results');
    };

    const handleDeleteAnalysis = (analysisId) => {
        setSavedAnalyses(prev => prev.filter(a => a.id !== analysisId));
    };

    const handleNavigateBack = () => setCurrentPage('home');

    const handleLogin = async (username) => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await mqttClient.login(username);
            setCurrentUser(user);
            setCurrentPage('genre-selection');
        } catch (err) {
            setError(err.message);
            console.error('Login failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenreSelected = (genreId) => {
        setCurrentUser(prev => ({ ...prev, preferredGenre: genreId }));
        setCurrentPage('home');
    };

    const handleSkipGenreSelection = () => {
        setCurrentPage('home');
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await mqttClient.logout();
            setCurrentUser(null);
            setCurrentPage('login');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToHome = () => setCurrentPage('home');
    const navigateToHistory = () => setCurrentPage('history');

    return (
        <ThemeProvider>
            <div className="min-h-screen">
                <Header
                    onNavigateHome={navigateToHome}
                    onNavigateHistory={navigateToHistory}
                    currentPage={currentPage}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                />
                
                <main className="max-w-6xl mx-auto px-4 py-8">
                    {!currentUser ? (
                        <LoginPage
                            onLogin={handleLogin}
                            isLoading={isLoading}
                            error={error}
                        />
                    ) : currentPage === 'genre-selection' ? (
                        <GenrePreferenceSelector
                            currentUser={currentUser}
                            onGenreSelected={handleGenreSelected}
                            onSkip={handleSkipGenreSelection}
                        />
                    ) : currentPage === 'history' ? (
                        <HistoryPage
                            savedAnalyses={savedAnalyses}
                            onNavigateBack={handleNavigateBack}
                            onViewAnalysis={handleViewAnalysis}
                            onDeleteAnalysis={handleDeleteAnalysis}
                        />
                    ) : currentPage === 'results' ? (
                        <ResultsPage
                            analysis={currentAnalysis}
                            onNavigateBack={handleNavigateBack}
                            onSaveAnalysis={handleSaveAnalysis}
                            savedAnalyses={savedAnalyses}
                        />
                    ) : (
                        <TextInputPage 
                            onSubmit={handleTextSubmit}
                            currentUser={currentUser}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}
                </main>
            </div>
        </ThemeProvider>
    );
};

export default App;
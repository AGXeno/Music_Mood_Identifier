import React, { useState } from 'react';
import { Moon, Sun, Music, Send, ArrowLeft, Heart, Smile, Activity, Save, History, Clock, Trash2 } from 'lucide-react';

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

const Header = ({ onNavigateHome, onNavigateHistory, currentPage }) => {
    const theme = useTheme();

    return (
        <header
            className="border-b transition-colors duration-300 sticky top-0 z-50 backdrop-blur-sm"
            style={{
                borderColor: theme.colors.border,
                backgroundColor: `${theme.colors.background}95`
            }}
        >
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
                </div>

                <div className="flex items-center space-x-2">
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

const TextInputPage = ({ onSubmit }) => {
    const [text, setText] = useState('');
    const [selectedExample, setSelectedExample] = useState('');
    const theme = useTheme();

    const examples = [
        "I'm feeling nostalgic today, thinking about old memories and simpler times.",
        "Just got promoted at work! I'm so excited and energized right now!",
        "Had a rough day at work, feeling stressed and need something to calm down.",
        "It's a beautiful sunny morning and I'm ready to conquer the world!",
        "Missing my best friend who moved away last month. Feeling a bit lonely.",
        "Celebrating my anniversary with my partner. Love is in the air!",
        "Stuck in traffic again... this is so frustrating and boring.",
        "Just finished an amazing workout. Feeling strong and motivated!"
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
                        disabled={!text.trim()}
                        className="px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{
                            backgroundColor: text.trim() ? theme.colors.primary : theme.colors.border,
                            color: 'white'
                        }}
                    >
                        <Send className="w-5 h-5" />
                        <span>Analyze & Get Recommendations</span>
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

const ResultsPage = ({ text, onNavigateBack, onSaveAnalysis, savedAnalyses }) => {
    const theme = useTheme();
    const [isSaved, setIsSaved] = useState(false);

    const mockMoodAnalysis = [
        { mood: 'Happy', percentage: 65, icon: Smile, color: theme.colors.accent },
        { mood: 'Excited', percentage: 25, icon: Activity, color: theme.colors.tertiary },
        { mood: 'Nostalgic', percentage: 10, icon: Heart, color: theme.colors.secondary }
    ];

    const mockSongs = [
        { id: 1, title: "Good as Hell", artist: "Lizzo", album: "Cuz I Love You", genre: "Pop" },
        { id: 2, title: "Happy", artist: "Pharrell Williams", album: "Girl", genre: "Pop" },
        { id: 3, title: "Can't Stop the Feeling!", artist: "Justin Timberlake", album: "Trolls Soundtrack", genre: "Pop" },
        { id: 4, title: "Walking on Sunshine", artist: "Katrina and the Waves", album: "Walking on Sunshine", genre: "Rock" },
        { id: 5, title: "I Gotta Feeling", artist: "The Black Eyed Peas", album: "The E.N.D.", genre: "Hip-Hop" },
        { id: 6, title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", album: "Uptown Special", genre: "Funk" },
        { id: 7, title: "Don't Stop Me Now", artist: "Queen", album: "Jazz", genre: "Rock" },
        { id: 8, title: "September", artist: "Earth, Wind & Fire", album: "The Best of Earth, Wind & Fire", genre: "R&B" },
        { id: 9, title: "Good Vibrations", artist: "The Beach Boys", album: "Smiley Smile", genre: "Rock" },
        { id: 10, title: "Three Little Birds", artist: "Bob Marley", album: "Exodus", genre: "Reggae" }
    ];

    // Check if this analysis is already saved
    React.useEffect(() => {
        const isAlreadySaved = savedAnalyses.some(analysis => analysis.text === text);
        setIsSaved(isAlreadySaved);
    }, [text, savedAnalyses]);

    const handleSave = () => {
        if (!isSaved) {
            const analysisData = {
                id: Date.now(),
                text,
                timestamp: new Date().toISOString(),
                moodAnalysis: mockMoodAnalysis,
                songs: mockSongs
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
                            {mockMoodAnalysis.map((mood, index) => {
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
                            <strong>AI Insight:</strong> Your text shows predominantly positive emotions with high energy levels. Perfect for upbeat, motivational music!
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
                            {mockSongs.map((song, index) => (
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
    const [currentPage, setCurrentPage] = useState('input');
    const [analyzedText, setAnalyzedText] = useState('');
    const [savedAnalyses, setSavedAnalyses] = useState([]);

    const handleTextSubmit = (text) => {
        setAnalyzedText(text);
        setCurrentPage('results');
    };

    const handleNavigateBack = () => {
        setCurrentPage('input');
    };

    const handleNavigateHome = () => {
        setCurrentPage('input');
    };

    const handleNavigateHistory = () => {
        setCurrentPage('history');
    };

    const handleSaveAnalysis = (analysisData) => {
        setSavedAnalyses(prev => [analysisData, ...prev]);
    };

    const handleViewAnalysis = (analysis) => {
        setAnalyzedText(analysis.text);
        setCurrentPage('results');
    };

    const handleDeleteAnalysis = (analysisId) => {
        setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen">
                <Header
                    onNavigateHome={handleNavigateHome}
                    onNavigateHistory={handleNavigateHistory}
                    currentPage={currentPage}
                />
                <main>
                    {currentPage === 'input' && (
                        <TextInputPage onSubmit={handleTextSubmit} />
                    )}
                    {currentPage === 'results' && (
                        <ResultsPage
                            text={analyzedText}
                            onNavigateBack={handleNavigateBack}
                            onSaveAnalysis={handleSaveAnalysis}
                            savedAnalyses={savedAnalyses}
                        />
                    )}
                    {currentPage === 'history' && (
                        <HistoryPage
                            savedAnalyses={savedAnalyses}
                            onNavigateBack={handleNavigateBack}
                            onViewAnalysis={handleViewAnalysis}
                            onDeleteAnalysis={handleDeleteAnalysis}
                        />
                    )}
                </main>
            </div>
        </ThemeProvider>
    );
};

export default App;
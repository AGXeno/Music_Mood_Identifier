import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun, Music, Send, ArrowLeft, Heart, Smile, Activity, Save, History, Clock, Trash2, Globe } from 'lucide-react';
import MusicRecommenderMQTT from './mqtt/MQTTClient';
import mqttConfig from './config/mqttConfig';
import SpotifyService from './services/SpotifyAPI.jsx';
import TensorFlowSentimentAnalyzer from './services/TensorFlowSentimentAnalyzer';

// Translation files
const translations = {
    en: {
        // Header
        appTitle: "MoodTunes",
        appSubtitle: "AI-Powered Music Recommendations",
        loggedInAs: "Logged in as",
        logout: "Logout",
        history: "History",
        backToHome: "Back to Home",

        // Login Page
        loginTitle: "Login to MoodTunes",
        loginAsJim: "Login as Jim",
        loginAsStephanie: "Login as Stephanie",
        loggingIn: "Logging in...",

        // Genre Selection
        chooseGenre: "Choose Your Preferred",
        musicGenre: "Music Genres",
        genreDescription: "Help us personalize your music recommendations by selecting up to 3 favorite genres.",
        welcomeUser: "Welcome, {name}! You can always change these later.",
        skipForNow: "Skip for Now",
        continueWith: "Continue with Selected Genres",
        maxGenresMessage: "You can select up to 3 genres",
        genreSelectionLeft: "genre selection remaining",
        genreSelectionsLeft: "genre selections remaining",
        saving: "Saving...",

        // Genres
        genres: {
            pop: { name: "Pop", description: "Mainstream, catchy, popular music" },
            indie: { name: "Indie", description: "Alternative, underground, artistic" },
            "hip-hop": { name: "Hip-Hop", description: "Rap, urban, rhythmic beats" },
            electronic: { name: "Electronic", description: "EDM, house, techno, synth" },
            jazz: { name: "Jazz", description: "Smooth, sophisticated, improvised" },
            country: { name: "Country", description: "Folk, americana, southern" },
            latin: { name: "Latin", description: "Reggaeton, salsa, bachata" },
            rock: { name: "Rock", description: "Guitar-driven, energetic" }
        },

        // Text Input Page
        discoverMusic: "Discover Music Based on Your",
        mood: "Mood",
        moodDescription: "Share your thoughts, feelings, or what's on your mind. Our AI will analyze your text and recommend the perfect songs to match your mood.",
        tellUsFeelings: "Tell us how you're feeling or what's on your mind",
        textPlaceholder: "Express your thoughts, emotions, or describe your current situation...",
        analyzing: "Analyzing...",
        analyzeButton: "Analyze & Get Recommendations",
        needInspiration: "Need inspiration? Try one of these examples:",
        error: "Error:",

        // Examples
        examples: [
            "I'm feeling nostalgic today, thinking about old memories and simpler times.",
            "Just got promoted at work! I'm so excited and energized right now!",
            "Had a rough day at work, feeling stressed and need something to calm down.",
            "It's a beautiful sunny morning and I'm ready to conquer the world!",
            "Missing my best friend who moved away last month. Feeling a bit lonely.",
            "Celebrating my anniversary with my partner. Love is in the air!"
        ],

        // Results Page
        analyzeNewText: "Analyze New Text",
        moodAnalysis: "Mood Analysis",
        yourText: "Your Text:",
        aiInsight: "AI Insight:",
        recommendedSongs: "Recommended Songs",
        songsDescription: "Based on your mood analysis, here are 10 songs perfectly matched to your current vibe:",
        saved: "Saved",
        saveAnalysis: "Save Analysis",
        discoverMore: "Discover More Music",

        // Moods
        moods: {
            Happy: "Happy",
            Sad: "Sad",
            Angry: "Angry",
            Anxious: "Anxious"
        },

        // History Page
        yourSavedAnalyses: "Your Saved Analyses",
        noSavedAnalyses: "No Saved Analyses",
        noSavedDescription: "Start analyzing your mood and save your results to see them here!",
        viewAnalysis: "View Analysis",
        songs: "songs"
    },
    es: {
        // Header
        appTitle: "MoodTunes",
        appSubtitle: "Recomendaciones Musicales con IA",
        loggedInAs: "Conectado como",
        logout: "Cerrar Sesión",
        history: "Historial",
        backToHome: "Volver al Inicio",

        // Login Page
        loginTitle: "Ingresar a MoodTunes",
        loginAsJim: "Ingresar como Jim",
        loginAsStephanie: "Ingresar como Stephanie",
        loggingIn: "Ingresando...",

        // Genre Selection
        chooseGenre: "Elige tus",
        musicGenre: "Géneros Musicales",
        genreDescription: "Ayúdanos a personalizar tus recomendaciones musicales seleccionando hasta 3 géneros favoritos.",
        welcomeUser: "¡Bienvenido/a, {name}! Puedes cambiar esto más tarde.",
        skipForNow: "Omitir por Ahora",
        continueWith: "Continuar con Géneros Seleccionados",
        maxGenresMessage: "Puedes seleccionar hasta 3 géneros",
        genreSelectionLeft: "género restante",
        genreSelectionsLeft: "géneros restantes",
        saving: "Guardando...",

        // Genres
        genres: {
            pop: { name: "Pop", description: "Música popular, pegadiza, mainstream" },
            indie: { name: "Indie", description: "Alternativo, underground, artístico" },
            "hip-hop": { name: "Hip-Hop", description: "Rap, urbano, ritmos pegadizos" },
            electronic: { name: "Electrónica", description: "EDM, house, techno, sintetizadores" },
            jazz: { name: "Jazz", description: "Suave, sofisticado, improvisado" },
            country: { name: "Country", description: "Folk, americana, sureño" },
            latin: { name: "Latino", description: "Reggaeton, salsa, bachata" },
            rock: { name: "Rock", description: "Guitarra protagonista, energético" }
        },

        // Text Input Page
        discoverMusic: "Descubre Música Basada en Tu",
        mood: "Estado de Ánimo",
        moodDescription: "Comparte tus pensamientos, sentimientos o lo que tienes en mente. Nuestra IA analizará tu texto y recomendará las canciones perfectas para tu estado de ánimo.",
        tellUsFeelings: "Cuéntanos cómo te sientes o qué tienes en mente",
        textPlaceholder: "Expresa tus pensamientos, emociones o describe tu situación actual...",
        analyzing: "Analizando...",
        analyzeButton: "Analizar y Obtener Recomendaciones",
        needInspiration: "¿Necesitas inspiración? Prueba uno de estos ejemplos:",
        error: "Error:",

        // Examples
        examples: [
            "Me siento nostálgico hoy, pensando en viejos recuerdos y tiempos más simples.",
            "¡Me ascendieron en el trabajo! ¡Estoy muy emocionado y lleno de energía!",
            "Tuve un día difícil en el trabajo, me siento estresado y necesito algo para calmarme.",
            "¡Es una hermosa mañana soleada y estoy listo para conquistar el mundo!",
            "Extraño a mi mejor amigo que se mudó el mes pasado. Me siento un poco solo.",
            "¡Celebrando mi aniversario con mi pareja. El amor está en el aire!"
        ],

        // Results Page
        analyzeNewText: "Analizar Nuevo Texto",
        moodAnalysis: "Análisis de Estado de Ánimo",
        yourText: "Tu Texto:",
        aiInsight: "Perspectiva de IA:",
        recommendedSongs: "Canciones Recomendadas",
        songsDescription: "Basado en tu análisis de estado de ánimo, aquí tienes 10 canciones perfectamente adaptadas a tu vibra actual:",
        saved: "Guardado",
        saveAnalysis: "Guardar Análisis",
        discoverMore: "Descubrir Más Música",

        // Moods
        moods: {
            Happy: "Feliz",
            Sad: "Triste",
            Angry: "Enojado",
            Anxious: "Ansioso"
        },

        // History Page
        yourSavedAnalyses: "Tus Análisis Guardados",
        noSavedAnalyses: "Sin Análisis Guardados",
        noSavedDescription: "¡Comienza analizando tu estado de ánimo y guarda tus resultados para verlos aquí!",
        viewAnalysis: "Ver Análisis",
        songs: "canciones"
    }
};

// Language Context
const LanguageContext = React.createContext();

const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en');

    const toggleLanguage = () => {
        setCurrentLanguage(prev => prev === 'en' ? 'es' : 'en');
    };

    const t = (key, replacements = {}) => {
        const keys = key.split('.');
        let value = translations[currentLanguage];

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) {
            console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
            return key;
        }

        // Replace placeholders like {name}, {genre}
        let result = value;
        Object.entries(replacements).forEach(([placeholder, replacement]) => {
            result = result.replace(`{${placeholder}}`, replacement);
        });

        return result;
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

LanguageProvider.propTypes = {
    children: PropTypes.node.isRequired
};

const useLanguage = () => {
    const context = React.useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

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

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired
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
    const { currentLanguage, toggleLanguage, t } = useLanguage();

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
                        <h1 className="text-xl font-bold">{t('appTitle')}</h1>
                        <p
                            className="text-sm"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            {t('appSubtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {currentUser && (
                        <>
                            <div className="text-sm mr-4" style={{ color: theme.colors.textSecondary }}>
                                {t('loggedInAs')} <span className="font-semibold">{currentUser.name}</span>
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
                                <span className="text-sm">{t('logout')}</span>
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
                            <span className="hidden sm:inline text-sm">{t('history')}</span>
                        </button>
                    )}

                    {/* Language Toggle Button */}
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-1"
                        style={{
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.text
                        }}
                        title={currentLanguage === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
                    >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">{currentLanguage.toUpperCase()}</span>
                    </button>

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

Header.propTypes = {
    onNavigateHome: PropTypes.func.isRequired,
    onNavigateHistory: PropTypes.func.isRequired,
    currentPage: PropTypes.string.isRequired,
    currentUser: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.string,
        preferredGenres: PropTypes.array
    }),
    onLogout: PropTypes.func.isRequired
};

const LoginPage = ({ onLogin, isLoading, error }) => {
    const theme = useTheme();
    const { t } = useLanguage();

    return (
        <div className="max-w-md mx-auto mt-20 p-6 rounded-xl"
             style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
            <h2 className="text-2xl font-bold mb-6">{t('loginTitle')}</h2>

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
                    {isLoading ? t('loggingIn') : t('loginAsJim')}
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
                    {isLoading ? t('loggingIn') : t('loginAsStephanie')}
                </button>
            </div>
        </div>
    );
};

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.string
};

const GenrePreferenceSelector = ({ currentUser, onGenreSelected, onSkip }) => {
    const theme = useTheme();
    const { t } = useLanguage();
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showMaxGenresError, setShowMaxGenresError] = useState(false);

    const genres = [
        { id: 'pop', icon: '🎵' },
        { id: 'indie', icon: '🎸' },
        { id: 'hip-hop', icon: '🎤' },
        { id: 'electronic', icon: '🎛️' },
        { id: 'jazz', icon: '🎺' },
        { id: 'country', icon: '🤠' },
        { id: 'latin', icon: '💃' },
        { id: 'rock', icon: '🤘' }
    ];

    const handleGenreSelect = (genreId) => {
        setSelectedGenres(prev => {
            if (prev.includes(genreId)) {
                // Remove genre if already selected
                setShowMaxGenresError(false);
                return prev.filter(g => g !== genreId);
            } else if (prev.length < 3) {
                // Add genre if less than 3 selected
                return [...prev, genreId];
            }
            // Show error message when trying to select more than 3
            setShowMaxGenresError(true);
            setTimeout(() => setShowMaxGenresError(false), 3000); // Hide after 3 seconds
            return prev; // Don't add if already 3 selected
        });
    };

    const handleGenreSubmit = () => {
        setIsLoading(true);
        if (currentUser) {
            onGenreSelected(selectedGenres.length > 0 ? selectedGenres : ['pop']); // Default to pop if nothing selected
        }
        setIsLoading(false);
    };

    const remainingSelections = 3 - selectedGenres.length;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                    {t('chooseGenre')}
                    <span
                        className="ml-2"
                        style={{ color: theme.colors.primary }}
                    >
                        {t('musicGenre')}
                    </span>
                </h2>
                <p
                    className="text-lg max-w-2xl mx-auto mb-4"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {t('genreDescription')}
                </p>
                <p
                    className="text-sm mb-4"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {t('welcomeUser', { name: currentUser.name })}
                </p>
                <p 
                    className={`text-sm transition-opacity duration-300 ${
                        remainingSelections > 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ color: theme.colors.textSecondary }}
                >
                    {remainingSelections > 0 
                        ? `${remainingSelections} ${remainingSelections === 1 
                            ? t('genreSelectionLeft') 
                            : t('genreSelectionsLeft')}`
                        : ''}
                </p>
            </div>

            {showMaxGenresError && (
                <p role="alert" className="text-amber-600 dark:text-amber-400 text-center mb-4 animate-bounce">
                    {t('maxGenresMessage')}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {genres.map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => handleGenreSelect(genre.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            selectedGenres.includes(genre.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                        disabled={!selectedGenres.includes(genre.id) && selectedGenres.length >= 3}
                        aria-pressed={selectedGenres.includes(genre.id)}
                        aria-label={`${t(`genres.${genre.id}.name`)} - ${t(`genres.${genre.id}.description`)}`}
                    >
                        <span className="text-2xl mr-2" role="img" aria-hidden="true">{genre.icon}</span>
                        <h3 className="font-bold mb-2">{t(`genres.${genre.id}.name`)}</h3>
                        <p
                            className="text-sm"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            {t(`genres.${genre.id}.description`)}
                        </p>
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onSkip}
                    className="text-gray-600 dark:text-gray-400 hover:underline"
                    aria-label={t('skipForNow')}
                >
                    {t('skipForNow')}
                </button>
                <button
                    onClick={handleGenreSubmit}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-busy={isLoading}
                >
                    {isLoading ? t('saving') : t('continueWith')}
                </button>
            </div>
        </div>
    );
};

GenrePreferenceSelector.propTypes = {
    currentUser: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.string,
        preferredGenres: PropTypes.array
    }).isRequired,
    onGenreSelected: PropTypes.func.isRequired,
    onSkip: PropTypes.func.isRequired
};

const TextInputPage = ({ onSubmit, isLoading, error }) => {
    const [text, setText] = useState('');
    const [selectedExample, setSelectedExample] = useState('');
    const theme = useTheme();
    const { t } = useLanguage();

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

    // Get examples for current language
    const examples = t('examples');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                    {t('discoverMusic')}
                    <span
                        className="ml-2"
                        style={{ color: theme.colors.primary }}
                    >
                        {t('mood')}
                    </span>
                </h2>
                <p
                    className="text-lg max-w-2xl mx-auto"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {t('moodDescription')}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 text-red-700">
                    <strong>{t('error')}</strong> {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="text-input"
                        className="block text-sm font-medium mb-2"
                    >
                        {t('tellUsFeelings')}
                    </label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('textPlaceholder')}
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
                                <span>{t('analyzing')}</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>{t('analyzeButton')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-center">
                    {t('needInspiration')}
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

TextInputPage.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.string
};

const ResultsPage = ({ analysis, onNavigateBack, onSaveAnalysis, savedAnalyses }) => {
    const theme = useTheme();
    const { t } = useLanguage();
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

        if (moodName === 'happy' || moodName === 'feliz') {
            if (percentage > 70) {
                insight = isLatinContext
                    ? "Your text radiates pure joy and energy! Perfect for upbeat Latin rhythms like reggaeton and salsa."
                    : `Your text shows overwhelming positivity with ${percentage}% happiness. Perfect for upbeat, energetic music!`;
            } else if (percentage > 40) {
                insight = isLatinContext
                    ? "You're feeling good vibes! Time for some celebratory Latin music to match your mood."
                    : "You're feeling quite positive today. Great for uplifting music that matches your optimistic energy.";
            } else {
                insight = "You're experiencing moderate happiness. Gentle, positive music would complement your mood well.";
            }
        } else if (moodName === 'sad' || moodName === 'triste') {
            if (percentage > 60) {
                insight = isLatinContext
                    ? "You're going through a tough time. Let some soulful bachata or boleros help you process these feelings."
                    : `You're feeling quite down with ${percentage}% sadness. Gentle, comforting music might help you through this.`;
            } else {
                insight = "You seem a bit melancholic. Some reflective music could resonate with your current state.";
            }
        } else if (moodName === 'angry' || moodName === 'enojado') {
            insight = isLatinContext
                ? "You're feeling intense emotions! High-energy reggaeton or Latin rock could be the perfect outlet."
                : "You're experiencing anger and frustration. Powerful, energetic music might help you channel these feelings.";
        } else if (moodName === 'anxious' || moodName === 'ansioso') {
            insight = isLatinContext
                ? "You're feeling nervous. Some calming nueva canción or gentle acoustic Latin music might help soothe you."
                : "You're feeling anxious. Calm, peaceful music could help ease your worries.";
        } else {
            insight = "Your emotions are complex. Let music be your companion through this journey.";
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
                    <span>{t('analyzeNewText')}</span>
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
                        <h3 className="text-xl font-bold mb-4">{t('moodAnalysis')}</h3>

                        <div
                            className="p-4 rounded-lg mb-4 text-sm"
                            style={{
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.textSecondary
                            }}
                        >
                            <strong>{t('yourText')}</strong> &ldquo;{text.length > 100 ? text.substring(0, 100) + '...' : text}&rdquo;
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
                                                <span className="font-medium">{t(`moods.${mood.mood}`)}</span>
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
                            <strong>{t('aiInsight')}</strong> {aiInsight}
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
                        <h3 className="text-xl font-bold mb-4">{t('recommendedSongs')}</h3>
                        <p
                            className="mb-6"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            {t('songsDescription')}
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
                                <span>{isSaved ? t('saved') : t('saveAnalysis')}</span>
                            </button>

                            <button
                                onClick={onNavigateBack}
                                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: theme.colors.secondary,
                                    color: 'white'
                                }}
                            >
                                {t('discoverMore')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ResultsPage.propTypes = {
    analysis: PropTypes.shape({
        text: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        moodAnalysis: PropTypes.arrayOf(PropTypes.shape({
            mood: PropTypes.string.isRequired,
            percentage: PropTypes.number.isRequired,
            icon: PropTypes.func.isRequired,
            color: PropTypes.string.isRequired
        })).isRequired,
        songs: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            artist: PropTypes.string.isRequired,
            album: PropTypes.string.isRequired,
            genre: PropTypes.string.isRequired
        })).isRequired,
        sentimentScores: PropTypes.object
    }).isRequired,
    onNavigateBack: PropTypes.func.isRequired,
    onSaveAnalysis: PropTypes.func.isRequired,
    savedAnalyses: PropTypes.array.isRequired
};

const HistoryPage = ({ savedAnalyses, onNavigateBack, onViewAnalysis, onDeleteAnalysis }) => {
    const theme = useTheme();
    const { t } = useLanguage();

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
                        <span>{t('backToHome')}</span>
                    </button>
                </div>

                <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                    <h2 className="text-2xl font-bold mb-2">{t('noSavedAnalyses')}</h2>
                    <p style={{ color: theme.colors.textSecondary }}>
                        {t('noSavedDescription')}
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
                    <span>{t('backToHome')}</span>
                </button>

                <h1 className="text-2xl font-bold">{t('yourSavedAnalyses')}</h1>
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
                                        {t(`moods.${primaryMood.mood}`)}
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
                                <span>{analysis.songs.length} {t('songs')}</span>
                            </div>

                            <button
                                onClick={() => onViewAnalysis(analysis)}
                                className="w-full py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    color: 'white'
                                }}
                            >
                                {t('viewAnalysis')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

HistoryPage.propTypes = {
    savedAnalyses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        text: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        moodAnalysis: PropTypes.array.isRequired,
        songs: PropTypes.array.isRequired
    })).isRequired,
    onNavigateBack: PropTypes.func.isRequired,
    onViewAnalysis: PropTypes.func.isRequired,
    onDeleteAnalysis: PropTypes.func.isRequired
};

// TensorFlow Status Component
const TensorFlowStatus = () => {
    const [modelInfo, setModelInfo] = useState(null);

    React.useEffect(() => {
        // This would be connected to your sentiment analyzer
        setModelInfo({
            isLoaded: true,
            vocabularySize: 1000
        });
    }, []);

    if (!modelInfo || process.env.NODE_ENV !== 'development') return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: modelInfo.isLoaded ? '#4CAF50' : '#FF9800',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000
        }}>
            TF.js: {modelInfo.isLoaded ? '✅ Ready' : '⏳ Loading'}
            <br />
            Vocab: {modelInfo.vocabularySize} words
        </div>
    );
};

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [savedAnalyses, setSavedAnalyses] = useState([]);
    const mqttClient = React.useRef(new MusicRecommenderMQTT(mqttConfig)).current;
    const spotifyService = React.useRef(new SpotifyService()).current;
    const sentimentAnalyzer = React.useRef(new TensorFlowSentimentAnalyzer()).current;

    React.useEffect(() => {
        const initializeTensorFlow = async () => {
            try {
                console.log('🚀 Initializing TensorFlow.js sentiment analyzer...');
                await sentimentAnalyzer.initialize();
                console.log('✅ TensorFlow.js ready!')
            } catch (error) {
                console.error('❌ TensorFlow.js initialization failed:', error);
            }
        };
        initializeTensorFlow();

        return () => {
            sentimentAnalyzer.dispose();
        };
    }, [sentimentAnalyzer]);

    const handleTextSubmit = async (text) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🎯 Starting sentiment analysis and music recommendations...');

            const sentimentScores = await sentimentAnalyzer.analyzeSentiment(text, currentUser?.id);
            console.log('📊 TensorFlow Sentiment scores:', sentimentScores);

            const userPreferences = currentUser ? {
                preferredGenres: currentUser.preferredGenres || (currentUser.name === 'Jim' ? ['country'] : ['pop']),
                inputText: text
            } : { inputText: text };

            const spotifyRecommendations = await spotifyService.getRecommendations(sentimentScores, userPreferences);
            console.log('🎵 Spotify recommendations:', spotifyRecommendations);

            await mqttClient.saveSession(text, sentimentScores, spotifyRecommendations);

            const moodAnalysis = [
                { mood: 'Happy', percentage: Math.round(sentimentScores.joy * 100), icon: Smile, color: '#08D9D6' },
                { mood: 'Sad', percentage: Math.round(sentimentScores.sadness * 100), icon: Heart, color: '#0065F8' },
                { mood: 'Angry', percentage: Math.round(sentimentScores.anger * 100), icon: Activity, color: '#FF4444' },
                { mood: 'Anxious', percentage: Math.round(sentimentScores.fear * 100), icon: Activity, color: '#FFA500' }
            ].filter(mood => mood.percentage > 0).sort((a, b) => b.percentage - a.percentage);

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

    const handleGenreSelected = (genres) => {
        setCurrentUser(prev => ({ ...prev, preferredGenres: genres }));
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
        <LanguageProvider>
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
                                isLoading={isLoading}
                                error={error}
                            />
                        )}
                    </main>

                    {/* Debug status indicator */}
                    <TensorFlowStatus />
                </div>
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default App;
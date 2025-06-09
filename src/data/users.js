// Test user data for Jim and Stephanie
const testUsers = {
    jim: {
        id: 'user_jim123',
        name: 'Jim',
        history: [
            {
                timestamp: '2025-06-01T10:30:00Z',
                text: "Today was okay, I guess. A bit down but managing.",
                sentiment: {
                    joy: 0.2,
                    sadness: 0.5,
                    anger: 0.1,
                    fear: 0.2
                },
                preferredGenre: 'country',
                recommendations: [
                    { name: "I Hope You Dance", artist: "Lee Ann Womack", genre: "country" },
                    { name: "The Dance", artist: "Garth Brooks", genre: "country" },
                    { name: "Live Like You Were Dying", artist: "Tim McGraw", genre: "country" }
                ]
            },
            {
                timestamp: '2025-06-05T15:20:00Z',
                text: "Feeling a bit better today, the sun is shining.",
                sentiment: {
                    joy: 0.4,
                    sadness: 0.3,
                    anger: 0.1,
                    fear: 0.2
                },
                preferredGenre: 'country',
                recommendations: [
                    { name: "Life is a Highway", artist: "Rascal Flatts", genre: "country" },
                    { name: "God Blessed Texas", artist: "Little Texas", genre: "country" },
                    { name: "My Next Thirty Years", artist: "Tim McGraw", genre: "country" }
                ]
            }
        ]
    },
    stephanie: {
        id: 'user_steph456',
        name: 'Stephanie',
        history: [
            {
                timestamp: '2025-06-02T14:15:00Z',
                text: "Super excited about the weekend! Can't wait to dance!",
                sentiment: {
                    joy: 0.8,
                    sadness: 0.1,
                    anger: 0.0,
                    fear: 0.1
                },
                preferredGenre: 'pop',
                recommendations: [
                    { name: "Can't Stop the Feeling", artist: "Justin Timberlake", genre: "pop" },
                    { name: "Shake It Off", artist: "Taylor Swift", genre: "pop" },
                    { name: "Good as Hell", artist: "Lizzo", genre: "pop" }
                ]
            },
            {
                timestamp: '2025-06-07T11:45:00Z',
                text: "Had the best day ever at the concert! Still buzzing with energy!",
                sentiment: {
                    joy: 0.9,
                    sadness: 0.0,
                    anger: 0.0,
                    fear: 0.1
                },
                preferredGenre: 'pop',
                recommendations: [
                    { name: "Dance The Night", artist: "Dua Lipa", genre: "pop" },
                    { name: "Levitating", artist: "Dua Lipa", genre: "pop" },
                    { name: "Physical", artist: "Dua Lipa", genre: "pop" }
                ]
            }
        ]
    }
};

export default testUsers;

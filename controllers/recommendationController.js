const Movie = require('../models/movie');
const User = require('../models/user');
const Person = require('../models/person');

// Get personalized recommendations for a user
exports.getPersonalizedRecommendations = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { favoriteGenres, favoriteActors } = user;

        // Resolve actor names to ObjectIds
        const actorIds = await Person.find({ 
            name: { $in: favoriteActors }, 
            role: 'Actor' 
        }).select('_id');

        const actorObjectIds = actorIds.map((actor) => actor._id);

        // Build query
        const query = {
            $or: [
                { genre: { $in: favoriteGenres } },
                { cast: { $in: actorObjectIds } }
            ]
        };

        // Fetch recommendations
        const recommendations = await Movie.find(query)
            .populate('director', 'name')
            .populate('cast', 'name')
            .limit(10);

        if (!recommendations.length) {
            return res.status(404).json({ message: 'No recommendations found' });
        }

        res.json({ recommendations });
    } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get similar titles for a movie
exports.getSimilarTitles = async (req, res) => {
    const { movieId } = req.params;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        const similarMovies = await Movie.find({
            _id: { $ne: movieId },
            $or: [
                { genre: { $in: movie.genre } },
                { director: movie.director }
            ]
        })
            .sort('-averageRating')
            .limit(10);

        res.json({ similarMovies });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching similar titles', error });
    }
};

// Get trending movies
exports.getTrendingMovies = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    try {
        const trendingMovies = await Movie.find()
            .sort('-viewCount')
            .skip(skip)
            .limit(limit);

        res.json({ trendingMovies });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending movies', error });
    }
};

// Get top-rated movies
exports.getTopRatedMovies = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    try {
        const topRatedMovies = await Movie.find()
            .sort('-averageRating')
            .skip(skip)
            .limit(limit);

        res.json({ topRatedMovies });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top-rated movies', error });
    }
};

// Insights for recommendations
exports.getRecommendationInsights = async (req, res) => {
    try {
        // Find top recommended movies based on genres and cast appearances
        const topRecommendedMovies = await Movie.aggregate([
            {
                $project: {
                    title: 1,
                    genre: 1,
                    cast: 1,
                    totalAppearances: { $size: { $concatArrays: ['$genre', '$cast'] } }
                }
            },
            { $sort: { totalAppearances: -1 } },
            { $limit: 5 } // Top 5 movies
        ]);

        // Find most popular genres among users
        const mostPopularGenres = await User.aggregate([
            { $unwind: '$favoriteGenres' }, // Decompose the array
            { $group: { _id: '$favoriteGenres', count: { $sum: 1 } } }, // Count occurrences
            { $sort: { count: -1 } },
            { $limit: 5 } // Top 5 genres
        ]);

        // Find most favorited actors among users
        const mostFavoritedActors = await User.aggregate([
            { $unwind: '$favoriteActors' }, // Decompose the array
            { $group: { _id: '$favoriteActors', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 } // Top 5 actors
        ]);

        // Combine all insights into a single response
        res.json({
            topRecommendedMovies,
            mostPopularGenres,
            mostFavoritedActors
        });
    } catch (error) {
        console.error('Error fetching recommendation insights:', error);
        res.status(500).json({
            message: 'Error fetching recommendation insights',
            error: error.message
        });
    }
};

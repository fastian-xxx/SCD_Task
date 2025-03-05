const Movie = require('../models/movie');
const User = require('../models/user');

// Moderate reviews (delete a specific review)
exports.deleteReview = async (req, res) => {
    const { movieId, reviewId } = req.params;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        // Find and remove the review
        const reviewIndex = movie.reviews.findIndex(review => review._id.toString() === reviewId);
        if (reviewIndex === -1) return res.status(404).json({ message: 'Review not found' });

        movie.reviews.splice(reviewIndex, 1);

        // Recalculate average rating and rating count
        movie.ratingCount = movie.reviews.length;
        const totalRating = movie.reviews.reduce((sum, review) => sum + review.rating, 0);
        movie.averageRating = movie.ratingCount > 0 ? (totalRating / movie.ratingCount).toFixed(1) : 0;

        await movie.save();
        res.json({ message: 'Review deleted successfully', movie });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};

// Get site statistics
exports.getSiteStatistics = async (req, res) => {
    try {
        // Most popular movies (by view count)
        const mostPopularMovies = await Movie.find()
            .sort('-viewCount')
            .limit(5)
            .select('title viewCount');

        // Trending genres
        const genreCounts = await Movie.aggregate([
            { $unwind: '$genre' }, // Decompose array into multiple documents
            { $group: { _id: '$genre', count: { $sum: 1 } } }, // Count occurrences of each genre
            { $sort: { count: -1 } }, // Sort by count
            { $limit: 5 } // Get top 5
        ]);

        // Most searched actors (based on cast appearances in popular movies)
        const mostSearchedActors = await Movie.aggregate([
            { $unwind: '$cast' }, // Decompose cast array
            { $group: { _id: '$cast', count: { $sum: 1 } } }, // Count occurrences of each actor
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).lookup({
            from: 'persons',
            localField: '_id',
            foreignField: '_id',
            as: 'actor'
        });

        res.json({
            mostPopularMovies,
            trendingGenres: genreCounts,
            mostSearchedActors
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching site statistics', error });
    }
};

// Admin dashboard for user engagement
exports.getUserEngagement = async (req, res) => {
    try {
        // Count total users
        const totalUsers = await User.countDocuments();

        // Count active users (e.g., users with activity like reviews)
        const activeUsers = await User.countDocuments({ 'reviews.0': { $exists: true } });

        // Most active reviewers
        const topReviewers = await User.aggregate([
            {
                $project: {
                    username: 1,
                    reviewCount: {
                        $size: { $ifNull: ['$reviews', []] } // Handle missing reviews as empty array
                    }
                }
            },
            { $sort: { reviewCount: -1 } },
            { $limit: 5 }
        ]);

        res.json({ totalUsers, activeUsers, topReviewers });
    } catch (error) {
        console.error('Error fetching user engagement data:', error);
        res.status(500).json({ message: 'Error fetching user engagement data', error });
    }
};


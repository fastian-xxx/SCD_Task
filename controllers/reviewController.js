const Review = require('../models/review');
const Movie = require('../models/movie');


// Add or Update a Review
exports.addOrUpdateReview = async (req, res) => {
    const { movieId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user.id; // Extract user ID from authMiddleware

    try {
        // Check if the movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        // Check if the user has already reviewed this movie
        let review = await Review.findOne({ movie: movieId, user: userId });

        if (review) {
            // Update existing review
            review.rating = rating;
            review.reviewText = reviewText;
            review.updatedAt = Date.now();
        } else {
            // Create a new review
            review = new Review({
                movie: movieId,
                user: userId,
                rating,
                reviewText
            });
        }

        await review.save();

        // Update the movie's average rating and rating count
        const reviews = await Review.find({ movie: movieId });
        const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
        movie.ratingCount = reviews.length;
        movie.averageRating = (totalRatings / reviews.length).toFixed(1);
        await movie.save();

        res.json({ message: 'Review added/updated successfully', review });
    } catch (error) {
        console.error('Error adding/updating review:', error);
        res.status(500).json({ message: 'Error adding/updating review', error: error.message });
    }
};



// Get reviews for a specific movie
exports.getMovieReviews = async (req, res) => {
    const { movieId } = req.params;

    try {
        const reviews = await Review.find({ movie: movieId })
            .populate('user', 'username email')
            .sort('-createdAt');

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};


exports.getReviewHighlights = async (req, res) => {
    try {
        // Fetch top-rated movies
        const topRatedMovies = await Movie.find()
            .sort('-averageRating') // Descending order by average rating
            .limit(5)
            .select('title averageRating ratingCount'); // Select only relevant fields

        // Fetch most-discussed movies
        const mostDiscussedMovies = await Movie.find()
            .sort('-ratingCount') // Descending order by number of ratings
            .limit(5)
            .select('title ratingCount averageRating');

        res.json({
            topRatedMovies,
            mostDiscussedMovies
        });
    } catch (error) {
        console.error('Error fetching review highlights:', error);
        res.status(500).json({ message: 'Error fetching review highlights', error: error.message });
    }
};

// Update a review for a movie
exports.updateReview = async (req, res) => {
    const { movieId } = req.params; // Get movie ID from path params
    const { rating, review } = req.body; // Get rating and review from request body
    const userId = req.user._id; // Get user ID from authenticated user

    try {
        // Find the review by the current user for this movie
        const userReview = await Review.findOne({ movie: movieId, user: userId });
        if (!userReview) return res.status(404).json({ message: 'Review not found' });

        // Update the review fields
        if (rating) userReview.rating = rating;
        if (review) userReview.review = review;
        userReview.updatedAt = Date.now();

        await userReview.save();

        // Recalculate the movie's average rating and rating count
        const reviews = await Review.find({ movie: movieId });
        const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
        const movie = await Movie.findById(movieId);

        movie.ratingCount = reviews.length;
        movie.averageRating = (totalRatings / reviews.length).toFixed(1);

        await movie.save();

        res.json({ message: 'Review updated successfully', review: userReview });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
};

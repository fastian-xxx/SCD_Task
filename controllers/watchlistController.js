const User = require('../models/user');
const Movie = require('../models/movie');

// Add a movie to the watchlist
exports.addToWatchlist = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    try {
        // Check if the movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Find the user and update the watchlist
        const user = await User.findById(userId);
        if (!user.watchlist.includes(movieId)) {
            user.watchlist.push(movieId);
            await user.save();
        }

        res.json({ message: 'Movie added to watchlist successfully', watchlist: user.watchlist });
    } catch (error) {
        console.error('Error adding to watchlist:', error.message);
        res.status(500).json({ message: 'Error adding to watchlist', error });
    }
};

// Remove a movie from the watchlist
exports.removeFromWatchlist = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        user.watchlist = user.watchlist.filter(id => id.toString() !== movieId);
        await user.save();

        res.json({ message: 'Movie removed from watchlist successfully', watchlist: user.watchlist });
    } catch (error) {
        console.error('Error removing from watchlist:', error.message);
        res.status(500).json({ message: 'Error removing from watchlist', error });
    }
};

// Get the user's watchlist
exports.getWatchlist = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('watchlist', 'title genre director');
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error fetching watchlist:', error.message);
        res.status(500).json({ message: 'Error fetching watchlist', error });
    }
};

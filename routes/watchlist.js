const express = require('express');
const {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist
} = require('../controllers/watchlistController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a movie to the watchlist
router.post('/:movieId', authMiddleware, addToWatchlist);

// Remove a movie from the watchlist
router.delete('/:movieId', authMiddleware, removeFromWatchlist);

// Get the user's watchlist
router.get('/', authMiddleware, getWatchlist);

module.exports = router;

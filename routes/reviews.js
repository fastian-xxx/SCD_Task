const express = require('express');
const router = express.Router();

const {
    addOrUpdateReview,
    updateReview,
    getMovieReviews,
    getReviewHighlights
} = require('../controllers/reviewController');

const authMiddleware = require('../middlewares/authMiddleware');

// General routes
router.get('/highlights', getReviewHighlights); // Global highlights route (must come before :movieId)
router.get('/:movieId', getMovieReviews); // Reviews for a specific movie

// Protected routes
router.post('/:movieId', authMiddleware, addOrUpdateReview);
router.put('/:movieId', authMiddleware, updateReview);

module.exports = router;

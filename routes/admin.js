const express = require('express');
const router = express.Router();

const {
    deleteReview,
    getSiteStatistics,
    getUserEngagement
} = require('../controllers/adminController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Moderate reviews
router.delete('/movies/:movieId/reviews/:reviewId', authMiddleware, adminMiddleware, deleteReview);

// Site statistics
router.get('/statistics', authMiddleware, adminMiddleware, getSiteStatistics);

// User engagement
router.get('/user-engagement', authMiddleware, adminMiddleware, getUserEngagement);

module.exports = router;

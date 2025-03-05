const express = require('express');
const router = express.Router();

const {
    getPersonalizedRecommendations,
    getSimilarTitles,
    getTrendingMovies,
    getTopRatedMovies,
    getRecommendationInsights
} = require('../controllers/recommendationController');

const authMiddleware = require('../middlewares/authMiddleware');



// Personalized recommendations for the logged-in user
router.get('/personalized', authMiddleware, getPersonalizedRecommendations);

// Similar titles for a specific movie
router.get('/similar/:movieId', getSimilarTitles);

// Trending movies
router.get('/trending', getTrendingMovies);

// Top-rated movies
router.get('/top-rated', getTopRatedMovies);

router.get('/insights', getRecommendationInsights); 

module.exports = router;

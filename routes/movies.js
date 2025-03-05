const express = require('express');
const router = express.Router();

const {
    addMovie,
    updateMovie,
    deleteMovie,
    getAllMovies,
    searchMovies,
    getTopMoviesOfTheMonth,
    getTop10ByGenre,
    updateBoxOffice,
    getMovieById,
    sendUpcomingMovieEmails // Correctly import this
} = require('../controllers/movieController'); // No need to use movieController prefix

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Admin-only routes
router.post('/', authMiddleware, adminMiddleware, addMovie);
router.put('/:id', authMiddleware, adminMiddleware, updateMovie);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMovie);
router.put('/:id/box-office', authMiddleware, adminMiddleware, updateBoxOffice);

// Public routes
router.get('/', getAllMovies);
router.get('/search', searchMovies);
router.get('/top-month', getTopMoviesOfTheMonth);
router.get('/top-genre', getTop10ByGenre);
router.get('/:id', getMovieById);

// Route to send email notifications for upcoming movies
router.post('/upcoming/notify', sendUpcomingMovieEmails);

module.exports = router;

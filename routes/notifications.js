const express = require('express');
const {
    getUpcomingMovies,
    setReminder,
    getDashboardNotifications
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get upcoming movies
router.get('/upcoming', getUpcomingMovies);

// Set a reminder for a movie (requires authentication)
router.post('/reminder', authMiddleware, setReminder);

// Get dashboard notifications (requires authentication)
router.get('/dashboard', authMiddleware, getDashboardNotifications);

module.exports = router;

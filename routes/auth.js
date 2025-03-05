const express = require('express');
const {
    register,
    login,
    updateProfile,
    addToWishlist,
    removeFromWishlist,
    createAdmin
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin);
// Protected routes
router.put('/profile', authMiddleware, updateProfile);
router.post('/wishlist/:movieId', authMiddleware, addToWishlist); // Add movie to wishlist
router.delete('/wishlist/:movieId', authMiddleware, removeFromWishlist); // Remove movie from wishlist

module.exports = router;

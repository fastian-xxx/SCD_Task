const express = require('express');
const {
    createArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
    getArticleById,
    getArticleBySearch
} = require('../controllers/articleController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

// Public routes
router.get('/search', getArticleBySearch);
router.get('/', getAllArticles); // Get all articles (with optional category filter)
router.get('/:id', getArticleById); // Get a single article by ID

// Admin-only routes
router.post('/', authMiddleware, adminMiddleware, createArticle); // Create an article
router.put('/:id', authMiddleware, adminMiddleware, updateArticle); // Update an article
router.delete('/:id', authMiddleware, adminMiddleware, deleteArticle); // Delete an article

module.exports = router;

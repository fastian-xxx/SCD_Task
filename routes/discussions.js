const express = require('express');
const {
    createDiscussion,
    getDiscussions,
    getDiscussionById,
    addReply,
    deleteDiscussionOrReply
} = require('../controllers/discussionController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

// Public routes
router.get('/', getDiscussions); // Get all discussions
router.get('/:id', getDiscussionById); // Get a single discussion by ID

// Authenticated routes
router.post('/', authMiddleware, createDiscussion); // Create a discussion
router.post('/:id/replies', authMiddleware, addReply); // Add a reply to a discussion

// Admin-only routes
router.delete('/:id', authMiddleware, adminMiddleware, deleteDiscussionOrReply); // Delete a discussion
router.delete('/:id/replies/:replyId', authMiddleware, adminMiddleware, deleteDiscussionOrReply); // Delete a reply

module.exports = router;

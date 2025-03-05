const express = require('express');
const {
    createList,
    updateList,
    deleteList,
    followList,
    unfollowList,
    getAllLists,
    getListById 
} = require('../controllers/listController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes for managing custom lists
router.post('/', authMiddleware, createList); // Create a new list
router.put('/:id', authMiddleware, updateList); // Update a list
router.delete('/:id', authMiddleware, deleteList); // Delete a list

// Routes for following/unfollowing lists
router.post('/:listId/follow', authMiddleware, followList); // Follow a list
router.post('/:listId/unfollow', authMiddleware, unfollowList); // Unfollow a list

// Public route to get all lists
router.get('/', getAllLists);
router.get('/:id', getListById);
module.exports = router;

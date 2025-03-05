const express = require('express');
const { addPerson, getPersonDetails } = require('../controllers/personController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

// Admin route to add a person (actor/director)
router.post('/', authMiddleware, adminMiddleware, addPerson);

// Public route to get person details
router.get('/:id', getPersonDetails);

module.exports = router;

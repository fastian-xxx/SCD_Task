const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('Authorization header missing');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Bearer token missing');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        console.log('Extracted Token:', token);

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        // Find the user and ensure the username is included
        const user = await User.findById(decoded.id).select('_id role username');
        if (!user) {
            console.log('User not found in the database');
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user details to the request
        req.user = { id: user._id, role: user.role, username: user.username };
        console.log('User set in request:', req.user);

        next(); // Pass control to the next middleware
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;

const adminMiddleware = (req, res, next) => {
    console.log('Admin Middleware - User Data:', req.user); // Debug user data

    if (req.user && req.user.role === 'admin') {
        console.log('Admin Access Granted');
        return next();
    } else {
        console.warn('Admin Access Denied - Insufficient Role or Missing Role');
        return res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = adminMiddleware;

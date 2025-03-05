const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Generate JWT token
// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, // Include role in payload
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Register new user
exports.register = async (req, res) => {
    const { username, email, password, role, adminKey } = req.body;

    try {
        // Validate admin key for admin registration
        if (role === 'admin' && adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ message: 'Invalid admin key' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Assign default role as 'user' if no role is provided
        const userRole = role === 'admin' ? 'admin' : 'user';

        // Create the user (password will be hashed by the pre('save') middleware)
        const user = new User({ username, email, password, role: userRole });
        await user.save();

        // Generate a token
        const token = generateToken(user);

        res.status(201).json({ token, user });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = generateToken(user);
        res.json({ token, user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Update user profile
exports.updateProfile = async (req, res) => {
    const { favoriteGenres, favoriteActors, name, email } = req.body;

    // Optional validation for genres and actors
    if (favoriteGenres && !Array.isArray(favoriteGenres)) {
        return res.status(400).json({ message: 'Invalid data. Genres must be an array.' });
    }

    if (favoriteActors && !Array.isArray(favoriteActors)) {
        return res.status(400).json({ message: 'Invalid data. Actors must be an array.' });
    }

    try {
        // Build the update object dynamically
        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (favoriteGenres) updateFields.favoriteGenres = favoriteGenres;
        if (favoriteActors) updateFields.favoriteActors = favoriteActors;

        const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Add to wishlist
exports.addToWishlist = async (req, res) => {
    const { movieId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(movieId)) {
            user.wishlist.push(movieId);
            await user.save();
        }
        res.json({ message: 'Movie added to wishlist.', wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    const { movieId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== movieId);
        await user.save();
        res.json({ message: 'Movie removed from wishlist.', wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



exports.createAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if an admin with this email already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin user
        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin', // Explicitly set role to admin
        });

        await adminUser.save();
        res.status(201).json({ message: 'Admin created successfully', user: adminUser });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteGenres: [String],
    favoriteActors: [String],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    followedLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
    notificationPreferences: {
        email: { type: Boolean, default: true },
        dashboard: { type: Boolean, default: true }
    },
    reminders: [
        {
            movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
            reminderDate: { type: Date }
        }
    ],
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // New role field
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare passwords for login
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);

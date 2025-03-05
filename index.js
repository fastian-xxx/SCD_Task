const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const cron = require('node-cron');
const { sendEmailNotifications } = require('./controllers/notificationController');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const watchlistRoutes = require('./routes/watchlist');

// Register the watchlist routes
app.use('/api/watchlist', watchlistRoutes);
// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));        // User Authentication Routes
app.use('/api/movies', require('./routes/movies'));    // Movie Management Routes
app.use('/api/lists', require('./routes/lists'));      // Watchlist and Custom Lists Routes
app.use('/api/notifications', require('./routes/notifications')); // Notification Routes
app.use('/api/articles', require('./routes/articles'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/admin', require('./routes/admin'));


// Schedule daily email notifications at 8 AM
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily email notifications...');
    await sendEmailNotifications();
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const User = require('../models/user');
const Movie = require('../models/movie');
const nodemailer = require('nodemailer');

// Nodemailer setup with Mailtrap
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send email notifications
exports.sendEmailNotifications = async () => {
    try {
        const currentDate = new Date();

        // Find users with reminders for today
        const usersWithReminders = await User.find({
            'reminders.reminderDate': { $lte: currentDate },
            'notificationPreferences.email': true
        }).populate('reminders.movieId', 'title releaseDate');

        for (const user of usersWithReminders) {
            const movieList = user.reminders
                .map(r => `- ${r.movieId.title} (Releases: ${r.movieId.releaseDate.toDateString()})`)
                .join('\n');

            const mailOptions = {
                from: 'no-reply@movieapp.com',
                to: user.email,
                subject: 'Your Movie Reminders',
                text: `Hello ${user.username},\n\nHere are your movie reminders:\n\n${movieList}\n\nEnjoy your movies!\nMovie Recommendation System`
            };

            await transporter.sendMail(mailOptions);
        }

        console.log('Email notifications sent successfully.');
    } catch (error) {
        console.error('Error sending email notifications:', error);
    }
};

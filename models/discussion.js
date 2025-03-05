const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const discussionSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the discussion
    content: { type: String, required: true }, // Initial post content
    category: { type: String, enum: ['Movie', 'Actor', 'Genre', 'General'], required: true }, // Discussion category
    relatedMovie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, // Optional reference to a movie
    relatedPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' }, // Optional reference to an actor
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator of the topic
    replies: [replySchema], // Embedded replies
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Discussion', discussionSchema);

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['Upcoming Movies', 'Actor Updates', 'Industry News'], required: true },
    relatedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }], // Optional link to movies
    relatedPersons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }], // Optional link to actors/directors
    coverPhoto: { type: String }, // URL to an image for the article
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who created the article
    publishedDate: { type: Date, default: Date.now } // When the article was published
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);

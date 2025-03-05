const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }], // Movies in the list
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // List owner
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Users following the list
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);

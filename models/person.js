const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true }, // E.g., "Actor", "Director"
    biography: { type: String },
    awards: [
        {
            name: { type: String }, // E.g., "Oscars"
            category: { type: String }, // E.g., "Best Actor"
            won: { type: Boolean },
            year: { type: Number }
        }
    ],
    filmography: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    photos: [String]
}, { timestamps: true });

module.exports = mongoose.model('Person', personSchema);

const mongoose = require('mongoose');

// Define the schema for Movie
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: [String],
    director: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
    cast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    releaseDate: { type: Date, required: true },
    runtime: { type: Number, required: true },
    synopsis: { type: String, required: true },
    coverPhoto: { type: String },
    trivia: { type: String },
    goofs: { type: String },
    soundtrackInfo: { type: String },
    ageRating: { type: String },
    parentalGuidance: { type: String },
    language: { type: String, required: true },
    boxOffice: {
        domestic: { type: Number, default: 0 },
        international: { type: Number, default: 0 },
        openingWeekend: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 }
    },
    awards: [
        {
            name: { type: String }, // Award name (e.g., "Oscars")
            category: { type: String }, // Award category (e.g., "Best Picture")
            won: { type: Boolean }, // Whether the award was won
            year: { type: Number } // Year of the award
        }
    ]
});

// Create and export the model
const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;

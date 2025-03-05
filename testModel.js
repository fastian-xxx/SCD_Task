const mongoose = require('mongoose');
const Movie = require('./models/movie'); // Correct import for the model

mongoose.connect('mongodb://localhost:27017/Assignment', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const testMovie = async () => {
    try {
        const movie = new Movie({
            title: 'Test Movie',
            genre: ['Action', 'Thriller'],
            director: new mongoose.Types.ObjectId(),
            cast: [new mongoose.Types.ObjectId()],
            releaseDate: new Date(),
            runtime: 120,
            synopsis: 'This is a test movie.',
            language: 'English',
        });

        await movie.save();
        console.log('Movie saved successfully:', movie);
    } catch (err) {
        console.error('Error testing the Movie model:', err);
    } finally {
        mongoose.disconnect();
    }
};

testMovie();

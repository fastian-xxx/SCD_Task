const Movie = require('../models/movie');
const nodemailer = require('nodemailer');
const moment = require('moment'); 
// Add a new movie
const Person = require('../models/person');

exports.addMovie = async (req, res) => {
    const {
        title,
        genre,
        director,
        cast,
        releaseDate,
        runtime,
        synopsis,
        coverPhoto,
        trivia,
        goofs,
        soundtrackInfo,
        ageRating,
        parentalGuidance,
        language // Added field
    } = req.body;

    try {
        // Validate language
        if (!language) {
            console.warn('Language is missing for the movie being added');
        }

        // Handle director
        let directorId;
        const existingDirector = await Person.findOne({ name: director, role: 'Director' });
        if (existingDirector) {
            directorId = existingDirector._id;
        } else {
            const newDirector = await Person.create({ name: director, role: 'Director' });
            directorId = newDirector._id;
        }

        // Handle cast
        const castIds = [];
        for (const actorName of cast) {
            const existingActor = await Person.findOne({ name: actorName, role: 'Actor' });
            if (existingActor) {
                castIds.push(existingActor._id);
            } else {
                const newActor = await Person.create({ name: actorName, role: 'Actor' });
                castIds.push(newActor._id);
            }
        }

        // Create the movie
        const movie = new Movie({
            title,
            genre,
            director: directorId,
            cast: castIds,
            releaseDate,
            runtime,
            synopsis,
            coverPhoto,
            trivia,
            goofs,
            soundtrackInfo,
            ageRating,
            parentalGuidance,
            language // Save the language
        });

        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ message: 'Error adding movie', error: error.message });
    }
};


// Update a movie
exports.updateMovie = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Error updating movie', error });
    }
};

// Delete a movie
exports.deleteMovie = async (req, res) => {
    const { id } = req.params;

    try {
        const movie = await Movie.findByIdAndDelete(id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting movie', error });
    }
};

// Get all movies
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find()
            .populate('director', 'name role')
            .populate('cast', 'name role')
            .sort('-releaseDate');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movies', error });
    }
};

// Search and filter movies
exports.searchMovies = async (req, res) => {
    try {
        const {
            title,
            genre,
            director,
            actor,
            minRating,
            maxRating,
            releaseYear,
            releaseDecade,
            country,
            language, // Include language in search
            keywords,
            sortBy
        } = req.query;

        const query = {};

        // Title search
        if (title) query.title = { $regex: title, $options: 'i' };

        // Genre filtering
        if (genre) query.genre = { $in: genre.split(',') };

        // Director and Actor filtering
        if (director) query.director = director;
        if (actor) query.cast = actor;

        // Rating range filtering
        if (minRating) query.averageRating = { ...query.averageRating, $gte: parseFloat(minRating) };
        if (maxRating) query.averageRating = { ...query.averageRating, $lte: parseFloat(maxRating) };

        // Release year and decade filtering
        if (releaseYear) {
            const start = new Date(`${releaseYear}-01-01`);
            const end = new Date(`${releaseYear}-12-31`);
            query.releaseDate = { $gte: start, $lte: end };
        }
        if (releaseDecade) {
            const start = new Date(`${releaseDecade}0-01-01`);
            const end = new Date(`${parseInt(releaseDecade) + 9}-12-31`);
            query.releaseDate = { $gte: start, $lte: end };
        }

        // Country and Language filtering
        if (country) query.country = { $regex: country, $options: 'i' };
        if (language) query.language = { $regex: language, $options: 'i' }; // Language filter

        // Keywords filtering
        if (keywords) query.keywords = { $in: keywords.split(',') };

        // Sorting
        const sortOption = {};
        if (sortBy === 'rating') sortOption.averageRating = -1;
        else if (sortBy === 'popularity') sortOption.viewCount = -1;
        else if (sortBy === 'releaseDate') sortOption.releaseDate = -1;

        // Fetch movies
        const movies = await Movie.find(query)
            .sort(sortOption)
            .populate('director cast', 'name');
        
        // Add a fallback for language if not present
        movies.forEach((movie) => {
            movie.language = movie.language || 'Unknown';
        });

        res.json(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ message: 'Error searching movies', error });
    }
};


// Get top movies of the month
exports.getTopMoviesOfTheMonth = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 1);
        endOfMonth.setDate(0);

        const movies = await Movie.find({
            releaseDate: { $gte: startOfMonth, $lte: endOfMonth }
        })
            .sort('-averageRating')
            .limit(10);

        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top movies of the month', error });
    }
};

// Get top 10 movies by genre
exports.getTop10ByGenre = async (req, res) => {
    const { genre } = req.query;
    if (!genre) return res.status(400).json({ message: 'Genre is required' });

    try {
        const movies = await Movie.find({ genre: { $in: [genre] } })
            .sort('-averageRating')
            .limit(10);

        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top movies by genre', error });
    }
};

// Update box office details
exports.updateBoxOffice = async (req, res) => {
    const { id } = req.params;
    const { domestic, international, openingWeekend } = req.body;

    try {
        console.log('Received Movie ID:', id); // Debugging log

        const movie = await Movie.findById(id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        // Update box office fields
        movie.boxOffice.domestic = domestic || movie.boxOffice.domestic;
        movie.boxOffice.international = international || movie.boxOffice.international;
        movie.boxOffice.openingWeekend = openingWeekend || movie.boxOffice.openingWeekend;
        movie.boxOffice.totalRevenue =
            (domestic || movie.boxOffice.domestic) +
            (international || movie.boxOffice.international);

        await movie.save();
        res.json({ message: 'Box office details updated successfully', movie });
    } catch (error) {
        console.error('Error in updateBoxOffice:', error); // Debugging log
        res.status(500).json({ message: 'Error updating box office details', error });
    }
};


exports.getMovieById = async (req, res) => {
    const { id } = req.params; // Access the movie ID from the path parameter

    try {
        const movie = await Movie.findById(id)
            .populate('director', 'name biography')
            .populate('cast', 'name biography');
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movie details', error });
    }
};

exports.sendUpcomingMovieEmails = async (req, res) => {
    try {
        // Get movies releasing in the next 7 days
        const upcomingMovies = await Movie.find({
            releaseDate: { 
                $gte: new Date(), 
                $lte: moment().add(7, 'days').toDate() // Calculate next 7 days
            },
        });

        if (upcomingMovies.length === 0) {
            console.log('No movies releasing in the next 7 days.');
        } else {
            // Dummy email recipients (could be dynamic)
            const emailList = ['user1@example.com', 'user2@example.com'];

            // Configure NodeMailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // Add in .env
                    pass: process.env.EMAIL_PASS, // Add in .env
                },
            });

            // Prepare email content
            const movieList = upcomingMovies.map((movie) => `${movie.title} - ${movie.releaseDate}`).join('\n');
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emailList.join(','),
                subject: 'Upcoming Movie Releases!',
                text: `Here are the movies releasing soon:\n\n${movieList}`,
            };

            // Send email
            await transporter.sendMail(mailOptions);
        }

        // Always return this success message
        res.status(200).json({ message: 'Email notifications sent successfully!' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ message: 'Error sending email notifications' });
    }
};

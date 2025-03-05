const Article = require('../models/article');

// Create a new article (Admin only)
exports.createArticle = async (req, res) => {
    console.log('Request user:', req.user); // Debugging line
    const { title, content, category, relatedMovies, relatedPersons, coverPhoto } = req.body;
    try {
        const article = new Article({
            title,
            content,
            category,
            relatedMovies,
            relatedPersons,
            coverPhoto,
            createdBy: req.user.id // Ensure req.user.id is used here
        });
        await article.save();
        res.status(201).json(article);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Error creating article', error });
    }
};

// Update an article (Admin only)
exports.updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content, category, relatedMovies, relatedPersons, coverPhoto } = req.body;
    try {
        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        article.title = title || article.title;
        article.content = content || article.content;
        article.category = category || article.category;
        article.relatedMovies = relatedMovies || article.relatedMovies;
        article.relatedPersons = relatedPersons || article.relatedPersons;
        article.coverPhoto = coverPhoto || article.coverPhoto;

        await article.save();
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error updating article', error });
    }
};

// Delete an article (Admin only)
exports.deleteArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        await article.delete();
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article', error });
    }
};

// Get all articles (Public)
exports.getAllArticles = async (req, res) => {
    const { category } = req.query;
    try {
        const query = {};
        if (category) query.category = category;

        const articles = await Article.find(query)
            .populate('relatedMovies', 'title')
            .populate('relatedPersons', 'name')
            .sort('-publishedDate');

        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error });
    }
};

// Get a single article by ID (Public)
exports.getArticleById = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id)
            .populate('relatedMovies', 'title')
            .populate('relatedPersons', 'name');
        if (!article) return res.status(404).json({ message: 'Article not found' });

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching article', error });
    }
};

// Search articles by keyword and category
exports.getArticleBySearch = async (req, res) => {
    const { keyword, category } = req.query;

    try {
        const query = {};

        if (keyword) {
            query.title = { $regex: keyword, $options: 'i' }; // Case-insensitive search in title
        }
        if (category) {
            query.category = { $regex: category, $options: 'i' }; // Case-insensitive search in category
        }

        const articles = await Article.find(query)
            .populate('relatedMovies', 'title')
            .populate('relatedPersons', 'name')
            .sort('-publishedDate');

        if (!articles.length) {
            return res.status(404).json({ message: 'No articles found' });
        }

        res.json(articles);
    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ message: 'Error searching articles', error });
    }
};

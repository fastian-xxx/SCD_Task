const List = require('../models/list');
const User = require('../models/user');

// Create a new custom list
exports.createList = async (req, res) => {
    const { title, description, movies } = req.body;

    try {
        // Ensure req.user is available
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Create the list
        const list = new List({
            title,
            description,
            movies,
            createdBy: req.user.id // Use the authenticated user's ID
        });

        await list.save();
        res.status(201).json({ message: 'List created successfully', list });
    } catch (error) {
        console.error('Error creating list:', error.message || error);
        res.status(500).json({
            message: 'Error creating list',
            error: error.message || 'Unknown error occurred'
        });
    }
};


// Update a custom list
exports.updateList = async (req, res) => {
    const { id } = req.params;
    const { title, description, movies } = req.body;
    try {
        const list = await List.findById(id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        if (list.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this list' });
        }

        list.title = title || list.title;
        list.description = description || list.description;
        list.movies = movies || list.movies;
        await list.save();

        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Error updating list', error });
    }
};

// Delete a custom list
exports.deleteList = async (req, res) => {
    const { id } = req.params;
    try {
        const list = await List.findById(id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        if (list.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this list' });
        }

        await list.delete();
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting list', error });
    }
};

// Follow a list
exports.followList = async (req, res) => {
    const { listId } = req.params;
    try {
        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const user = await User.findById(req.user._id);
        if (!user.followedLists.includes(listId)) {
            user.followedLists.push(listId);
            list.followers.push(req.user._id);
            await user.save();
            await list.save();
        }

        res.json({ message: 'List followed successfully', list });
    } catch (error) {
        res.status(500).json({ message: 'Error following list', error });
    }
};

// Unfollow a list
exports.unfollowList = async (req, res) => {
    const { listId } = req.params;
    try {
        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const user = await User.findById(req.user._id);
        user.followedLists = user.followedLists.filter(id => id.toString() !== listId);
        list.followers = list.followers.filter(id => id.toString() !== req.user._id.toString());

        await user.save();
        await list.save();

        res.json({ message: 'List unfollowed successfully', list });
    } catch (error) {
        res.status(500).json({ message: 'Error unfollowing list', error });
    }
};

// Fetch all lists (for exploring or sharing)
exports.getAllLists = async (req, res) => {
    try {
        const lists = await List.find().populate('createdBy', 'username').populate('movies', 'title');
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lists', error });
    }
};
// Get a single list by its ID
exports.getListById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the list by ID and populate related fields
        const list = await List.findById(id)
            .populate('createdBy', 'username') // Include creator's username
            .populate('movies', 'title');     // Include movie titles

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        res.json({ list });
    } catch (error) {
        console.error('Error fetching list by ID:', error.message);
        res.status(500).json({ message: 'Error fetching list', error });
    }
};

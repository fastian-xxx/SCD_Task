const Discussion = require('../models/discussion');
const mongoose = require('mongoose');

// Create a new discussion topic
exports.createDiscussion = async (req, res) => {
    const { title, content, category, relatedMovie, relatedPerson } = req.body;

    console.log('Request User:', req.user); // Debug log for user info

    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User is not logged in' });
        }

        const discussion = new Discussion({
            title,
            content,
            category,
            relatedMovie,
            relatedPerson,
            user: req.user.id, // Use user ID from the middleware
        });

        await discussion.save();
        res.status(201).json(discussion);
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ message: 'Error creating discussion', error });
    }
};

// Get all discussion topics
exports.getDiscussions = async (req, res) => {
    const { category } = req.query;
    try {
        const query = category ? { category } : {};
        const discussions = await Discussion.find(query)
            .populate('user', 'username')
            .populate('relatedMovie', 'title')
            .populate('relatedPerson', 'name')
            .sort('-createdAt');
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching discussions', error });
    }
};

// Get a single discussion by ID
exports.getDiscussionById = async (req, res) => {
    const { id } = req.params;
    try {
        const discussion = await Discussion.findById(id)
            .populate('user', 'username')
            .populate('replies.user', 'username');
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching discussion', error });
    }
};

// Add a reply to a discussion
exports.addReply = async (req, res) => {
    const { id } = req.params; // The discussion ID
    const { content } = req.body; // The reply content
    try {
        const discussion = await Discussion.findById(id);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        // Create the reply
        const reply = { user: req.user.id, content };
        discussion.replies.push(reply); // Add the reply to the replies array

        // Save the updated discussion
        await discussion.save();

        res.json({ message: 'Reply added successfully', discussion });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Error adding reply', error });
    }
};


// Delete a discussion or reply (Admin only)
exports.deleteDiscussionOrReply = async (req, res) => {
    const { id, replyId } = req.params;

    try {
        // Find the discussion by ID
        const discussion = await Discussion.findById(id);

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        if (replyId) {
            // Handle reply deletion
            const initialRepliesCount = discussion.replies.length;

            // Filter out the reply by replyId
            discussion.replies = discussion.replies.filter(reply => reply._id.toString() !== replyId);

            if (discussion.replies.length === initialRepliesCount) {
                return res.status(404).json({ message: 'Reply not found' });
            }

            // Save the updated discussion
            await discussion.save();
            return res.json({ message: 'Reply deleted successfully', discussion });
        } else {
            // Handle discussion deletion
            await discussion.deleteOne(); // Correct method to delete a document instance
            return res.json({ message: 'Discussion deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting discussion or reply:', error); // Log the error
        res.status(500).json({ message: 'Error deleting discussion or reply', error: error.message });
    }
};



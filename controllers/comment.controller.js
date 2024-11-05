const Comment = require('../models/Comment');

const readSingleComment = async (req, res) => {
    const { id } = req.params; 
    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        return res.status(200).json({ text: comment.content });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
};

const updateComment = async (req, res) => {
    const { id } = req.params; 
    const { content } = req.body;
    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.author_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized to update this comment" });
        }
        comment.content = content;
        await comment.save();
        return res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
}

const deleteComment = async (req, res) => {
    const { id } = req.params; 
    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.author_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this comment" });
        }
        await Comment.findByIdAndDelete(id);
        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
}

module.exports = {
    readSingleComment, updateComment , deleteComment, 
}
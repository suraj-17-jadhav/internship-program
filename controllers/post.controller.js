const Post = require('../models/Post');
const Comment = require('../models/Comment');

const listAllPosts = async(req,res) => {
    try {
        const posts = await Post.find().select('title content').populate('author_id', 'name');
        res.send(posts);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        if ( !title || !content) {
            return res.status(400).send({ error: 'All fields are required.' });
        }
        const newPost = new Post({
            author_id: req.user._id,
            title,
            content,
        });
        await newPost.save();
        res.status(201).send({ message: 'Post created successfully!', post: newPost });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
}

const readSinglePost = async(req,res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate('author_id', 'username');
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.json({
            title: post.title,
            content: post.content,
            username: post.author_id.username
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" , message: err.message });
    }
}

const updatePost = async(req,res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.author_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized to update this post" });
        }
        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();
        res.json({
            message: "Post updated successfully",
            post: {
                title: post.title,
                content: post.content
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
}

const deletePost = async(req,res) => {
    const { id } = req.params; 
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" }); 
        }
        if (post.author_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this post" }); 
        }
        await Post.findByIdAndDelete(id);
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
}

const addCommentToPost = async(req,res) => {
    const { post_id } = req.params; 
    const { content } = req.body; 
    if (!content) {
        return res.status(400).json({ error: "Comment text is required" });
    }
    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comment = new Comment({
            post_id,  
            content,
            author_id: req.user._id, 
        });
        await comment.save();
        return res.status(201).json({ message: "Comment added successfully", comment });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
   
}

const readCommentsOfPost = async(req,res) => {
    const { post_id } = req.params;  
    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comments = await Comment.find({ post_id }).populate('author_id', 'name');  
        return res.status(200).json(
            {   
                message: "Comments fetched successfully", 
                comments 
            }
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", details: error.message });
    }
}

module.exports = {
    listAllPosts, createPost , readSinglePost, updatePost  , deletePost , readCommentsOfPost , addCommentToPost,
}
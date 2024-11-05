const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const{listAllPosts,createPost,readSinglePost,updatePost,deletePost,readCommentsOfPost, addCommentToPost } = require('../controllers/post.controller')

router.get('/posts',listAllPosts);
router.post('/posts', requireLogin, createPost);
router.get('/posts/:id', readSinglePost);
router.put('/posts/:id', requireLogin ,updatePost);
router.delete('/posts/:id', requireLogin, deletePost);
router.post('/posts/:post_id/comments', requireLogin ,addCommentToPost);
router.get('/posts/:post_id/comments', readCommentsOfPost);

module.exports = router


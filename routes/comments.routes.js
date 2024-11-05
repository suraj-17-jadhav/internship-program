const express = require('express')
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const{readSingleComment,updateComment, deleteComment} = require('../controllers/comment.controller')

router.get('/comments/:id',readSingleComment);
router.put('/comments/:id', requireLogin ,updateComment); 
router.delete('/comments/:id', requireLogin ,deleteComment);

module.exports = router
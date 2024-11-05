const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post_id:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Post',
       require: true
    },
    content: {
        type: String,
        required: true,
    },
    author_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
},{
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
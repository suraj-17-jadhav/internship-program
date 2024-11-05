const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: 'User',
        require: true,
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Post', postSchema);
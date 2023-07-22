const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    blogHeader: {
        type: String,
        required: true
    },
    blogBody: {
        type: String,
        required: true
    },
    postedDate: {
        type: Date,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    writtenBy: {
        type: String,
        required: true
    }
});

const Blog = mongoose.model('blog', BlogSchema);

module.exports = Blog;
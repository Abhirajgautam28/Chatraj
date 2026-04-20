import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false // Sub-documents don't need their own ID to save memory
});

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    likes: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        ],
        index: true
    },
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        index: -1
    }
}, {
    versionKey: false,
    autoIndex: process.env.NODE_ENV !== 'production'
});

blogSchema.index({ title: 'text', content: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;

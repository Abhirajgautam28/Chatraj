import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { withCache, invalidateCache } from '../utils/cache.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        // Invalidate blog list cache
        await invalidateCache('blog:all');
        // Use req.user._id directly from optimized JWT payload
        const newBlog = new Blog({
            title,
            content,
            author: req.user._id
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await withCache('blog:all', 300, async () => {
            // Exclude large content and comments fields for list view performance
            return await Blog.find().select('-content -comments').populate('author', 'firstName lastName').sort({ createdAt: -1 }).lean();
        });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });
        const blog = await Blog.findById(id).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName').lean();
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

        // Use req.user._id directly from optimized JWT payload
        const userId = req.user._id;

        // Atomic toggle logic: try to remove user._id, if not found, add it.
        // First attempt removal.
        let blog = await Blog.findOneAndUpdate(
            { _id: id, likes: userId },
            { $pull: { likes: userId } },
            { new: true }
        );

        if (!blog) {
            // If removal did nothing, it means user hasn't liked it yet. Add it.
            blog = await Blog.findOneAndUpdate(
                { _id: id },
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        if (blog) {
            // Ensure consistency: lean populate
            blog = await Blog.findById(id).populate('author', 'firstName lastName').lean();
        }

        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        // Invalidate list cache as like count might be displayed
        await invalidateCache('blog:all');
        res.status(200).json(blog);
    } catch (error) {
        console.error('likeBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

        // Use req.user._id directly from optimized JWT payload
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $push: { comments: { user: req.user._id, text } } },
            { new: true }
        ).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName').lean();

        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        // Invalidate list cache as comment count might be displayed
        await invalidateCache('blog:all');
        res.status(201).json(blog);
    } catch (error) {
        console.error('commentOnBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (typeof topic !== 'string' || topic.trim().length === 0 || topic.trim().length > 200) return res.status(400).json({ error: 'Invalid topic' });
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Write a professional blog post of about 100 words on the topic: "${topic.trim().slice(0,200)}".`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ content: text });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

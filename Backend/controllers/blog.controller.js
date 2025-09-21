import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const author = await User.findOne({ email: req.user.email });

        if (!author) {
            return res.status(401).json({ error: 'User not found' });
        }

        const newBlog = new Blog({
            title,
            content,
            author: author._id
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'firstName lastName').sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName');
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
        const blog = await Blog.findById(req.params.id);
        const user = await User.findOne({ email: req.user.email });

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const likedIndex = blog.likes.indexOf(user._id);

        if (likedIndex > -1) {
            blog.likes.splice(likedIndex, 1);
        } else {
            blog.likes.push(user._id);
        }

        await blog.save();
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const blog = await Blog.findById(req.params.id);
        const user = await User.findOne({ email: req.user.email });

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const newComment = {
            user: user._id,
            text
        };

        blog.comments.push(newComment);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Write a professional blog post of about 100 words on the topic: "${topic}".`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ content: text });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

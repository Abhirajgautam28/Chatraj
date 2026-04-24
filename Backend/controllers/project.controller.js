import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { withCache, invalidateCache } from '../utils/cache.js';
import redisClient from '../services/redis.service.js';

export const getAllProject = async (req, res) => {
    try {
        const { category } = req.query;
        const cacheKey = `user:${req.user._id}:projects:${category || 'all'}`;

        const projects = await withCache(cacheKey, 300, async () => {
            const query = { users: { $in: [req.user._id] } };
            if (category) query.category = category;

            // Performance: Use cursor for large datasets to avoid memory spikes
            const results = [];
            const cursor = projectModel.find(query)
                .select('-fileTree')
                .lean()
                .cursor();

            for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
                results.push(doc);
            }
            return results;
        }, [`user:${req.user._id}:projects`]);

        res.status(200).json({ projects });
    } catch (err) {
        console.error('getAllProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 50, before } = req.query;

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid projectId' });
        }

        const query = { conversationId: new mongoose.Types.ObjectId(projectId) };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Optimization: Single Optimized MongoDB Aggregation for Chat History
        const messages = await mongoose.model('Message').aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $limit: parseInt(limit, 10) },
            {
                $project: {
                    _id: 1,
                    message: 1,
                    parentMessageId: 1,
                    reactions: 1,
                    deliveredTo: 1,
                    readBy: 1,
                    createdAt: 1,
                    sender: {
                        _id: "$sender._id",
                        firstName: "$sender.firstName",
                        lastName: "$sender.lastName",
                        email: "$sender.email"
                    }
                }
            }
        ]);

        res.status(200).json({ messages: messages.reverse() });
    } catch (err) {
        console.error('getProjectMessages error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, category, users: collaboratorIds } = req.body;
        await invalidateCache('project:showcase');
        await invalidateCache(`user:${req.user._id}:project-counts`);
        await invalidateCache(`user:${req.user._id}:projects`, true);

        const project = await projectModel.create({
            name,
            category,
            users: collaboratorIds ? [...collaboratorIds, req.user._id] : [req.user._id],
            createdBy: req.user._id
        });

        const allUserIds = collaboratorIds ? [...collaboratorIds, req.user._id] : [req.user._id];
        await userModel.updateMany({ _id: { $in: allUserIds } }, { $inc: { projectsCount: 1 } });
        res.status(201).json({ project });
    } catch (err) {
        console.error('createProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addUserToProject = async (req, res) => {
    try {
        const { projectId, users } = req.body;
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: req.user._id
        });
        return res.status(200).json({ project });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        const update = {};
        for (const [key, value] of Object.entries(sidebar)) {
            update[`settings.sidebar.${key}`] = value;
        }

        const project = await projectModel.findOneAndUpdate(
            { _id: projectId, users: req.user._id },
            { $set: update },
            { new: true }
        ).lean();

        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json({ sidebar: project.settings?.sidebar || {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProjectCountsByCategory = async (req, res) => {
  try {
    const cacheKey = `user:${req.user._id}:project-counts`;
    const result = await withCache(cacheKey, 60, async () => {
    const allCategories = ['DSA', 'Frontend Development', 'Backend Development', 'Fullstack Development', 'Code Review & Optimization', 'Testing & QA', 'API Development', 'Database Engineering', 'Software Architecture', 'Version Control & Git', 'Agile Project Management', 'CI/CD Automation', 'Debugging & Troubleshooting', 'Documentation Generation', 'Code Refactoring'];
    const counts = await projectModel.aggregate([
      { $match: { users: { $in: [new mongoose.Types.ObjectId(req.user._id)] } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const resMap = {};
    allCategories.forEach(cat => resMap[cat] = 0);
    counts.forEach(item => { if (resMap.hasOwnProperty(item._id)) resMap[item._id] = item.count; });
    return resMap;
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await withCache('project:showcase', 300, async () => {
            return await projectModel.find({}).select('-fileTree').sort({ users: -1 }).limit(10).lean();
        });
        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById({
            projectId: req.params.projectId,
            userId: req.user._id
        });
        res.status(200).json({ project });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const updateFileTree = async (req, res) => {
    try {
        const { projectId, fileTree, diff } = req.body;
        if (diff && typeof diff === 'object') {
            const project = await projectService.updateFileTreePartial({
                projectId,
                diff,
                userId: req.user._id
            });
            return res.status(200).json({ project });
        }
        const project = await projectService.updateFileTree({
            projectId,
            fileTree,
            userId: req.user._id
        });
        res.status(200).json({ project });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const getProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.findById(projectId).lean();
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const isMember = project.users && project.users.some(u => u.toString() === req.user._id.toString());
        if (!isMember) return res.status(401).json({ error: 'Unauthorized' });
        res.status(200).json({ settings: project.settings || {} });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { settings } = req.body;
        const project = await projectModel.findOneAndUpdate(
            { _id: projectId, users: req.user._id },
            { $set: { settings } },
            { new: true }
        ).lean();
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json({ settings: project.settings });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

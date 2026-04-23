import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { withCache, invalidateCache } from '../utils/cache.js';
import redisClient from '../services/redis.service.js';

export const getAllProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const cacheKey = `user:${userId}:projects`;

        const projects = await withCache(cacheKey, 300, async () => {
            return await projectModel.find({ users: { $in: [userId] } })
                .select('-fileTree')
                .lean();
        }, [`user:${userId}:projects`]);

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

        // Optimization: Lean projection and covered index query
        const messages = await mongoose.model('Message').find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit, 10))
            .lean();

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
        const userId = req.user._id;

        const project = await projectModel.create({
            name,
            category,
            users: collaboratorIds ? [...collaboratorIds, userId] : [userId],
            createdBy: userId
        });

        await invalidateCache(`user:${userId}:projects`, true);

        const allUserIds = collaboratorIds ? [...collaboratorIds, userId] : [userId];
        await userModel.updateMany({ _id: { $in: allUserIds } }, { $inc: { projectsCount: 1 } });

        if (typeof redisClient.pipeline === 'function') {
            const pipeline = redisClient.pipeline();
            for (const uid of allUserIds) {
                pipeline.zincrby('user:leaderboard:zset', 1, uid.toString());
            }
            pipeline.exec().catch(() => {});
        }

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

        // Use differential update if diff is provided
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
        const project = await projectModel.findOne({ _id: projectId, users: req.user._id })
            .select('settings')
            .lean();
        if (!project) return res.status(404).json({ error: 'Project not found' });
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

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await withCache('project:showcase', 300, async () => {
            return await projectModel.find({})
                .select('-fileTree')
                .sort({ users: -1 })
                .limit(10)
                .lean();
        });
        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import { withCache, invalidateCache } from '../utils/cache.js';
import { PROJECT_CATEGORIES } from '../config/constants.js';
import { successResponse, errorResponse } from '../utils/response.utils.js';

export const getAllProject = async (req, res) => {
    try {
        const projects = await projectModel.find({ users: { $in: [req.user._id] } }).lean();
        return successResponse(res, { projects });
    } catch (err) {
        logger.error('getAllProject error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

    try {
        const { name, category, users } = req.body;
        const project = await projectModel.create({
            name,
            category,
            users: users ? [...users, req.user._id] : [req.user._id],
            createdBy: req.user._id
        });
        await invalidateCache('project_showcase');
        return successResponse(res, { project }, 'Project created', 201);
    } catch (err) {
        logger.error('createProject error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

    try {
        const { projectId, users } = req.body;
        const project = await projectService.addUsersToProject({ projectId, users, userId: req.user._id });
        return successResponse(res, { project });
    } catch (err) {
        logger.error('addUserToProject error:', err);
        return errorResponse(res, err.message, 400);
    }
};

export const getProjectCountsByCategory = async (req, res) => {
  try {
    const counts = await projectModel.aggregate([
      { $match: { users: { $in: [new mongoose.Types.ObjectId(req.user._id)] } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const result = {};
    PROJECT_CATEGORIES.forEach(cat => result[cat] = 0);
    counts.forEach(item => { if (result.hasOwnProperty(item._id)) result[item._id] = item.count; });
    return successResponse(res, result);
  } catch (err) {
        logger.error('getProjectCountsByCategory error:', err);
        return errorResponse(res, 'Internal server error');
  }
};

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await withCache('project_showcase', 600, async () => {
            return await projectModel.find({}).sort({ users: -1 }).limit(10).lean();
        });
        return successResponse(res, { projects });
    } catch (error) {
        logger.error('getProjectShowcase error:', error);
        return errorResponse(res, 'Internal server error');
    }
};

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await projectService.getProjectById({ projectId, userId: req.user._id });
        return successResponse(res, { project });
    } catch (err) {
        logger.error('getProjectById error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        return errorResponse(res, err.message, status);
    }
};

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

    try {
        const { projectId, fileTree } = req.body;
        const project = await projectService.updateFileTree({ projectId, fileTree, userId: req.user._id });
        return successResponse(res, { project });
    } catch (err) {
        logger.error('updateFileTree error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        return errorResponse(res, err.message, status);
    }
};

export const getProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return errorResponse(res, 'Invalid projectId', 400);
        const project = await projectModel.findOne({ _id: projectId, users: req.user._id }).lean();
        if (!project) return errorResponse(res, 'Project not found or unauthorized', 404);
        return successResponse(res, { settings: project.settings || {} });
    } catch (err) {
        logger.error('getProjectSettings error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { settings } = req.body;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return errorResponse(res, 'Invalid projectId', 400);
        const project = await projectModel.findOneAndUpdate({ _id: projectId, users: req.user._id }, { $set: { settings } }, { new: true }).lean();
        if (!project) return errorResponse(res, 'Project not found or unauthorized', 404);
        return successResponse(res, { settings: project.settings });
    } catch (err) {
        logger.error('updateProjectSettings error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.findOneAndDelete({ _id: projectId, createdBy: req.user._id });
        if (!project) return errorResponse(res, 'Project not found or you are not the creator', 404);
        await invalidateCache('project_showcase');
        return successResponse(res, {}, 'Project deleted');
    } catch (err) {
        logger.error('deleteProject error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

export const leaveProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.findOneAndUpdate({ _id: projectId, users: req.user._id }, { $pull: { users: req.user._id } }, { new: true });
        if (!project) return errorResponse(res, 'Project not found or you are not a member', 404);
        return successResponse(res, {}, 'Left project');
    } catch (err) {
        logger.error('leaveProject error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

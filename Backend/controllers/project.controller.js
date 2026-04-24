import Project from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import { PROJECT_CATEGORIES } from '../config/constants.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const getAllProject = async (req, res) => {
    try {
        // req.user is populated by auth middleware
        const projects = await Project.find({ users: { $in: [req.user._id] } }).lean();
        sendSuccess(res, 200, { projects });
    } catch (err) {
        logger.error('getAllProject error:', err);
        sendError(res, 500, 'Failed to fetch projects', process.env.NODE_ENV === 'development' ? err.message : undefined);
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.array());
    }

    try {
        const { name, category, users } = req.body;
        if (!name || !category) {
            return sendError(res, 400, 'Name and category are required');
        }

        // Create new project using req.user._id from auth middleware
        const project = await Project.create({
            name,
            category,
            users: users ? [...users, req.user._id] : [req.user._id],
            createdBy: req.user._id
        });
        sendSuccess(res, 201, { project });
    } catch (err) {
        logger.error('createProject error:', err);
        sendError(res, 500, 'Failed to create project', process.env.NODE_ENV === 'development' ? err.message : undefined);
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.array());
    }

    try {
        const { projectId, users } = req.body;
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: req.user._id
        });
        return sendSuccess(res, 200, { project });
    } catch (err) {
        logger.error('addUserToProject error:', err);
        sendError(res, 400, err.message);
    }
}

// Update only sidebar settings for a project (deep merge)
export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        if (!sidebar || typeof sidebar !== 'object') {
            return sendError(res, 400, 'Sidebar settings required');
        }
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return sendError(res, 400, 'Invalid projectId');
        const project = await Project.findById(projectId);
        if (!project) return sendError(res, 404, 'Project not found');
        // Authorization: check if requesting user is member
        const isMember = project.users && project.users.some(u => u.toString() === req.user._id.toString());
        if (!isMember) return sendError(res, 401, 'Unauthorized');
        // Deep merge sidebar settings
        project.settings = project.settings || {};
        project.settings.sidebar = { ...project.settings.sidebar, ...sidebar };
        await project.save();
        sendSuccess(res, 200, { sidebar: project.settings.sidebar });
    } catch (err) {
        sendError(res, 500, err.message);
    }
};

// Get project counts by category
export const getProjectCountsByCategory = async (req, res) => {
  try {
    // Aggregate project counts by category, filtered by user from req.user
    const counts = await Project.aggregate([
      { $match: { users: { $in: [new mongoose.Types.ObjectId(req.user._id)] } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    // Convert to { [category]: count }
    const result = {};
    PROJECT_CATEGORIES.forEach(cat => {
      result[cat] = 0;
    });
    counts.forEach(item => {
      if (Object.prototype.hasOwnProperty.call(result, item._id)) {
        result[item._id] = item.count;
      }
    });
    sendSuccess(res, 200, result);
  } catch (err) {
        logger.error('getProjectCountsByCategory error:', err);
        sendError(res, 500, 'Internal server error');
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ users: -1 }).limit(10).lean();
        sendSuccess(res, 200, { projects });
    } catch (error) {
        logger.error('getProjectShowcase error:', error);
        sendError(res, 500, 'Internal server error');
    }
}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {
        const project = await projectService.getProjectById({
            projectId,
            userId: req.user._id
        });

        return sendSuccess(res, 200, {
            project
        })

    } catch (err) {
        logger.error('getProjectById error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        sendError(res, status, err.message);
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.array());
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree,
            userId: req.user._id
        })

        return sendSuccess(res, 200, {
            project
        })

    } catch (err) {
        logger.error('updateFileTree error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        sendError(res, status, err.message);
    }

}

export const getProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return sendError(res, 400, 'Invalid projectId');
        const project = await Project.findById(projectId).lean();
        if (!project) return sendError(res, 404, 'Project not found');
        const isMember = project.users && project.users.some(u => u.toString() === req.user._id.toString());
        if (!isMember) return sendError(res, 401, 'Unauthorized');
        sendSuccess(res, 200, { settings: project.settings || {} });
    } catch (err) {
        logger.error('getProjectSettings error:', err);
        sendError(res, 500, 'Internal server error');
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { settings } = req.body;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return sendError(res, 400, 'Invalid projectId');
        const project = await Project.findById(projectId);
        if (!project) return sendError(res, 404, 'Project not found');
        const isMember = project.users && project.users.some(u => u.toString() === req.user._id.toString());
        if (!isMember) return sendError(res, 401, 'Unauthorized');
        project.settings = settings;
        await project.save();
        sendSuccess(res, 200, { settings: project.settings });
    } catch (err) {
        logger.error('updateProjectSettings error:', err);
        sendError(res, 500, 'Internal server error');
    }
};

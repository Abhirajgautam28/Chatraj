import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import response from '../utils/response.js';

export const getAllProject = async (req, res) => {
    try {
        const projects = await projectService.getUserProjects(req.user.email);
        return response.success(res, { projects });
    } catch (err) {
        const status = err.message === 'User not found' ? 401 : 500;
        return response.error(res, err.message, status);
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { name, category, users } = req.body;
        const project = await projectService.createProject({
            name, category, users, userId: req.user._id
        });
        return response.success(res, { project }, 'Project created successfully', 201);
    } catch (err) {
        const status = err.message === 'Project name already exists' ? 409 : 400;
        return response.error(res, err.message, status);
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { projectId, users } = req.body;
        const project = await projectService.addUsersToProject({
            projectId, users, userId: req.user._id
        });
        return response.success(res, { project }, 'Users added successfully');
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        return response.error(res, err.message, status);
    }
}

export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        const result = await projectService.updateSidebarSettings(projectId, req.user._id, sidebar);
        return response.success(res, { sidebar: result });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 400);
        return response.error(res, err.message, status);
    }
};

export const getProjectCountsByCategory = async (req, res) => {
  try {
    const result = await projectService.getCountsByCategory(req.user.email);
    return response.success(res, result);
  } catch (err) {
    const status = err.message === 'User not found' ? 401 : 500;
    return response.error(res, err.message, status);
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await projectService.getShowcase();
        return response.success(res, { projects });
    } catch (err) {
        return response.error(res, 'Internal server error');
    }
}

export const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById({
            projectId: req.params.projectId,
            userId: req.user._id
        });
        return response.success(res, { project });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 400);
        return response.error(res, err.message, status);
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { projectId, fileTree } = req.body;
        const project = await projectService.updateFileTree({
            projectId, fileTree, userId: req.user._id
        })
        return response.success(res, { project }, 'File tree updated successfully');
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        return response.error(res, err.message, status);
    }
}

export const getProjectSettings = async (req, res) => {
    try {
        const settings = await projectService.getSettings(req.params.projectId, req.user._id);
        return response.success(res, { settings });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 500);
        return response.error(res, err.message, status);
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const settings = await projectService.updateSettings(req.params.projectId, req.user._id, req.body.settings);
        return response.success(res, { settings }, 'Settings updated successfully');
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 500);
        return response.error(res, err.message, status);
    }
};

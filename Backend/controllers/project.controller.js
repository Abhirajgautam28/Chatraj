import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';

export const getAllProject = async (req, res) => {
    try {
        const projects = await projectService.getUserProjects(req.user.email);
        res.status(200).json({ projects });
    } catch (err) {
        const status = err.message === 'User not found' ? 401 : 500;
        res.status(status).json({ error: err.message || 'Internal server error' });
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, category, users } = req.body;
        const project = await projectService.createProject({
            name, category, users, userId: req.user._id
        });
        res.status(201).json({ project });
    } catch (err) {
        const status = err.message === 'Project name already exists' ? 409 : 400;
        res.status(status).json({ error: err.message || 'Internal server error' });
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { projectId, users } = req.body;
        const project = await projectService.addUsersToProject({
            projectId, users, userId: req.user._id
        });
        res.status(200).json({ project });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        res.status(status).json({ error: err.message });
    }
}

export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        const result = await projectService.updateSidebarSettings(projectId, req.user._id, sidebar);
        res.status(200).json({ sidebar: result });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 400);
        res.status(status).json({ error: err.message });
    }
};

export const getProjectCountsByCategory = async (req, res) => {
  try {
    const result = await projectService.getCountsByCategory(req.user.email);
    res.status(200).json(result);
  } catch (err) {
    const status = err.message === 'User not found' ? 401 : 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await projectService.getShowcase();
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
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 400);
        res.status(status).json({ error: err.message })
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { projectId, fileTree } = req.body;
        const project = await projectService.updateFileTree({
            projectId, fileTree, userId: req.user._id
        })
        res.status(200).json({ project })
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        res.status(status).json({ error: err.message })
    }
}

export const getProjectSettings = async (req, res) => {
    try {
        const settings = await projectService.getSettings(req.params.projectId, req.user._id);
        res.status(200).json({ settings });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 500);
        res.status(status).json({ error: err.message });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const settings = await projectService.updateSettings(req.params.projectId, req.user._id, req.body.settings);
        res.status(200).json({ settings });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 500);
        res.status(status).json({ error: err.message });
    }
};

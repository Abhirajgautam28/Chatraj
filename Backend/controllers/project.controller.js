import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, category } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({ name, userId, category });

    res.status(201).json(newProject);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

export const getAllProject = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    const category = req.query.category;

    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id,
      category
    });

    return res.status(200).json({
      projects: allUserProjects
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }


}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const getProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json({ settings: project.settings || {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { settings } = req.body;
        const project = await projectModel.findByIdAndUpdate(
            projectId,
            { settings },
            { new: true }
        );
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json({ settings: project.settings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
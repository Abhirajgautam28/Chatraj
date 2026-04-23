import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';
import redisClient from './redis.service.js';

export const addUsersToProject = async ({ projectId, users, userId }) => {
    // Atomic update: ensure the requester (userId) is a member, then add new users.
    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId, users: userId },
        { $addToSet: { users: { $each: users } } },
        { new: true }
    );

    if (updatedProject) {
        // Atomic MongoDB denormalized count
        await mongoose.model('user').updateMany({ _id: { $in: users } }, { $inc: { projectsCount: 1 } });

        if (typeof redisClient.pipeline === 'function') {
            const pipeline = redisClient.pipeline();
            for (const uId of users) {
                pipeline.zincrby('user:leaderboard:zset', 1, uId.toString());
            }
            pipeline.exec().catch(() => {});
        }
    }

    if (!updatedProject) throw new Error("Unauthorized or project not found");
    return updatedProject;
}

export const getProjectById = async ({ projectId, userId }) => {
    const project = await projectModel.findOne({ _id: projectId, users: userId })
        .populate('users', '_id firstName lastName')
        .lean();

    if (!project) throw new Error("Project not found");
    return project;
}

// Zenith Feature: Differential Update (Partial fileTree updates)
export const updateFileTreePartial = async ({ projectId, diff, userId }) => {
    const update = {};
    for (const [filePath, fileData] of Object.entries(diff)) {
        if (fileData === null) {
            update[`$unset`] = update[`$unset`] || {};
            update[`$unset`][`fileTree.${filePath}`] = 1;
        } else {
            update[`$set`] = update[`$set`] || {};
            update[`$set`][`fileTree.${filePath}`] = fileData;
        }
    }

    const project = await projectModel.findOneAndUpdate(
        { _id: projectId, users: userId },
        update,
        { new: true }
    ).lean();

    if (!project) throw new Error("Unauthorized or project not found");
    return project;
}

export const updateFileTree = async ({ projectId, fileTree, userId }) => {
    const project = await projectModel.findOneAndUpdate(
        { _id: projectId, users: userId },
        { $set: { fileTree } },
        { new: true }
    ).lean();

    if (!project) throw new Error("Unauthorized or project not found");
    return project;
}

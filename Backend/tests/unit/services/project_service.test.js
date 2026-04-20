import * as projectService from '../../../services/project.service.js';
import projectModel from '../../../models/project.model.js';
import userModel from '../../../models/user.model.js';
import mongoose from 'mongoose';

jest.mock('../../../models/project.model.js');
jest.mock('../../../models/user.model.js');

describe('Project Service - Deepened', () => {
    afterEach(() => jest.clearAllMocks());

    describe('createProject', () => {
        test('should throw error if name or category is missing', async () => {
            await expect(projectService.createProject({ name: '' }))
                .rejects.toThrow('Name and category are required');
        });

        test('should handle duplicate project names', async () => {
            projectModel.create.mockRejectedValue({ code: 11000 });
            await expect(projectService.createProject({ name: 'p', userId: 'u', category: 'c' }))
                .rejects.toThrow('Project name already exists');
        });
    });

    describe('getProjectById', () => {
        test('should throw error for invalid projectId', async () => {
            await expect(projectService.getProjectById({ projectId: 'invalid' }))
                .rejects.toThrow('Invalid projectId');
        });

        test('should throw error if project not found', async () => {
            projectModel.findOne.mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(null)
            }));
            await expect(projectService.getProjectById({ projectId: new mongoose.Types.ObjectId().toString() }))
                .rejects.toThrow('Project not found');
        });

        test('should throw error if user is not a member', async () => {
            const pid = new mongoose.Types.ObjectId();
            const uid = new mongoose.Types.ObjectId();
            projectModel.findOne.mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue({
                    _id: pid,
                    users: [{ _id: new mongoose.Types.ObjectId() }]
                })
            }));
            await expect(projectService.getProjectById({ projectId: pid.toString(), userId: uid }))
                .rejects.toThrow('Unauthorized access');
        });
    });

    describe('updateFileTree', () => {
        test('should throw error for invalid fileTree structure (operator injection attempt)', async () => {
            const pid = new mongoose.Types.ObjectId().toString();
            const maliciousTree = { "$where": "true" };
            await expect(projectService.updateFileTree({ projectId: pid, fileTree: maliciousTree }))
                .rejects.toThrow('Invalid fileTree');
        });

        test('should update fileTree if user is member', async () => {
            const pid = new mongoose.Types.ObjectId().toString();
            const uid = new mongoose.Types.ObjectId();
            projectModel.findOne.mockResolvedValue({ _id: pid, users: [uid] });
            projectModel.findOneAndUpdate.mockResolvedValue({ _id: pid, fileTree: { 'a.js': {} } });

            const res = await projectService.updateFileTree({ projectId: pid, fileTree: { 'a.js': {} }, userId: uid });
            expect(res._id).toBe(pid);
        });
    });
});

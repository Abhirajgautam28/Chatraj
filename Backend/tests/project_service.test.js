import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';

jest.mock('../models/project.model.js');

describe('Project Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        const projectData = {
            name: 'New Project',
            userId: new mongoose.Types.ObjectId().toString(),
            category: 'Web'
        };

        test('should create a project successfully', async () => {
            projectModel.create.mockResolvedValue({ ...projectData, _id: 'proj123' });

            const project = await projectService.createProject(projectData);

            expect(projectModel.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Project',
                category: 'Web'
            }));
            expect(project._id).toBe('proj123');
        });

        test('should throw error if name is missing', async () => {
            await expect(projectService.createProject({ userId: 'u1', category: 'C1' }))
                .rejects.toThrow('Name is required');
        });

        test('should throw error if project name already exists', async () => {
            projectModel.create.mockRejectedValue({ code: 11000 });
            await expect(projectService.createProject(projectData))
                .rejects.toThrow('Project name already exists');
        });
    });

    describe('updateFileTree (and validateFileTree)', () => {
        const projectId = new mongoose.Types.ObjectId().toString();
        const userId = new mongoose.Types.ObjectId().toString();

        test('should update fileTree for a valid structure', async () => {
            const validTree = { 'index.html': { content: 'hello' } };
            projectModel.findOne.mockResolvedValue({ _id: projectId, users: [userId] });
            projectModel.findOneAndUpdate.mockResolvedValue({ _id: projectId, fileTree: validTree });

            const result = await projectService.updateFileTree({ projectId, fileTree: validTree, userId });

            expect(result.fileTree).toEqual(validTree);
        });

        test('should throw error for invalid fileTree (MongoDB operators)', async () => {
            const invalidTree = { '$set': { something: 'bad' } };
            await expect(projectService.updateFileTree({ projectId, fileTree: invalidTree, userId }))
                .rejects.toThrow('Invalid fileTree');
        });

        test('should throw error for invalid fileTree (keys with dots)', async () => {
            const invalidTree = { 'some.file.js': 'content' };
            await expect(projectService.updateFileTree({ projectId, fileTree: invalidTree, userId }))
                .rejects.toThrow('Invalid fileTree');
        });

        test('should throw error for invalid fileTree (non-plain objects)', async () => {
            const invalidTree = { 'file': new Date() };
            await expect(projectService.updateFileTree({ projectId, fileTree: invalidTree, userId }))
                .rejects.toThrow('Invalid fileTree');
        });

        test('should throw error if user is not authorized', async () => {
            projectModel.findOne.mockResolvedValue(null);
            const validTree = {};
            await expect(projectService.updateFileTree({ projectId, fileTree: validTree, userId }))
                .rejects.toThrow('Unauthorized access');
        });
    });

    describe('getProjectById', () => {
        test('should return project and check membership', async () => {
            const projectId = new mongoose.Types.ObjectId().toString();
            const userId = new mongoose.Types.ObjectId().toString();
            const mockProject = {
                _id: projectId,
                users: [{ _id: userId }],
                fileTree: null
            };

            projectModel.findOne.mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockProject)
            }));

            const project = await projectService.getProjectById({ projectId, userId });
            expect(project.fileTree).toEqual({});
            expect(project._id).toBe(projectId);
        });

        test('should throw error if project not found', async () => {
            projectModel.findOne.mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(null)
            }));
            await expect(projectService.getProjectById({ projectId: new mongoose.Types.ObjectId().toString() }))
                .rejects.toThrow('Project not found');
        });
    });
});

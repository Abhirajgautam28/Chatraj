import { createProject, getProjectById, updateFileTree } from '../../../services/project.service.js';
import projectModel from '../../../models/project.model.js';
import mongoose from 'mongoose';

jest.mock('../../../models/project.model.js');

describe('Project Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        test('should create a new project', async () => {
            const mockProject = { _id: '123', name: 'test', category: 'DSA' };
            projectModel.create.mockResolvedValue(mockProject);

            const result = await createProject({ name: 'test', userId: 'user1', category: 'DSA' });
            expect(result).toEqual(mockProject);
            expect(projectModel.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'test',
                category: 'DSA',
                createdBy: 'user1'
            }));
        });

        test('should throw error if name is missing', async () => {
            await expect(createProject({ category: 'DSA', userId: 'u1' }))
                .rejects.toThrow('Name and category are required');
        });
    });

    describe('getProjectById', () => {
        test('should return project if user is a member', async () => {
            const projectId = new mongoose.Types.ObjectId();
            const userId = new mongoose.Types.ObjectId();
            const mockProject = {
                _id: projectId,
                users: [{ _id: userId }],
                fileTree: {},
                populate: jest.fn().mockReturnThis()
            };

            projectModel.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockProject)
            });

            const result = await getProjectById({ projectId: projectId.toString(), userId });
            expect(result).toEqual(mockProject);
        });

        test('should throw unauthorized if user is not a member', async () => {
            const projectId = new mongoose.Types.ObjectId();
            const userId = new mongoose.Types.ObjectId();
            const otherUserId = new mongoose.Types.ObjectId();

            const mockProject = {
                _id: projectId,
                users: [{ _id: otherUserId }],
                populate: jest.fn().mockReturnThis()
            };

            projectModel.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockProject)
            });

            await expect(getProjectById({ projectId: projectId.toString(), userId }))
                .rejects.toThrow('Unauthorized access');
        });
    });

    describe('updateFileTree', () => {
        test('should prevent NoSQL injection in fileTree keys', async () => {
            const projectId = new mongoose.Types.ObjectId();
            const maliciousTree = {
                '$where': 'true',
                'normal.file': 'content'
            };

            await expect(updateFileTree({ projectId: projectId.toString(), fileTree: maliciousTree }))
                .rejects.toThrow('Invalid fileTree');
        });

        test('should update fileTree if valid', async () => {
            const projectId = new mongoose.Types.ObjectId();
            const validTree = { 'app.js': { file: { contents: 'console.log(1)' } } };

            projectModel.findOneAndUpdate.mockResolvedValue({ _id: projectId, fileTree: validTree });

            const result = await updateFileTree({ projectId: projectId.toString(), fileTree: validTree });
            expect(result.fileTree).toEqual(validTree);
        });
    });
});

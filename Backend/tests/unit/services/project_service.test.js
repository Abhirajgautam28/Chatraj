import * as projectService from '../../../services/project.service.js';
import projectModel from '../../../models/project.model.js';
import mongoose from 'mongoose';

jest.mock('../../../models/project.model.js');

describe('Project Service', () => {
    afterEach(() => jest.clearAllMocks());

    test('createProject should save a new project', async () => {
        projectModel.create.mockResolvedValue({ name: 'p', _id: 'id' });
        const res = await projectService.createProject({ name: 'p', userId: 'u', category: 'Web' });
        expect(res.name).toBe('p');
    });

    test('getProjectById should find and populate', async () => {
        const id = new mongoose.Types.ObjectId().toString();
        projectModel.findOne.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue({ _id: id, users: [{ _id: 'u1' }] })
        }));
        const res = await projectService.getProjectById({ projectId: id, userId: 'u1' });
        expect(res._id).toBe(id);
    });
});

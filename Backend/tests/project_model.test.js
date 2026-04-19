import mongoose from 'mongoose';
import Project from '../models/project.model.js';

describe('Project Model', () => {
    test('should create a valid project object', () => {
        const userId = new mongoose.Types.ObjectId();
        const projectData = {
            name: 'test-project',
            users: [userId],
            category: 'Web Development'
        };
        const project = new Project(projectData);

        expect(project.name).toBe('test-project');
        expect(project.users).toContain(userId);
        expect(project.category).toBe('Web Development');
        expect(project.fileTree).toEqual({});
    });

    test('should fail if name is missing', () => {
        const project = new Project({ category: 'Web' });
        const err = project.validateSync();
        expect(err.errors.name).toBeDefined();
    });

    test('should fail if category is missing', () => {
        const project = new Project({ name: 'p1' });
        const err = project.validateSync();
        expect(err.errors.category).toBeDefined();
    });

    test('should trim and lowercase the name', () => {
        const project = new Project({ name: '  My Project  ', category: 'Web' });
        expect(project.name).toBe('my project');
    });
});

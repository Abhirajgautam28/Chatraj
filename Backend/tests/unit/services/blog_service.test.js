import * as blogService from '../../../services/blog.service.js';
import Blog from '../../../models/blog.model.js';
import User from '../../../models/user.model.js';

jest.mock('../../../models/blog.model.js');
jest.mock('../../../models/user.model.js');

describe('Blog Service', () => {
    afterEach(() => jest.clearAllMocks());

    test('createBlog should save new blog', async () => {
        User.findOne.mockResolvedValue({ _id: 'u1' });
        Blog.prototype.save = jest.fn().mockResolvedValue({ title: 'T' });
        const res = await blogService.createBlog({ title: 'T', content: 'C', userEmail: 't@e.com' });
        expect(res.title).toBe('T');
    });
});

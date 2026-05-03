import User from '../../models/user.model.js';

describe('User Model', () => {
    test('should validate a valid user', async () => {
        const user = new User({ firstName: 'John', lastName: 'Doe', email: 'j@d.com', googleApiKey: 'k' });
        const err = user.validateSync();
        expect(err).toBeUndefined();
    });

    test('should fail if email is missing', async () => {
        const user = new User({ firstName: 'J' });
        const err = user.validateSync();
        expect(err.errors.email).toBeDefined();
    });
});

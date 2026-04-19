import Newsletter from '../models/newsletter.model.js';

describe('Newsletter Model', () => {
    test('should create a valid newsletter object', () => {
        const email = 'test@example.com';
        const newsletter = new Newsletter({ email });

        expect(newsletter.email).toBe('test@example.com');
        expect(newsletter.subscribedAt).toBeDefined();
    });

    test('should fail for invalid email format', () => {
        const newsletter = new Newsletter({ email: 'invalid-email' });
        const err = newsletter.validateSync();
        expect(err.errors.email).toBeDefined();
    });

    test('should fail if email is missing', () => {
        const newsletter = new Newsletter({});
        const err = newsletter.validateSync();
        expect(err.errors.email).toBeDefined();
    });
});

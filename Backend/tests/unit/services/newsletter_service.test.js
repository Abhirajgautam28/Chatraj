import * as newsletterService from '../../../services/newsletter.service.js';
import Newsletter from '../../../models/newsletter.model.js';
import { sendMailWithRetry } from '../../../utils/mailer.js';

jest.mock('../../../models/newsletter.model.js');
jest.mock('../../../utils/mailer.js');

describe('Newsletter Service', () => {
    afterEach(() => jest.clearAllMocks());

    test('subscribe should create entry and send mail', async () => {
        Newsletter.findOne.mockResolvedValue(null);
        Newsletter.create.mockResolvedValue({ email: 't@e.com' });
        sendMailWithRetry.mockResolvedValue({ messageId: '1' });

        const res = await newsletterService.subscribe('t@e.com');
        expect(res.subscription).toBeDefined();
        expect(sendMailWithRetry).toHaveBeenCalled();
    });

    test('subscribe should throw if already exists', async () => {
        Newsletter.findOne.mockResolvedValue({ email: 't@e.com' });
        await expect(newsletterService.subscribe('t@e.com')).rejects.toThrow('Email already subscribed');
    });
});

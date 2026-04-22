import { sendMailWithRetry } from '../../../utils/mailer.js';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('Mailer Utility', () => {
    test('sendMailWithRetry should throw if no providers configured', async () => {
        // Clear env to ensure no provider
        const originalEnv = process.env;
        process.env = { ...originalEnv, SMTP_HOST: '', SENDGRID_API_KEY: '', EMAIL_TEST_FALLBACK: 'false', NODE_ENV: 'production' };

        await expect(sendMailWithRetry({ to: 't@e.com' }))
            .rejects.toThrow('No email provider configured');

        process.env = originalEnv;
    });

    test('should try Ethereal in non-production if others missing', async () => {
        nodemailer.createTestAccount.mockResolvedValue({ user: 'u', pass: 'p' });
        nodemailer.createTransport.mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
        });

        const res = await sendMailWithRetry({ to: 't@e.com', subject: 'S' }, { retries: 1 });
        expect(res.messageId).toBe('123');
    });
});

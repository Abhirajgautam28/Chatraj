import { sendMailWithRetry } from '../utils/mailer.js';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('Mailer Utility', () => {
    const mailOptions = { to: 'test@example.com', subject: 'Hi', text: 'Body' };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.SMTP_HOST = 'smtp.example.com';
        process.env.SMTP_USER = 'user';
        process.env.SMTP_PASS = 'pass';
        process.env.NODE_ENV = 'production';
    });

    test('should fail fast if no providers are configured', async () => {
        delete process.env.SMTP_HOST;
        delete process.env.SENDGRID_API_KEY;
        process.env.EMAIL_TEST_FALLBACK = 'false';

        await expect(sendMailWithRetry(mailOptions)).rejects.toThrow('No email provider configured');
    });

    test('should send mail via SMTP if configured', async () => {
        const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
        const mockVerify = jest.fn().mockImplementation(cb => cb(null, true));
        nodemailer.createTransport.mockReturnValue({
            sendMail: mockSendMail,
            verify: mockVerify,
            close: jest.fn()
        });

        const result = await sendMailWithRetry(mailOptions);
        expect(result.messageId).toBe('123');
        expect(mockSendMail).toHaveBeenCalledWith(mailOptions);
    });

    test('should retry on failure', async () => {
        const mockSendMail = jest.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockResolvedValueOnce({ messageId: '456' });

        const mockVerify = jest.fn().mockImplementation(cb => cb(null, true));
        nodemailer.createTransport.mockReturnValue({
            sendMail: mockSendMail,
            verify: mockVerify,
            close: jest.fn()
        });

        const result = await sendMailWithRetry(mailOptions, { retries: 2, backoff: 1 });
        expect(result.messageId).toBe('456');
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });
});

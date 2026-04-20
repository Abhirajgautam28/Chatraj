import Newsletter from '../models/newsletter.model.js';
import { normalizeEmail } from '../utils/email.js';
import { escapeRegex } from '../utils/strings.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { getNewsletterHtml } from '../utils/templates.js';

export const subscribe = async (email) => {
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) throw new Error('Valid email is required');

    const existing = await Newsletter.findOne({
        email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' }
    });

    if (existing) throw new Error('Email already subscribed');

    const subscription = await Newsletter.create({ email: normalizedEmail });

    const sender = process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>';
    const mailOptions = {
        from: sender,
        to: normalizedEmail,
        subject: '🚀 Welcome to the ChatRaj Newsletter – Your Gateway to Next-Gen Collaboration!',
        html: getNewsletterHtml(),
        text: `Welcome to ChatRaj!\n\nThank you for subscribing to our newsletter.`,
    };

    try {
        await sendMailWithRetry(mailOptions);
    } catch (err) {
        return { subscription, emailError: true };
    }

    return { subscription };
};

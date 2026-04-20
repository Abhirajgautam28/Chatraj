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
        text: `Welcome to ChatRaj! 🎉\n\nYou’re officially part of a vibrant community of developers, creators, and AI enthusiasts.\n\nWhy ChatRaj?\n- AI-Powered Collaboration\n- Privacy & Security\n- Open Source (https://github.com/Abhirajgautam28/Chatraj)\n- Beautiful UI\n\nUpcoming Releases:\n- ChatRaj v2.1 (August 2025): AI suggestions & collaboration tools\n- ChatRaj v2.2 (September 2025): Project analytics & debugging\n- ChatRaj v3.0 (Late 2025): Full-stack AI assistant\n\nThank you for choosing ChatRaj.\nAbhiraj Gautam\nChatRaj Developer\nhttps://abhirajgautam.in`,
    };

    try {
        await sendMailWithRetry(mailOptions);
    } catch (err) {
        return { subscription, emailError: true };
    }

    return { subscription };
};

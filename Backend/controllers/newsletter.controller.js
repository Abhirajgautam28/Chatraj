import Newsletter from '../models/newsletter.model.js';
import { normalizeEmail } from '../utils/email.js';
import { escapeRegex } from '../utils/strings.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { getNewsletterWelcomeTemplate } from '../utils/templates.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    logger.info('Newsletter: Received subscribe request for:', email);
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) {
      return sendError(res, 400, 'Valid email is required.');
    }

    // Prevent duplicates against legacy mixed-case records by doing a
    // case-insensitive lookup. We then store the normalized email (with
    // domain lowercased) for consistent future inserts.
    const existing = await Newsletter.findOne({ email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' } });
    if (existing) {
      return sendError(res, 409, 'Email already subscribed.');
    }
    const subscription = await Newsletter.create({ email: normalizedEmail });
    try {
      const sender = process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>';
      const mailOptions = {
        from: sender,
        to: normalizedEmail,
        subject: '🚀 Welcome to the ChatRaj Newsletter – Your Gateway to Next-Gen Collaboration!',
        html: getNewsletterWelcomeTemplate(),
        text: `Welcome to ChatRaj!\n\nThank you for subscribing to the ChatRaj newsletter.\n\nWhy ChatRaj?\n- AI-Powered Collaboration: Real-time code editing, chat, and project management.\n- Privacy & Security: JWT, role-based access, and encryption.\n- Open Source: Join us on GitHub! https://github.com/Abhirajgautam28/Chatraj\n- Beautiful UI: Modern, themeable, and accessible.\n\nUpcoming Releases:\n- ChatRaj v2.1: Enhanced AI code suggestions, new collaboration tools, and improved performance (August 2025)\n- ChatRaj v2.2: Integrated project analytics, advanced debugging, and more language support (September 2025)\n- ChatRaj v3.0: Full-stack AI assistant, real-time code review, and team dashboards (Late 2025)\n\nCommunity Benefits:\n- Weekly tips, tutorials, and best practices.\n- Early access to new features and beta releases.\n- Direct feedback channel to the ChatRaj team.\n\nThank you for choosing ChatRaj.\nAbhiraj Gautam\nChatRaj Developer\nhttps://abhirajgautam.in\n\nYou’re receiving this email because you subscribed to the ChatRaj newsletter. To unsubscribe, reply to this email with 'unsubscribe'.`,
      };
      await sendMailWithRetry(mailOptions);
      logger.info('Newsletter: Email sent successfully via mailer utility');
      sendSuccess(res, 201, { subscription }, 'Subscribed successfully! Confirmation email sent.');
    } catch (mailErr) {
      logger.error('Newsletter: Email send failed:', mailErr);
      sendSuccess(res, 201, { subscription, emailError: true }, 'Subscribed, but confirmation email could not be sent.');
    }
  } catch (err) {
    logger.error('Newsletter subscribe error:', err);
    sendError(res, 500, 'Server error.');
  }
};

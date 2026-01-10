import Newsletter from '../models/newsletter.model.js';
import { normalizeEmail } from '../utils/email.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Newsletter: Received subscribe request for:', email);
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    const existing = await Newsletter.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already subscribed.' });
    }
    const subscription = await Newsletter.create({ email: normalizedEmail });
    try {
      const sender = process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>';
      const mailOptions = {
        from: sender,
        to: normalizedEmail,
        subject: '🚀 Welcome to the ChatRaj Newsletter – Your Gateway to Next-Gen Collaboration!',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fc; padding: 40px; border-radius: 16px; color: #222; box-shadow: 0 4px 24px rgba(37,99,235,0.08);">
            <div style="text-align:center;">
              <h1 style="color: #2563eb; font-size: 2.2em; margin-bottom: 8px;">Welcome to ChatRaj! 🎉</h1>
              <p style="font-size: 1.15em; color: #444; margin-bottom: 24px;">You’re officially part of a vibrant community of developers, creators, and AI enthusiasts.</p>
            </div>
            <div style="background: #eaf1fb; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #2563eb; margin-bottom: 12px;">Why ChatRaj?</h2>
              <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
                <li>🤖 <b>AI-Powered Collaboration</b> – Real-time code editing, chat, and project management.</li>
                <li>🔒 <b>Privacy & Security</b> – Your data is protected with JWT, role-based access, and encryption.</li>
                <li>🌐 <b>Open Source</b> – Join us on <a href='https://github.com/Abhirajgautam28/Chatraj' style='color:#2563eb;'>GitHub</a> and contribute!</li>
                <li>🎨 <b>Beautiful UI</b> – Modern, themeable, and accessible for all users.</li>
              </ul>
            </div>
            <div style="background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #e3eaf5;">
              <h2 style="color: #2563eb; margin-bottom: 12px;">🚀 Upcoming Releases</h2>
              <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
                <li><b>ChatRaj v2.1</b> – Enhanced AI code suggestions, new collaboration tools, and improved performance <span style='color:#22c55e;'>(August 2025)</span></li>
                <li><b>ChatRaj v2.2</b> – Integrated project analytics, advanced debugging, and more language support <span style='color:#22c55e;'>(September 2025)</span></li>
                <li><b>ChatRaj v3.0</b> – Full-stack AI assistant, real-time code review, and team dashboards <span style='color:#22c55e;'>(Late 2025)</span></li>
              </ul>
            </div>
            <div style="background: #eaf1fb; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #2563eb; margin-bottom: 12px;">🌟 Community Benefits</h2>
              <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
                <li>💡 Weekly tips, tutorials, and best practices.</li>
                <li>🎁 Early access to new features and beta releases.</li>
                <li>🗣️ Direct feedback channel to the ChatRaj team.</li>
              </ul>
            </div>
            <div style="text-align:center; margin-top:32px;">
              <p style="font-size: 15px; color: #555;">Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer<br/><a href='https://abhirajgautam.in' style="color: #2563eb;">abhirajgautam.in</a></p>
              <p style="font-size:13px; color:#888; margin-top:16px;">You’re receiving this email because you subscribed to the ChatRaj newsletter.<br/>To unsubscribe, reply to this email with 'unsubscribe'.</p>
            </div>
          </div>
        `,
        text: `Welcome to ChatRaj!\n\nThank you for subscribing to the ChatRaj newsletter.\n\nWhy ChatRaj?\n- AI-Powered Collaboration: Real-time code editing, chat, and project management.\n- Privacy & Security: JWT, role-based access, and encryption.\n- Open Source: Join us on GitHub! https://github.com/Abhirajgautam28/Chatraj\n- Beautiful UI: Modern, themeable, and accessible.\n\nUpcoming Releases:\n- ChatRaj v2.1: Enhanced AI code suggestions, new collaboration tools, and improved performance (August 2025)\n- ChatRaj v2.2: Integrated project analytics, advanced debugging, and more language support (September 2025)\n- ChatRaj v3.0: Full-stack AI assistant, real-time code review, and team dashboards (Late 2025)\n\nCommunity Benefits:\n- Weekly tips, tutorials, and best practices.\n- Early access to new features and beta releases.\n- Direct feedback channel to the ChatRaj team.\n\nThank you for choosing ChatRaj.\nAbhiraj Gautam\nChatRaj Developer\nhttps://abhirajgautam.in\n\nYou’re receiving this email because you subscribed to the ChatRaj newsletter. To unsubscribe, reply to this email with 'unsubscribe'.`,
      };
      let info = await transporter.sendMail(mailOptions);
      console.log('Newsletter: Email send response:', info);
      res.status(201).json({ message: 'Subscribed successfully! Confirmation email sent.', subscription });
    } catch (mailErr) {
      console.error('Newsletter: Email send failed:', mailErr);
      res.status(201).json({ message: 'Subscribed, but confirmation email could not be sent.', subscription, emailError: true });
    }
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

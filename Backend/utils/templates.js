/**
 * HTML Templates for emails.
 */
import { escapeHtml } from './strings.js';

export const getNewsletterHtml = () => {
  return `
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
        `;
};

export const getPasswordResetHtml = (name) => {
  const safeName = escapeHtml(name);
  return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fc; padding: 40px; border-radius: 16px; color: #222; box-shadow: 0 4px 24px rgba(37,99,235,0.08);">
        <div style="text-align:center;">
          <h1 style="color: #2563eb; font-size: 2.2em; margin-bottom: 8px;">Password Reset Successful 🎉</h1>
          <p style="font-size: 1.15em; color: #444; margin-bottom: 24px;">Hi <b>${safeName}</b>, your ChatRaj password has been reset successfully.</p>
        </div>
        <div style="background: #eaf1fb; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">What's Next?</h2>
          <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
            <li>🔑 <b>Login with your new password</b> – Your account is now secure and ready to use.</li>
            <li>📧 <b>Keep your email updated</b> – Ensure you receive important notifications.</li>
          </ul>
        </div>
        <div style="background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #e3eaf5;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">🚀 Need Help?</h2>
          <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
            <li>💡 Weekly tips, tutorials, and best practices.</li>
            <li>🗣️ Direct feedback channel to the ChatRaj team.</li>
          </ul>
        </div>
        <div style="text-align:center; margin-top:32px;">
          <a href="https://chatraj.vercel.app/login" style="display:inline-block;margin-top:12px;padding:12px 36px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(0,0,0,0.10);">Login to ChatRaj</a>
          <p style="font-size: 15px; color: #555; margin-top:24px;">Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer<br/><a href='https://abhirajgautam.in' style="color: #2563eb;">abhirajgautam.in</a></p>
          <p style="font-size:13px; color:#888; margin-top:16px;">If you did not request this change, please contact our support team immediately.</p>
        </div>
      </div>
    `;
};

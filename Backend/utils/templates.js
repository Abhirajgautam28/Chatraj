import { escapeHtml } from './strings.js';

/**
 * Generates the HTML for the OTP verification email.
 */
export const getOtpEmailTemplate = (otp) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fc; padding: 40px; border-radius: 16px; color: #222; box-shadow: 0 4px 24px rgba(37,99,235,0.08);">
      <div style="text-align:center;">
        <h1 style="color: #2563eb; font-size: 2.2em; margin-bottom: 8px;">Welcome to ChatRaj! 🎉</h1>
        <p style="font-size: 1.15em; color: #444; margin-bottom: 24px;">Verify your identity to activate your account.</p>
      </div>
      <div style="background: #fff; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #e3eaf5;">
        <p style="font-size: 16px; color: #555; margin-bottom: 16px;">Your One-Time Password (OTP) is:</p>
        <div style="font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 8px; margin-bottom: 16px;">${otp}</div>
        <p style="font-size: 14px; color: #888;">This code will expire in 15 minutes. Please enter it in the registration popup.</p>
      </div>
      <div style="text-align:center; margin-top:32px;">
        <p style="font-size: 15px; color: #555;">Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer</p>
      </div>
    </div>
  `;
};

/**
 * Generates the HTML for the password reset success email.
 */
export const getPasswordResetSuccessTemplate = (name) => {
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
      <div style="text-align:center; margin-top:32px;">
        <a href="https://chatraj.vercel.app/login" style="display:inline-block;margin-top:12px;padding:12px 36px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(0,0,0,0.10);">Login to ChatRaj</a>
        <p style="font-size: 15px; color: #555; margin-top:24px;">Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer</p>
      </div>
    </div>
  `;
};

/**
 * Generates the HTML for the newsletter subscription welcome email.
 */
export const getNewsletterWelcomeTemplate = () => {
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
          <li>🌐 <b>Open Source</b> – Join us on GitHub and contribute!</li>
          <li>🎨 <b>Beautiful UI</b> – Modern, themeable, and accessible for all users.</li>
        </ul>
      </div>
      <div style="background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #e3eaf5;">
        <h2 style="color: #2563eb; margin-bottom: 12px;">🚀 Upcoming Releases</h2>
        <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
          <li><b>ChatRaj v2.1</b> – Enhanced AI code suggestions <span style='color:#22c55e;'>(August 2025)</span></li>
          <li><b>ChatRaj v3.0</b> – Full-stack AI assistant <span style='color:#22c55e;'>(Late 2025)</span></li>
        </ul>
      </div>
      <div style="text-align:center; margin-top:32px;">
        <p style="font-size: 15px; color: #555;">Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer</p>
      </div>
    </div>
  `;
};

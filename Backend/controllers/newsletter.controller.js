import Newsletter from '../models/newsletter.model.js';
import nodemailer from 'nodemailer';

// Debug: Log SMTP config on startup
console.log('Newsletter SMTP config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  from: process.env.SMTP_FROM
});

// Configure nodemailer for any SMTP (Brevo/Sendinblue, Mailgun, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Newsletter: Received subscribe request for:', email);
    if (!email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    // Prevent duplicate subscriptions
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already subscribed.' });
    }
    const subscription = await Newsletter.create({ email });
    // Send confirmation email (customized)
    try {
      let sender = process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.in>';
      const mailOptions = {
        from: sender,
        to: email,
        subject: 'Thank you for subscribing to ChatRaj Newsletter!',
        html: `<h2>Thank you for subscribing to ChatRaj!</h2>
          <p>You will get weekly updates about new features and improvements.</p>
          <p>If you want to contribute, visit <a href='https://github.com/Abhirajgautam28/Chatraj'>our GitHub page</a>.</p>
          <p>Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer<br/><a href='https://abhirajgautam.in'>abhirajgautam.in</a></p>`,
        text: `Thank you for subscribing to ChatRaj!\n\nYou will get weekly updates about new features and improvements.\n\nIf you want to contribute, visit our GitHub page: https://github.com/Abhirajgautam28/Chatraj\n\nThank you for choosing ChatRaj.\nAbhiraj Gautam\nChatRaj Developer\nhttps://abhirajgautam.in`,
        replyTo: 'support@chatraj.in',
        returnPath: 'bounce@chatraj.in',
        headers: {
          'X-Mailer': 'ChatRaj Newsletter',
        }
      };
      console.log('Newsletter: Sending email with options:', mailOptions);
      let info;
      try {
        info = await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        // If sender is rejected, try fallback sender
        if (mailErr && mailErr.message && mailErr.message.includes('sender you used') && sender !== 'ChatRaj <no-reply@chatraj.in>') {
          console.warn('Brevo rejected sender, retrying with fallback sender...');
          mailOptions.from = 'ChatRaj <no-reply@chatraj.in>';
          info = await transporter.sendMail(mailOptions);
        } else {
          throw mailErr;
        }
      }
      console.log('Newsletter: Email send response:', info);
      res.status(201).json({ message: 'Subscribed successfully! Confirmation email sent.', subscription });
    } catch (mailErr) {
      // Email sending failed, but subscription is successful
      console.error('Newsletter: Email send failed:', mailErr);
      let errorMsg = 'Subscribed, but confirmation email could not be sent.';
      if (mailErr && mailErr.message && mailErr.message.includes('sender you used')) {
        errorMsg += ' The sender address is not validated in Brevo. Please verify your sender/domain.';
      }
      res.status(201).json({ message: errorMsg, subscription, emailError: true });
    }
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
// If you ever need to verify sender/domain in Brevo, go to https://app.brevo.com/email/senders and follow instructions. No manual steps required for this feature if SMTP_FROM is set to a verified address.

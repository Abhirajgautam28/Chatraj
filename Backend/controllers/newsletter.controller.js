import Newsletter from '../models/newsletter.model.js';
import nodemailer from 'nodemailer';

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
      const mailOptions = {
        from: 'ChatRaj <no-reply@chatraj.in>',
        to: email,
        subject: 'Thank you for subscribing to ChatRaj Newsletter!',
        html: `<h2>Thank you for subscribing to ChatRaj!</h2>
          <p>You will get weekly updates about new features and improvements.</p>
          <p>If you want to contribute, visit <a href='https://github.com/Abhirajgautam28/Chatraj'>our GitHub page</a>.</p>
          <p>Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer<br/><a href='https://abhirajgautam.in'>abhirajgautam.in</a></p>`
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('Newsletter: Email send response:', info);
      res.status(201).json({ message: 'Subscribed successfully! Confirmation email sent.', subscription });
    } catch (mailErr) {
      // Email sending failed, but subscription is successful
      console.error('Newsletter: Email send failed:', mailErr);
      res.status(201).json({ message: 'Subscribed, but confirmation email could not be sent.', subscription, emailError: true });
    }
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

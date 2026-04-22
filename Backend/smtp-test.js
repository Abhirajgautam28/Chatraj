import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Use only Gmail SMTP
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    logger.error('SMTP connection failed:', error);
  } else {
    logger.info('SMTP connection successful!');
  }
});
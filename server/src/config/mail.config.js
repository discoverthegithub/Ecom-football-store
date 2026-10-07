/**
 * Mail Configuration
 * -------------------
 * Configures Nodemailer SMTP transport.
 * Used by the emailHelper utility to send emails.
 */

import nodemailer from 'nodemailer';
import env from './env.config.js';
import logger from '../utils/logger.js';

/**
 * Create and return a configured Nodemailer transporter.
 * Uses SMTP credentials from environment variables.
 */
const createMailTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for port 465, false for others
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Verify the SMTP connection is working.
 * Called during server startup (optional, non-blocking).
 */
const verifyMailConnection = async () => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('⚠️  SMTP credentials not configured. Email features will be disabled.');
      return false;
    }

    const transporter = createMailTransporter();
    await transporter.verify();
    logger.info('✅ SMTP connection verified');
    return true;
  } catch (error) {
    logger.warn(`⚠️  SMTP verification failed: ${error.message}`);
    return false;
  }
};

export { createMailTransporter, verifyMailConnection };

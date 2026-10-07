/**
 * Email Helper
 * --------------
 * Sends transactional emails using Nodemailer.
 * All email templates are defined here as functions.
 *
 * Emails sent:
 *   - Email verification
 *   - Password reset
 *   - Welcome (after verification)
 *   - Order confirmation
 *   - Contact form notification to admin
 */

import { createMailTransporter } from '../config/mail.config.js';
import env from '../config/env.config.js';
import logger from './logger.js';

/**
 * Send an email using the configured SMTP transporter.
 * @param {object} options
 * @param {string} options.to — Recipient email
 * @param {string} options.subject — Email subject
 * @param {string} options.html — HTML body
 * @param {string} [options.text] — Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createMailTransporter();

    const mailOptions = {
      from: `"${env.APP_NAME}" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      ...(text && { text }),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${to}: ${info.messageId}`);

    return info;
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
    // Don't throw — email failure should not break the main flow
    return null;
  }
};

/**
 * Send email verification email.
 * @param {string} to — User's email
 * @param {string} name — User's first name
 * @param {string} verificationToken — Raw verification token
 */
const sendVerificationEmail = async (to, name, verificationToken) => {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${env.APP_NAME}</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for creating an account. Please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #e94560 0%, #c23152 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 13px; line-height: 1.6;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #bbb; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Verify your email — ${env.APP_NAME}`,
    html,
  });
};

/**
 * Send password reset email.
 * @param {string} to — User's email
 * @param {string} name — User's first name
 * @param {string} resetToken — Raw reset token
 */
const sendPasswordResetEmail = async (to, name, resetToken) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${env.APP_NAME}</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #e94560 0%, #c23152 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 13px; line-height: 1.6;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #bbb; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Reset your password — ${env.APP_NAME}`,
    html,
  });
};

/**
 * Send welcome email after successful verification.
 * @param {string} to — User's email
 * @param {string} name — User's first name
 */
const sendWelcomeEmail = async (to, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${env.APP_NAME}</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Welcome, ${name}! 🎉</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your email has been verified and your account is now active.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Start exploring our premium collection of men's clothing curated just for you.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.CLIENT_URL}" style="background: linear-gradient(135deg, #e94560 0%, #c23152 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              Start Shopping
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #bbb; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${env.APP_NAME}! 🎉`,
    html,
  });
};

/**
 * Send contact form notification to admin.
 * @param {object} contact — { name, email, phone, subject, message }
 */
const sendContactNotificationEmail = async (contact) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', sans-serif; padding: 20px;">
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">${contact.name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${contact.email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${contact.phone || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subject</td><td style="padding: 8px; border: 1px solid #ddd;">${contact.subject || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td><td style="padding: 8px; border: 1px solid #ddd;">${contact.message}</td></tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: env.SMTP_USER, // Send to admin email
    subject: `New Contact: ${contact.subject || 'No Subject'} — ${env.APP_NAME}`,
    html,
  });
};

export {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactNotificationEmail,
};

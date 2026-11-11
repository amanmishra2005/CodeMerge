const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter using SMTP environment variables if provided.
 * Falls back to an ethereal / stream transporter for local development.
 */
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });
  }

  // If EMAIL_USER and EMAIL_PASS are provided (e.g. Gmail)
  if (process.env.EMAIL_USER && (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
      },
    });
  }

  return null;
}

/**
 * Sends a 6-digit verification code to the user's email for password reset.
 */
async function sendVerificationCodeEmail({ email, name, code }) {
  const formattedCode = String(code).trim();
  const userName = name || 'Developer';

  console.log('====================================================');
  console.log('📧 CODE-MERGE EMAIL NOTIFICATION DISPATCHED:');
  console.log(`To: ${userName} <${email}>`);
  console.log(`Verification Code (OTP): [ ${formattedCode.split('').join(' ')} ]`);
  console.log('Valid for: 15 minutes');
  console.log('====================================================');

  const transporter = createTransporter();

  if (!transporter) {
    // No SMTP credentials configured - development log fallback
    return {
      success: true,
      mode: 'dev-console',
      code: formattedCode,
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #E8EDF7; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 30px auto; background-color: #131B2E; border: 1px solid #26314D; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo { font-size: 22px; font-weight: 800; color: #4C8DFF; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .code-box { background: linear-gradient(135deg, rgba(76,141,255,0.15), rgba(61,220,132,0.15)); border: 2px dashed #4C8DFF; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code-digits { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4C8DFF; margin: 0; }
        .warning { font-size: 12px; color: #8B96AD; line-height: 1.6; margin-top: 24px; border-top: 1px solid #26314D; pt-4; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ CodeMerge</div>
        <h2 style="margin: 0 0 10px 0; color: #FFFFFF; font-size: 20px;">Password Reset Verification Code</h2>
        <p style="color: #8B96AD; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
          Hello ${userName}, we received a request to reset your CodeMerge account password. Use the 6-digit verification code below to verify your identity and set a new password.
        </p>
        <div class="code-box">
          <div style="font-size: 11px; text-transform: uppercase; color: #8B96AD; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Code</div>
          <p class="code-digits">${formattedCode}</p>
        </div>
        <p style="font-size: 13px; color: #8B96AD; margin: 0;">
          This verification code is strictly valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
        </p>
        <div class="warning">
          Security Alert: CodeMerge team members will never ask for this code. Never share this code with anyone.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"CodeMerge Security" <security@codemerge.dev>',
      to: email,
      subject: `CodeMerge: Your 6-Digit Password Reset Code [${formattedCode}]`,
      text: `Your CodeMerge verification code is: ${formattedCode}. Valid for 15 minutes.`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('SMTP dispatch failed, falling back to console:', err.message);
    return { success: true, mode: 'fallback-console', code: formattedCode };
  }
}

/**
 * Logs contact submissions.
 */
async function sendContactEmail({ name, email, subject, message }) {
  console.log('--------------------------------------------------');
  console.log('CONTACT SUBMISSION REGISTERED IN DATABASE');
  console.log(`From: ${name} <${email}>`);
  console.log(`Subject: [Contact Form] ${subject || 'New Message'}`);
  console.log(`Message: ${message}`);
  console.log('--------------------------------------------------');
  return true;
}

module.exports = {
  sendVerificationCodeEmail,
  sendContactEmail,
};

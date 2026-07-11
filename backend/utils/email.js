const nodemailer = require('nodemailer');

/**
 * Sends a notification email to support.codemerge@gmail.com
 * when someone submits the contact form.
 */
async function sendContactEmail({ name, email, subject, message }) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('--------------------------------------------------');
    console.log('EMAIL SIMULATION (SMTP credentials not configured in backend/.env)');
    console.log(`To: support.codemerge@gmail.com`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: [Contact Form] ${subject || 'New Message'}`);
    console.log(`Message: ${message}`);
    console.log('--------------------------------------------------');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport(
      host === 'smtp.gmail.com'
        ? {
            service: 'gmail',
            auth: { user, pass },
          }
        : {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          }
    );

    const mailOptions = {
      from: `"${name}" <${user}>`,
      replyTo: email,
      to: 'support.codemerge@gmail.com',
      subject: `CodeMerge Contact: ${subject || 'New Message'}`,
      text: `You have received a new contact submission on CodeMerge.

Sender Name: ${name}
Sender Email: ${email}
Subject: ${subject || 'N/A'}

Message:
-----------------------------------------
${message}
-----------------------------------------
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send contact email:', error.message);
    return false;
  }
}

module.exports = sendContactEmail;

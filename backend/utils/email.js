const axios = require('axios');

/**
 * Sends a notification email when someone submits the contact form using Web3Forms.
 */
async function sendContactEmail({ name, email, subject, message }) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    console.log('--------------------------------------------------');
    console.log('EMAIL SIMULATION (Web3Forms access key not configured in backend/.env)');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: [Contact Form] ${subject || 'New Message'}`);
    console.log(`Message: ${message}`);
    console.log('--------------------------------------------------');
    return false;
  }

  try {
    const response = await axios.post('https://api.web3forms.com/submit', {
      access_key: accessKey,
      name,
      email,
      subject: subject || 'New Message from CodeMerge Contact Form',
      message,
      from_name: 'CodeMerge Contact Form',
    });

    if (response.data && response.data.success) {
      console.log('Email sent successfully via Web3Forms:', response.data.message);
      return true;
    } else {
      console.error('Failed to send email via Web3Forms:', response.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Failed to send contact email via Web3Forms:', error.message);
    return false;
  }
}

module.exports = sendContactEmail;

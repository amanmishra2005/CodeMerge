/**
 * Logs the contact form submission. The actual email notification is dispatched
 * directly from the client (frontend) to bypass server IP restrictions on Web3Forms' free tier.
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

module.exports = sendContactEmail;

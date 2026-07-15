const express = require('express');
const Contact = require('../models/Contact');
const sendContactEmail = require('../utils/email');

const router = express.Router();

// @route  POST /api/contact
// @desc   Public endpoint - store a contact/query/suggestion message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }

    const contact = await Contact.create({ name, email, subject, message });

    // Dispatch direct message notification
    await sendContactEmail({ name, email, subject, message });

    res.status(201).json({ message: 'Thanks! Your message has been received.', contact });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit your message', error: err.message });
  }
});

// @route  GET /api/contact/config
// @desc   Public endpoint - retrieve Web3Forms access key
router.get('/config', (req, res) => {
  res.json({ accessKey: process.env.WEB3FORMS_ACCESS_KEY || '' });
});

module.exports = router;

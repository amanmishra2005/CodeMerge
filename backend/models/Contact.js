const mongoose = require('../mongoose-provider');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, default: 'General Inquiry' },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);

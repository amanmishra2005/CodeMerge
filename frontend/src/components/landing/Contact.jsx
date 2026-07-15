import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      // 1. Save contact submission to DB via backend
      await api.post('/contact', form);

      // 2. Fetch the Web3Forms access key dynamically from the backend config
      let accessKey = '';
      try {
        const configRes = await api.get('/contact/config');
        accessKey = configRes.data?.accessKey;
      } catch (configErr) {
        console.error('Failed to retrieve Web3Forms configuration:', configErr);
      }

      if (!accessKey) {
        throw new Error('Contact email configuration is missing.');
      }

      // 3. Dispatch the submission directly to Web3Forms from the client (browser)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.name,
          email: form.email,
          subject: form.subject || 'New Message from CodeMerge Contact Form',
          message: form.message,
          from_name: 'CodeMerge Contact Form',
        }),
      });

      const result = await response.json();
      if (result && result.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result?.message || 'Failed to send email via Web3Forms.');
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto flex flex-col items-center max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col items-center"
        >
          <span className="eyebrow">contact</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-text md:text-4xl">
            Questions, bugs, or a feature idea?
          </h2>
          <p className="mt-4 max-w-lg text-muted text-sm leading-relaxed">
            Send it over — we read every message. Whether it's a platform we should add or
            something that broke, tell us here.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="card space-y-4 p-6 sm:p-8 w-full max-w-xl text-left border border-border/80 bg-surface2/30 backdrop-blur-md"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="input-field"
            />
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
              className="input-field"
            />
          </div>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject (optional)"
            className="input-field"
          />
          <textarea
            required
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your query or suggestion..."
            rows={5}
            className="input-field resize-none"
          />

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full shadow-[0_0_20px_rgba(76,141,255,0.15)]">
            {status === 'loading' ? 'Sending...' : (
              <>
                Send message <Send size={16} />
              </>
            )}
          </button>

          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-easy justify-center"
            >
              <CheckCircle2 size={16} /> Message sent. Thanks for reaching out!
            </motion.p>
          )}
          {status === 'error' && <p className="text-sm text-hard text-center">{error}</p>}
        </motion.form>
      </div>
    </section>
  );
}

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
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">contact</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-text md:text-4xl">
            Questions, bugs, or a feature idea?
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Send it over — we read every message. Whether it's a platform we should add or
            something that broke, tell us here.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="card space-y-4 p-6"
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

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
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
              className="flex items-center gap-2 text-sm text-easy"
            >
              <CheckCircle2 size={16} /> Message sent. Thanks for reaching out!
            </motion.p>
          )}
          {status === 'error' && <p className="text-sm text-hard">{error}</p>}
        </motion.form>
      </div>
    </section>
  );
}

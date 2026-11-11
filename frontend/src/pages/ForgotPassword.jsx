import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, ArrowRight, ArrowLeft, Mail, CheckCircle2, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import api from '../api/axios.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data?.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 bg-ink">
      {/* Background ambient glow */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent2/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card relative z-10 w-full max-w-md p-8 border border-border/80 shadow-2xl"
      >
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-[0_0_15px_rgba(76,141,255,0.2)]">
            <GitMerge size={20} />
          </span>
          CodeMerge
        </Link>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h1 className="mt-6 font-display text-2xl font-bold text-text">Reset your password</h1>
              <p className="mt-1 text-sm text-muted">
                Enter the email associated with your account and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Email address</label>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 rounded-lg bg-hard/10 border border-hard/30 px-3 py-2 text-xs text-hard"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Sending link...</span>
                    </div>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
                >
                  <ArrowLeft size={13} /> Back to Log in
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-5 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-easy/15 text-easy border border-easy/25 shadow-[0_0_20px_rgba(61,220,132,0.15)]">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-text">Instructions Sent</h2>
                <p className="mt-2 text-sm text-muted">
                  If an account exists for <span className="text-text font-medium">{email}</span>, we've dispatched a secure password reset link.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-surface/80 p-4 text-left space-y-2.5 text-xs text-muted">
                <div className="flex items-center gap-2 text-text font-medium">
                  <Clock size={14} className="text-accent" />
                  <span>Link valid for 15 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-text font-medium">
                  <ShieldCheck size={14} className="text-easy" />
                  <span>Single-use cryptographic token</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted/80">
                  Please check your inbox and spam folder. If you don't receive an email, make sure your address was typed correctly.
                </p>
              </div>

              {/* Dev mode / local testing direct link banner */}
              {devResetUrl && (
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Dev Test Link</span>
                    <span className="text-[10px] text-muted font-mono">Local preview</span>
                  </div>
                  <p className="text-xs text-muted">Click below to proceed to the reset page:</p>
                  <a
                    href={devResetUrl}
                    className="btn-secondary !py-1.5 !px-3 text-xs w-full block text-center font-mono text-accent hover:underline truncate"
                  >
                    Open Reset Link →
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowLeft size={16} /> Return to Log in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


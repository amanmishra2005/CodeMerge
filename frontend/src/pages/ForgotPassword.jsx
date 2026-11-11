import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge,
  ArrowRight,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axios.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      if (res.data?.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to process password reset request. Please check the email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = devResetUrl || (resetToken ? `${window.location.origin}/reset-password/${resetToken}` : '');
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 py-16 bg-ink">
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
        className="card relative z-10 w-full max-w-md p-6 sm:p-8 border border-border/80 shadow-2xl bg-surface/95"
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
                Enter your registered email address and we'll generate a secure cryptographic reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Email address</label>
                  <div className="relative">
                    <input
                      required
                      autoFocus
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
                    className="flex items-start gap-2 rounded-lg bg-hard/10 border border-hard/30 px-3 py-2 text-xs text-hard"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50 !py-3"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Generating secure link...</span>
                    </div>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs text-muted pt-2 border-t border-border/40">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 hover:text-text transition-colors"
                >
                  <ArrowLeft size={13} /> Back to Log in
                </Link>
                <Link to="/register" className="text-accent hover:underline">
                  Don't have an account?
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
                <h2 className="font-display text-xl font-bold text-text">Reset Link Ready</h2>
                <p className="mt-2 text-sm text-muted">
                  A single-use password reset token has been verified for <span className="text-text font-medium">{email}</span>.
                </p>
              </div>

              {/* Direct Clickable Reset Button */}
              {resetToken && (
                <div className="pt-1">
                  <Link
                    to={`/reset-password/${resetToken}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 !py-3 font-display font-semibold shadow-[0_0_20px_rgba(76,141,255,0.3)] hover:shadow-[0_0_25px_rgba(76,141,255,0.45)]"
                  >
                    <span>Proceed to Reset Password</span>
                    <ArrowRight size={17} />
                  </Link>
                </div>
              )}

              {/* Security info card */}
              <div className="rounded-xl border border-border/70 bg-surface/80 p-4 text-left space-y-2.5 text-xs text-muted">
                <div className="flex items-center gap-2 text-text font-medium">
                  <Clock size={14} className="text-accent" />
                  <span>Valid for 15 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-text font-medium">
                  <ShieldCheck size={14} className="text-easy" />
                  <span>Single-use SHA-256 hashed token</span>
                </div>
              </div>

              {/* Reset link preview & copy */}
              {(devResetUrl || resetToken) && (
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                      Reset Link
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-medium"
                    >
                      {copied ? <Check size={12} className="text-easy" /> : <Copy size={12} />}
                      <span>{copied ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate select-all bg-ink/50 p-2 rounded-lg border border-border/40">
                    {devResetUrl || `${window.location.origin}/reset-password/${resetToken}`}
                  </div>
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

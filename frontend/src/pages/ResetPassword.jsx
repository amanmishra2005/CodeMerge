import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import api from '../api/axios.js';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    let isMounted = true;
    const verifyToken = async () => {
      setVerifying(true);
      try {
        const res = await api.get(`/auth/verify-reset-token/${token}`);
        if (isMounted) {
          if (res.data?.valid) {
            setTokenValid(true);
            setUserEmail(res.data.email || '');
          } else {
            setTokenValid(false);
            setTokenError(res.data?.message || 'Invalid or expired reset token');
          }
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(
            err.response?.data?.message ||
              'This password reset link is invalid or has expired. Please request a new one.'
          );
        }
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No reset token provided');
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Criteria checks for password
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const score = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (score === 0) return { label: 'Empty', color: 'bg-border', text: 'text-muted' };
    if (score <= 2) return { label: 'Weak', color: 'bg-hard', text: 'text-hard' };
    if (score <= 4) return { label: 'Medium', color: 'bg-medium', text: 'text-medium' };
    return { label: 'Strong', color: 'bg-easy', text: 'text-easy' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (score < 5) {
      setError('Please fulfill all password security requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 bg-ink">
      {/* Background ambient lighting */}
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

        {verifying ? (
          <div className="py-16 text-center space-y-4">
            <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-border border-t-accent" />
            <p className="text-sm text-muted">Verifying secure reset token...</p>
          </div>
        ) : !tokenValid ? (
          <div className="mt-6 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hard/15 text-hard border border-hard/30">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-text">Invalid Reset Link</h1>
              <p className="mt-2 text-sm text-muted">{tokenError}</p>
            </div>
            <div className="pt-2">
              <Link to="/forgot-password" className="btn-primary w-full flex items-center justify-center gap-2">
                Request a new link <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="mt-6 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-easy/15 text-easy border border-easy/25 shadow-[0_0_20px_rgba(61,220,132,0.15)]">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-text">Password Reset!</h1>
              <p className="mt-2 text-sm text-muted">
                Your password has been securely updated. Redirecting you to login...
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                Go to Log in Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="mt-6 font-display text-2xl font-bold text-text">Create new password</h1>
            <p className="mt-1 text-sm text-muted">
              {userEmail ? (
                <>
                  Setting new password for <span className="text-text font-medium">{userEmail}</span>
                </>
              ) : (
                'Choose a strong password to protect your account.'
              )}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input-field pl-10 pr-10"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface2 overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          score >= lvl ? strength.color : 'bg-surface2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Confirm Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input-field pl-10 pr-10"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-[11px] text-hard">Passwords do not match</p>
                )}
              </div>

              {/* Security requirements checklist */}
              <div className="rounded-xl border border-border/70 bg-surface/60 p-3.5 space-y-1.5 text-xs text-muted">
                <span className="block font-semibold text-text mb-2 text-[11px] uppercase tracking-wider">
                  Password Requirements
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLen ? 'text-easy' : 'text-muted'}`}>
                    {hasMinLen ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-easy' : 'text-muted'}`}>
                    {hasUpper ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-easy' : 'text-muted'}`}>
                    {hasLower ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-easy' : 'text-muted'}`}>
                    {hasNumber ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>1+ Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-easy' : 'text-muted'}`}>
                    {hasSpecial ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>1+ Special char (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-hard/10 border border-hard/30 px-3 py-2 text-xs text-hard">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || score < 5 || !passwordsMatch}
                className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Updating password...</span>
                  </div>
                ) : (
                  <>
                    Update Password <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}


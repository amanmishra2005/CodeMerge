import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge,
  ArrowRight,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: 6-Digit Code, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Handle countdown timer for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first digit box when advancing to step 2
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Step 1: Send 6-Digit Code
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (res.data?.devCode) {
        setDevCode(res.data.devCode);
      }
      setResendCooldown(30);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to send verification code. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Individual Digit Inputs & Paste
  const handleDigitChange = (index, value) => {
    const val = value.replace(/\D/g, ''); // numbers only
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // If pasted multiple digits
    if (val.length > 1) {
      const pasted = val.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(5, pasted.length);
      if (inputRefs.current[nextFocus]) {
        inputRefs.current[nextFocus].focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    // Auto advance to next box
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    pasteData.split('').forEach((d, i) => {
      if (i < 6) newDigits[i] = d;
    });
    setDigits(newDigits);

    const nextFocus = Math.min(5, pasteData.length);
    if (inputRefs.current[nextFocus]) {
      inputRefs.current[nextFocus].focus();
    }
  };

  // Auto fill dev code if clicked
  const handleAutofillDevCode = () => {
    if (devCode && devCode.length === 6) {
      setDigits(devCode.split(''));
      setError('');
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-code', {
        email: email.trim().toLowerCase(),
        code,
      });
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Incorrect or expired verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password Strength Requirements
  const passwordCriteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { label: 'One special symbol (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const allCriteriaMet = passwordCriteria.every((c) => c.met);

  // Step 3: Reset Password Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!allCriteriaMet) {
      setError('Please satisfy all password security requirements before proceeding.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const code = digits.join('');
      const res = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code,
        password,
      });

      // Save token & user
      if (res.data?.token) {
        localStorage.setItem('codemerge_token', res.data.token);
      }
      if (res.data?.user && setUser) {
        setUser(res.data.user);
      }

      setStep(4);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update password. Please request a new code.'
      );
    } finally {
      setLoading(false);
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
        {/* Brand header */}
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-[0_0_15px_rgba(76,141,255,0.2)]">
            <GitMerge size={20} />
          </span>
          CodeMerge
        </Link>

        {/* Step progress pills */}
        <div className="mt-6 flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                step >= 1 ? 'bg-accent text-white' : 'bg-surface2 text-muted'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-semibold ${step === 1 ? 'text-text' : 'text-muted'}`}>
              Email
            </span>
          </div>
          <div className="h-px w-6 bg-border/60" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                step >= 2 ? 'bg-accent text-white' : 'bg-surface2 text-muted'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-text' : 'text-muted'}`}>
              Verify Code
            </span>
          </div>
          <div className="h-px w-6 bg-border/60" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                step >= 3 ? 'bg-accent text-white' : 'bg-surface2 text-muted'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-semibold ${step === 3 ? 'text-text' : 'text-muted'}`}>
              New Password
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="mt-6 space-y-4"
            >
              <div>
                <h1 className="font-display text-2xl font-bold text-text">Reset your password</h1>
                <p className="mt-1 text-sm text-muted">
                  Enter your registered email address and we'll send a unique 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Email address</label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3.5 z-10 flex items-center text-muted">
                      <Mail size={18} />
                    </span>
                    <input
                      required
                      autoFocus
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field !pl-11"
                    />
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
                  className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50 !py-3 shadow-[0_0_20px_rgba(76,141,255,0.25)]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Sending 6-digit code...</span>
                    </div>
                  ) : (
                    <>
                      Send 6-Digit Code <ArrowRight size={17} />
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
          )}

          {/* STEP 2: ENTER & VERIFY 6-DIGIT CODE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="mt-6 space-y-4"
            >
              <div>
                <h1 className="font-display text-2xl font-bold text-text">Verify 6-digit code</h1>
                <p className="mt-1 text-sm text-muted">
                  We've sent a 6-digit verification code to{' '}
                  <strong className="text-text font-mono">{email}</strong>.
                </p>
              </div>

              {/* Dev mode helper badge */}
              {devCode && (
                <div
                  onClick={handleAutofillDevCode}
                  className="cursor-pointer p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs text-text hover:bg-accent/15 transition-colors flex items-center justify-between"
                  title="Click to automatically fill code"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400 shrink-0" />
                    <span>
                      Dev Code: <strong className="font-mono text-accent text-sm tracking-widest">{devCode}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-accent font-semibold underline">
                    Click to Auto-fill
                  </span>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted text-center">
                    Enter the 6-digit code from your email
                  </label>
                  {/* 6 Individual Digit Boxes */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-border bg-surface2 text-center font-mono text-2xl font-bold text-text outline-none transition-all focus:border-accent focus:shadow-[0_0_15px_rgba(76,141,255,0.25)]"
                      />
                    ))}
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
                  disabled={loading || digits.join('').length < 6}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50 !py-3 shadow-[0_0_20px_rgba(76,141,255,0.25)]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Verifying code...</span>
                    </div>
                  ) : (
                    <>
                      Verify Code & Continue <CheckCircle2 size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-xs text-muted pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep(1);
                  }}
                  className="inline-flex items-center gap-1 hover:text-text transition-colors"
                >
                  <ArrowLeft size={13} /> Change email
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendCode}
                  className="text-accent hover:underline disabled:opacity-50 disabled:no-underline font-medium"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="mt-6 space-y-4"
            >
              <div>
                <h1 className="font-display text-2xl font-bold text-text">Create new password</h1>
                <p className="mt-1 text-sm text-muted">
                  Code verified! Choose a strong password to secure your CodeMerge profile.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">New password</label>
                  <div className="relative">
                    <input
                      required
                      autoFocus
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-field pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Confirm new password</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-field pr-12"
                    />
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div className="rounded-xl border border-border/80 bg-surface2/60 p-3.5 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Security Requirements
                  </div>
                  <div className="grid gap-1.5 text-xs">
                    {passwordCriteria.map((crit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {crit.met ? (
                          <Check size={14} className="text-easy shrink-0" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0 ml-1" />
                        )}
                        <span className={crit.met ? 'text-easy font-medium' : 'text-muted'}>
                          {crit.label}
                        </span>
                      </div>
                    ))}
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
                  disabled={loading || !allCriteriaMet || password !== confirmPassword}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50 !py-3 shadow-[0_0_20px_rgba(76,141,255,0.25)]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Updating password...</span>
                    </div>
                  ) : (
                    <>
                      Update Password & Sign In <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 py-6 text-center space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-easy/20 text-easy border border-easy/30 shadow-[0_0_25px_rgba(61,220,132,0.25)]">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="font-display text-2xl font-bold text-text">Password Updated!</h2>
              <p className="text-sm text-muted max-w-xs mx-auto">
                Your password has been successfully reset. You are now securely logged in. Redirecting to your dashboard...
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/15 text-accent text-xs font-semibold font-mono border border-accent/25">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <span>Loading Developer Dashboard...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

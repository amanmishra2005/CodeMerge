const rateLimit = require('express-rate-limit');

/**
 * Sanitizes an object recursively to prevent NoSQL operator injection.
 * Strips any property names starting with '$' or containing '.'
 */
function cleanNoSqlInjection(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanNoSqlInjection);
  }

  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    // Drop keys with MongoDB operators ($gt, $ne, $where, etc.) or dot notation
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    if (typeof val === 'object' && val !== null) {
      cleaned[key] = cleanNoSqlInjection(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

/**
 * Middleware: Cleans req.body, req.query, and req.params against NoSQL injection
 */
function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanNoSqlInjection(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanNoSqlInjection(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanNoSqlInjection(req.params);
  }
  next();
}

/**
 * Enforces a strong password policy:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password must be a valid string' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password cannot exceed 128 characters' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character' };
  }
  return { valid: true };
}

/**
 * Standard email format validator
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 150;
}

// Rate Limiter: Protects login and register against credential stuffing and brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Generous limit allowing dev testing
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1',
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter: Protects forgot-password against spamming / email flooding
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Generous limit for testing
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1',
  message: { message: 'Too many password reset requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter: Protects reset-password against token guessing
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1',
  message: { message: 'Too many reset attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  sanitizeInputs,
  validatePasswordStrength,
  validateEmail,
  authLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};


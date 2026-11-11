require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { sanitizeInputs } = require('./middleware/security');

const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');
const contestRoutes = require('./routes/contests');

const app = express();

// Database Connection
connectDB();

// 1. Storage & Network Optimization: Gzip/Brotli Compression
app.use(compression({
  threshold: 1024, // Only compress responses larger than 1KB
}));

// 2. Security Hardening: Helmet HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Allows Vite dev server & external assets
    frameguard: { action: 'deny' }, // Anti-Clickjacking
    xssFilter: true, // XSS filter
    noSniff: true, // Anti-MIME sniffing
    hidePoweredBy: true, // Do not leak server technology stack
  })
);

// 3. Strict Whitelist CORS Protection
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5180,http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes('*') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS security policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. DoS Protection: Limit payload size to 50KB
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 5. Anti-NoSQL Injection Sanitizer
app.use(sanitizeInputs);

// 6. Global API Rate Limiter (300 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' },
});
app.use('/api', globalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'codemerge-backend', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contests', contestRoutes);

// Serves built frontend static assets if available
const path = require('path');
const fs = require('fs');
const frontendDist = fs.existsSync(path.join(__dirname, '../Frontend/dist'))
  ? path.join(__dirname, '../Frontend/dist')
  : path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
} else {
  // 404 handler for standalone API server
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  if (err.message === 'Blocked by CORS security policy') {
    return res.status(403).json({ message: 'CORS origin not allowed' });
  }
  console.error('[Server Error]:', err.message || err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CodeMerge backend running on port ${PORT}`));

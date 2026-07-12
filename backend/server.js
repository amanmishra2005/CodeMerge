require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');

const app = express();

connectDB();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5180,http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'codemerge-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);

// Serves built frontend static assets if available (supports unified container deployments)
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');

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
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CodeMerge backend running on port ${PORT}`));

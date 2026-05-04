// ─────────────────────────────────────────────────────────────
// WINGROX BACKEND · ENTRY POINT
// ─────────────────────────────────────────────────────────────
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import fileRoutes from './routes/files.js';
import leadRoutes from './routes/leads.js';
import paymentRoutes from './routes/payments.js';
import { errorHandler } from './middleware/errorHandler.js';
import { stripeWebhook } from './routes/webhooks.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || '*',
  credentials: true,
}));

// ── Logging ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Stripe webhook MUST come BEFORE express.json() ───────
// because Stripe signs the raw body
app.post('/api/webhooks/stripe', 
  express.raw({ type: 'application/json' }), 
  stripeWebhook
);

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,                  // 200 req/15min per IP
  message: { error: 'Too many requests. Try again in 15 minutes.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // tighter for auth
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
});

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/sessions', apiLimiter, sessionRoutes);
app.use('/api/files', apiLimiter, fileRoutes);
app.use('/api/leads', apiLimiter, leadRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);

// Serve uploaded files in dev (in production, use S3/CDN instead)
if (process.env.UPLOAD_DRIVER === 'local') {
  app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));
}

// ── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Error handler (must be last) ─────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ WinGroX API listening on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Frontend URL: ${process.env.FRONTEND_URL || '(not set)'}`);
});

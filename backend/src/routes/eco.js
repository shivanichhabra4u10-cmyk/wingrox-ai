// ECO ROUTES · Ecosystem Partner Applications
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Optional auth
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const { verifyToken } = await import('../lib/auth.js');
      const payload = verifyToken(header.slice(7));
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true },
      });
      if (user) req.user = user;
    } catch { /* anonymous */ }
  }
  next();
}

const applySchema = z.object({
  name:             z.string().min(1).max(200),
  email:            z.string().email(),
  linkedin:         z.string().url().optional().or(z.literal('')).default(''),
  website:          z.string().url().optional().or(z.literal('')).default(''),
  expertise:        z.array(z.string().max(80)).max(20).default([]),
  otpVerified:      z.boolean().default(false),
  ndaSigned:        z.boolean().default(false),
  signatureProvided:z.boolean().default(false),
});

// POST /api/eco/apply — submit partner application
router.post('/apply', optionalAuth, asyncHandler(async (req, res) => {
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const data = parsed.data;

  // Prevent duplicate pending applications from the same email
  const existing = await prisma.ecoPartnerApplication.findFirst({
    where: { email: data.email.toLowerCase(), status: 'PENDING' },
    select: { id: true },
  });
  if (existing) {
    return res.status(409).json({ error: 'An application for this email is already under review.' });
  }

  const application = await prisma.ecoPartnerApplication.create({
    data: {
      userId:           req.user?.id ?? null,
      name:             data.name,
      email:            data.email.toLowerCase(),
      linkedin:         data.linkedin,
      website:          data.website,
      expertise:        data.expertise,
      otpVerified:      data.otpVerified,
      ndaSigned:        data.ndaSigned,
      signatureProvided:data.signatureProvided,
    },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });

  // Slack notify (fire-and-forget)
  if (process.env.SLACK_WEBHOOK_URL) {
    fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🤝 *New Ecosystem Partner Application*\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Expertise:* ${data.expertise.join(', ') || '—'}\n*LinkedIn:* ${data.linkedin || '—'}`,
      }),
    }).catch(err => console.error('Slack notify failed:', err.message));
  }

  res.status(201).json({ ok: true, application });
}));

// GET /api/eco/applications — admin list (auth required)
router.get('/applications', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const status = req.query.status || undefined;

  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.ecoPartnerApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, linkedin: true, expertise: true, status: true, createdAt: true },
    }),
    prisma.ecoPartnerApplication.count({ where }),
  ]);

  res.json({ items, total, page, limit });
}));

export default router;

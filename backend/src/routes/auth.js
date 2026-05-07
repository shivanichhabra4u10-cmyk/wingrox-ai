// AUTH ROUTES · signup, login, me
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { signToken, hashPassword, comparePassword } from '../lib/auth.js';
import { signupSchema, loginSchema, validate } from '../lib/validators.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', asyncHandler(async (req, res) => {
  const data = validate(signupSchema, req.body);
  
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  // Create user
  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      tier: 'NUCLEUS', // free tier by default
    },
    select: { id: true, email: true, name: true, tier: true },
  });
  
  const token = signToken({ userId: user.id });
  res.status(201).json({ user, token });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body);
  
  const user = await prisma.user.findUnique({ 
    where: { email: data.email.toLowerCase() } 
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Update lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  
  const token = signToken({ userId: user.id });
  res.json({ 
    user: { id: user.id, email: user.email, name: user.name, tier: user.tier },
    token 
  });
}));

// GET /api/auth/me
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user });
}));

// PATCH /api/auth/upgrade — upgrade account tier (used after dummy payment for testing)
router.patch('/upgrade', requireAuth, asyncHandler(async (req, res) => {
  const { tier } = req.body;
  const validTiers = ['NUCLEUS', 'VANGUARD', 'APEX'];
  if (!tier || !validTiers.includes(tier.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid tier. Must be NUCLEUS, VANGUARD, or APEX.' });
  }

  const newTier = tier.toUpperCase();
  const tierRank = { NUCLEUS: 0, VANGUARD: 1, APEX: 2 };

  // Only allow upgrading, not downgrading
  if (tierRank[newTier] <= tierRank[req.user.tier]) {
    return res.status(400).json({ error: `Already on ${req.user.tier} or higher.` });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { tier: newTier },
    select: { id: true, email: true, name: true, tier: true },
  });

  res.json({ user });
}));

export default router;

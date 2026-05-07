// PAYMENT ROUTES · Stripe checkout for tier upgrades
import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { checkoutSchema, expansionCheckoutSchema, validate } from '../lib/validators.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

// ── Stripe is opt-in: set STRIPE_ENABLED=true in .env to activate real payments.
// ── While STRIPE_ENABLED=false (default), checkout endpoints upgrade the user
// ── directly — no redirect, no card needed. Flip the flag for production.
const STRIPE_ENABLED = process.env.STRIPE_ENABLED === 'true';
const stripe = STRIPE_ENABLED && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

// POST /api/payments/checkout — Stripe Checkout for Vanguard (Digital Twin)
router.post('/checkout', asyncHandler(async (req, res) => {
  const data = validate(checkoutSchema, req.body);

  // Already paid? skip.
  if (req.user.tier === 'VANGUARD' || req.user.tier === 'APEX') {
    return res.status(400).json({ error: 'You already have access to this tier' });
  }

  // ── Stripe disabled: upgrade directly (dev / beta testing) ──────────────
  if (!STRIPE_ENABLED) {
    await prisma.user.update({ where: { id: req.user.id }, data: { tier: data.tier } });
    return res.json({ upgraded: true, tier: data.tier, url: null });
  }

  // ── Stripe enabled: real checkout ────────────────────────────────────────
  let user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_VANGUARD_PRICE_ID, quantity: 1 }],
    success_url: data.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: data.cancelUrl,
    metadata: { userId: user.id, tier: data.tier },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: checkoutSession.payment_intent || `cs_${checkoutSession.id}`,
      stripeSessionId: checkoutSession.id,
      amountCents: 19900,
      currency: 'usd',
      tier: data.tier,
      status: 'PENDING',
    },
  });

  res.json({ url: checkoutSession.url, upgraded: false });
}));

// POST /api/payments/expansion/checkout — Stripe Checkout for Gold/Platinum expansion plan
const EXPANSION_PRICE_IDS = {
  GOLD:     process.env.STRIPE_EXPANSION_GOLD_PRICE_ID,
  PLATINUM: process.env.STRIPE_EXPANSION_PLATINUM_PRICE_ID,
};
const EXPANSION_AMOUNTS = { GOLD: 9900, PLATINUM: 29900 }; // $99 / $299

router.post('/expansion/checkout', asyncHandler(async (req, res) => {
  const data = validate(expansionCheckoutSchema, req.body);
  const expansionTier = req.user.expansionTier ?? 'SILVER';

  // Already on this tier or higher?
  const tiers = ['SILVER', 'GOLD', 'PLATINUM'];
  if (tiers.indexOf(expansionTier) >= tiers.indexOf(data.tier)) {
    return res.status(400).json({ error: `You already have ${expansionTier} access or higher` });
  }

  // ── Stripe disabled: upgrade directly (dev / beta testing) ──────────────
  if (!STRIPE_ENABLED) {
    await prisma.user.update({ where: { id: req.user.id }, data: { expansionTier: data.tier } });
    return res.json({ upgraded: true, expansionTier: data.tier, url: null });
  }

  // ── Stripe enabled: real checkout ────────────────────────────────────────
  const priceId = EXPANSION_PRICE_IDS[data.tier];
  if (!priceId) {
    return res.status(503).json({ error: `Stripe price not configured for ${data.tier} plan` });
  }

  let user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: data.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: data.cancelUrl,
    metadata: { userId: user.id, product: 'expansion', tier: data.tier },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: checkoutSession.payment_intent || `cs_${checkoutSession.id}`,
      stripeSessionId: checkoutSession.id,
      amountCents: EXPANSION_AMOUNTS[data.tier],
      currency: 'usd',
      tier: data.tier,
      status: 'PENDING',
    },
  });

  res.json({ url: checkoutSession.url, upgraded: false });
}));

// GET /api/payments — list user's payments
router.get('/', asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ payments });
}));

export default router;

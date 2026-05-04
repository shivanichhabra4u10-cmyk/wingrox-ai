// PAYMENT ROUTES · Stripe checkout for Vanguard upgrade
import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { checkoutSchema, validate } from '../lib/validators.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

// POST /api/payments/checkout — create Stripe Checkout Session
router.post('/checkout', asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment processing not configured' });
  }
  
  const data = validate(checkoutSchema, req.body);
  
  // Already paid? skip.
  if (req.user.tier === 'VANGUARD' || req.user.tier === 'APEX') {
    return res.status(400).json({ error: 'You already have access to this tier' });
  }
  
  // Get or create Stripe customer
  let user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
  }
  
  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    mode: 'payment',
    line_items: [{
      price: process.env.STRIPE_VANGUARD_PRICE_ID,
      quantity: 1,
    }],
    success_url: data.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: data.cancelUrl,
    metadata: {
      userId: user.id,
      tier: data.tier,
    },
  });
  
  // Pre-record pending payment (will be marked SUCCEEDED via webhook)
  await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: checkoutSession.payment_intent || `cs_${checkoutSession.id}`,
      stripeSessionId: checkoutSession.id,
      amountCents: 19900, // $199.00
      currency: 'usd',
      tier: data.tier,
      status: 'PENDING',
    },
  });
  
  res.json({ url: checkoutSession.url });
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

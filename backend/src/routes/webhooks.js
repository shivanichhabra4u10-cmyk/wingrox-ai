// STRIPE WEBHOOK · receives payment events, upgrades user tier
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export async function stripeWebhook(req, res) {
  if (!stripe) return res.status(503).send('Stripe not configured');
  
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    return res.status(400).send('Missing signature or webhook secret');
  }
  
  let event;
  try {
    // req.body is a raw Buffer here (because we used express.raw() in index.js)
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'FAILED' },
        });
        break;
      }
      default:
        // Other events (refunds, disputes etc.) — log only for now
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  
  if (!userId || !tier) {
    console.error('Checkout session missing metadata:', session.id);
    return;
  }
  
  // Update payment record
  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: { 
      status: 'SUCCEEDED',
      stripePaymentIntentId: session.payment_intent || `cs_${session.id}`,
    },
  });
  
  // Upgrade user tier — expansion product updates expansionTier; twin updates tier
  if (session.metadata?.product === 'expansion') {
    await prisma.user.update({
      where: { id: userId },
      data: { expansionTier: tier },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { tier },
    });
  }

  console.log(`✓ Upgraded user ${userId} to ${tier} (product: ${session.metadata?.product ?? 'twin'})`);
}

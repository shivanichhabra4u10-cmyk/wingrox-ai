// ADVISOR LEAD ROUTES · captures every probing CTA click
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { leadSchema, validate } from '../lib/validators.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// POST /api/leads — public endpoint, but we attach userId if authed
router.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const data = validate(leadSchema, req.body);
  
  // If sessionId provided & user is logged in, verify ownership
  let sessionId = data.sessionId || null;
  if (sessionId && req.user) {
    const session = await prisma.diagnosticSession.findFirst({
      where: { id: sessionId, userId: req.user.id },
      select: { id: true },
    });
    if (!session) sessionId = null;
  } else if (sessionId && !req.user) {
    sessionId = null; // can't verify ownership without auth
  }
  
  const lead = await prisma.advisorLead.create({
    data: {
      userId: req.user?.id || null,
      sessionId,
      context: data.context,
      email: data.email.toLowerCase(),
      name: data.name,
      mobile: data.mobile,
      message: data.message,
      masterScore: data.masterScore,
      tier: data.tier,
      status: 'NEW',
    },
  });
  
  // Fire-and-forget Slack notification (don't block the response)
  if (process.env.SLACK_WEBHOOK_URL) {
    notifySlack(lead).catch(err => console.error('Slack notify failed:', err.message));
  }
  
  res.status(201).json({ ok: true, leadId: lead.id });
}));

// GET /api/leads — admin-only (logged-in advisors). For now, returns nothing unless 
// you build an admin role; just stub for completeness.
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  // TODO: add isAdmin check on user model
  // For now, only return your own leads (if any)
  const leads = await prisma.advisorLead.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ leads });
}));

// ── Slack notifier ────────────────────────────────────────
async function notifySlack(lead) {
  const text = `🔔 *New advisor lead* · _${lead.context}_\n` +
    `*Email:* ${lead.email}` +
    (lead.name ? `\n*Name:* ${lead.name}` : '') +
    (lead.mobile ? `\n*Mobile:* ${lead.mobile}` : '') +
    (lead.tier ? `\n*Tier:* ${lead.tier}` : '') +
    (lead.masterScore != null ? `\n*Master score:* ${lead.masterScore}/100` : '') +
    (lead.message ? `\n*Message:* ${lead.message}` : '');
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

export default router;

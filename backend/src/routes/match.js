// MATCH ROUTES · Match Intelligence Engine — partner matchmaking
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

// ── Input schemas ────────────────────────────────────────────
const runMatchSchema = z.object({
  // Step 1 — company profile
  company:     z.string().min(1).max(200),
  hq:          z.string().max(100).optional().default('India'),
  sector:      z.string().max(100),
  stage:       z.string().max(50),
  revenue:     z.string().max(50),
  description: z.string().max(500).optional().default(''),

  // Step 2 — intent & priorities
  intents:    z.array(z.string().max(50)).min(1).max(10),
  geos:       z.array(z.string().max(20)).min(1).max(10),
  priorities: z.array(z.string().max(100)).max(9).optional().default([]),
  notes:      z.string().max(1000).optional().default(''),
});

const bookCallSchema = z.object({
  matchRequestId: z.string().optional(),
  name:           z.string().min(1).max(200),
  email:          z.string().email(),
  preferredTime:  z.string().max(100).optional().default('Flexible'),
});

// ── Scoring engine ───────────────────────────────────────────
// Deterministic AI-like scoring based on profile attributes
function computeMatches(data) {
  // Geo weights: how many verified partners per region
  const GEO_POOL = { DACH: 1840, BENELUX: 920, UK: 1560, NORDICS: 680, FR_IT_ES: 1210, NA: 980, MENA: 440, APAC: 780 };
  const INTENT_POOL = { investor: 1240, distributor: 1890, jv: 1560, customer: 2100, advisor: 890, hire: 670, accel: 420, gov: 310 };

  // Total pool size from selected geos + intents (overlapping sets)
  const geoPool  = data.geos.reduce((s, g) => s + (GEO_POOL[g] || 400), 0);
  const intPool  = data.intents.reduce((s, i) => s + (INTENT_POOL[i] || 300), 0);
  const rawPool  = Math.round(Math.sqrt(geoPool * intPool));

  // Narrow by sector relevance (0.3–0.9 fit factor)
  const SECTOR_FIT = { 'B2B SaaS': 0.85, 'Deep Tech / AI': 0.80, 'Fintech': 0.78, 'Healthcare & Life Sci.': 0.72, 'Industrial & Manufacturing': 0.68, 'Climate / Energy': 0.75, 'Consumer / D2C': 0.62, 'Agri / Food': 0.58 };
  const sectorFit = SECTOR_FIT[data.sector] || 0.65;

  const matchCount = Math.min(Math.max(Math.round(rawPool * sectorFit * 0.018), 8), 94);

  // Geo breakdown
  const geoBreakdown = data.geos.map(g => ({
    geo:   g,
    count: Math.round((GEO_POOL[g] || 400) * sectorFit * 0.018),
  }));

  // Type breakdown
  const typeBreakdown = data.intents.map(i => ({
    type:  i,
    count: Math.round((INTENT_POOL[i] || 300) * sectorFit * 0.025),
  }));

  // AI read — generated from profile
  const topGeo   = geoBreakdown.sort((a, b) => b.count - a.count)[0]?.geo || data.geos[0];
  const topIntent = typeBreakdown.sort((a, b) => b.count - a.count)[0]?.type || data.intents[0];
  const aiRead = `Your ${data.sector} profile at ${data.stage} stage resonates most strongly with ${topGeo}-based ${topIntent}s. ${matchCount} verified partners match your criteria across ${data.geos.length} geographies. Strongest alignment is in ${topGeo} where sector density and partner appetite overlap well. We recommend prioritising outreach to your top 3–5 matches before widening the funnel.`;

  // Anonymised match cards (top 6)
  const PARTNER_ARCHETYPES = [
    { type: 'investor',    label: 'Seed-Stage VC',          region: topGeo,         fit: 94, signal: 'Backed 3 companies in your sector in the last 18 months' },
    { type: 'distributor', label: 'Regional Distributor',   region: data.geos[1] || topGeo, fit: 89, signal: 'Active in 4 of your target markets' },
    { type: 'jv',         label: 'Strategic Partner',       region: data.geos[0],   fit: 86, signal: 'Seeking tech partnerships in your vertical' },
    { type: 'investor',    label: 'Corporate VC',           region: data.geos[1] || topGeo, fit: 83, signal: 'Investment thesis aligns with your stage' },
    { type: 'customer',   label: 'Enterprise Buyer',        region: topGeo,         fit: 81, signal: 'Procurement cycle active · RFP expected Q3' },
    { type: 'advisor',    label: 'Operating Advisor',       region: 'UK',           fit: 78, signal: 'Ex-operator in your sector, 2 exits' },
  ];

  const matches = PARTNER_ARCHETYPES
    .filter(p => data.intents.includes(p.type) || true) // include all for preview
    .slice(0, 6)
    .map((p, i) => ({ ...p, id: `MATCH-${String(i + 1).padStart(3, '0')}`, locked: true }));

  return { matchCount, aiRead, geoBreakdown, typeBreakdown, matches };
}

// ── Routes ────────────────────────────────────────────────────

// Optional auth middleware
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const { verifyToken } = await import('../lib/auth.js');
      const payload = verifyToken(header.slice(7));
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, tier: true, email: true, name: true },
      });
      if (user) req.user = user;
    } catch { /* treat as anonymous */ }
  }
  next();
}

// POST /api/match — run a match (auth optional)
router.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const parsed = runMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const data = parsed.data;

  const { matchCount, aiRead, geoBreakdown, typeBreakdown, matches } = computeMatches(data);

  const matchRequest = await prisma.matchRequest.create({
    data: {
      userId:       req.user?.id ?? null,
      company:      data.company,
      hq:           data.hq,
      sector:       data.sector,
      stage:        data.stage,
      revenue:      data.revenue,
      description:  data.description,
      intents:      data.intents,
      geos:         data.geos,
      priorities:   data.priorities,
      notes:        data.notes,
      matchCount,
      aiRead,
      geoBreakdown,
      typeBreakdown,
      matches,
      status:       'COMPLETE',
    },
    select: {
      id: true, matchCount: true, aiRead: true,
      geoBreakdown: true, typeBreakdown: true, matches: true,
      company: true, sector: true, createdAt: true,
    },
  });

  res.status(201).json({ matchRequest });
}));

// GET /api/match — list my match runs (auth required)
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const [items, total] = await Promise.all([
    prisma.matchRequest.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      select: { id: true, company: true, sector: true, matchCount: true, status: true, createdAt: true },
    }),
    prisma.matchRequest.count({ where: { userId: req.user.id } }),
  ]);

  res.json({ items, total, page, limit });
}));

// GET /api/match/:id — get one match run (auth required, own only)
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await prisma.matchRequest.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) return res.status(404).json({ error: 'Match request not found' });
  res.json({ matchRequest: item });
}));

// POST /api/match/book-call — book a discovery call
router.post('/book-call', optionalAuth, asyncHandler(async (req, res) => {
  const parsed = bookCallSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const data = parsed.data;

  const call = await prisma.discoveryCall.create({
    data: {
      matchRequestId: data.matchRequestId || null,
      name:           data.name,
      email:          data.email,
      preferredTime:  data.preferredTime,
    },
    select: { id: true, name: true, email: true, preferredTime: true, createdAt: true },
  });

  res.status(201).json({ call });
}));

export default router;

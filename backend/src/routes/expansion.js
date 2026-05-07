// EXPANSION ROUTES · Global Scale-Up Readiness Navigator
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

// ── Monthly quota per expansion tier ────────────────────
const EXPANSION_QUOTA = { SILVER: 1, GOLD: 5, PLATINUM: Infinity };

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// ── Optional auth middleware (reads token if present, does not block) ──
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, tier: true, expansionTier: true, email: true, name: true },
      });
      if (user) req.user = user;
    } catch { /* invalid token — treat as anonymous */ }
  }
  next();
}

// ── Input schema ─────────────────────────────────────────
const assessmentSchema = z.object({
  company:       z.string().min(1).max(200),
  hq:            z.string().max(100).optional().default('India'),
  industry:      z.string().max(100),
  revenue:       z.string().max(50).optional().default(''),
  model:         z.string().max(50).optional().default(''),
  targetGeos:    z.array(z.string().max(10)).max(12).optional().default([]),
  goal:          z.string().max(200).optional().default(''),
  readinessScore: z.number().int().min(0).max(100),
  cluster:       z.string().max(100).optional().default(''),
  topCountries:  z.array(z.object({
    code:  z.string().max(10),
    score: z.number(),
    name:  z.string().max(100),
    flag:  z.string().max(10),
  })).max(12).optional().default([]),
  revProjection: z.object({
    low:  z.string().optional(),
    base: z.string().optional(),
    high: z.string().optional(),
  }).optional().default({}),
  nextMoves: z.array(z.object({
    title: z.string().max(300),
    desc:  z.string().max(1000),
    when:  z.string().max(100),
  })).max(5).optional().default([]),
});

// POST /api/expansion/assessment — compute score, enforce quota, save (auth optional)
router.post('/assessment', optionalAuth, asyncHandler(async (req, res) => {
  const parsed = assessmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const data = parsed.data;

  // Quota enforcement for authenticated users
  if (req.user) {
    const expansionTier = req.user.expansionTier ?? 'SILVER';
    const quota = EXPANSION_QUOTA[expansionTier] ?? 1;
    if (quota !== Infinity) {
      const used = await prisma.expansionAssessment.count({
        where: { userId: req.user.id, createdAt: { gte: monthStart() } },
      });
      if (used >= quota) {
        return res.status(429).json({
          error: `Monthly limit reached (${quota} report${quota !== 1 ? 's' : ''} on ${expansionTier} plan). Upgrade to Gold or Platinum for more.`,
          quota,
          used,
          expansionTier,
          upgradeRequired: true,
        });
      }
    }
  }

  const assessment = await prisma.expansionAssessment.create({
    data: {
      userId:        req.user?.id ?? null,
      company:       data.company,
      hq:            data.hq,
      industry:      data.industry,
      revenue:       data.revenue,
      model:         data.model,
      targetGeos:    data.targetGeos,
      goal:          data.goal,
      readinessScore: data.readinessScore,
      cluster:       data.cluster,
      topCountries:  data.topCountries,
      revProjection: data.revProjection,
      nextMoves:     data.nextMoves,
    },
  });

  res.status(201).json({ assessment });
}));

// GET /api/expansion/assessments — list mine (auth required)
router.get('/assessments', requireAuth, asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const [assessments, total] = await Promise.all([
    prisma.expansionAssessment.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id: true, company: true, industry: true, hq: true,
        readinessScore: true, cluster: true, topCountries: true,
        goal: true, createdAt: true,
      },
    }),
    prisma.expansionAssessment.count({ where: { userId: req.user.id } }),
  ]);

  res.json({ assessments, total, page, limit });
}));

// GET /api/expansion/assessments/:id — get one (auth required, own only)
router.get('/assessments/:id', requireAuth, asyncHandler(async (req, res) => {
  const assessment = await prisma.expansionAssessment.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  res.json({ assessment });
}));

// GET /api/expansion/usage — quota status (auth required)
router.get('/usage', requireAuth, asyncHandler(async (req, res) => {
  const expansionTier = req.user.expansionTier ?? 'SILVER';
  const quota = EXPANSION_QUOTA[expansionTier] ?? 1;
  const used  = await prisma.expansionAssessment.count({
    where: { userId: req.user.id, createdAt: { gte: monthStart() } },
  });

  res.json({
    plan:      expansionTier,
    quota:     quota === Infinity ? null : quota,  // null = unlimited
    used,
    remaining: quota === Infinity ? null : Math.max(0, quota - used),
    resetAt:   new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
  });
}));

// PATCH /api/expansion/dev/set-tier — DEV ONLY: manually set expansionTier for testing
if (process.env.NODE_ENV !== 'production') {
  router.patch('/dev/set-tier', requireAuth, asyncHandler(async (req, res) => {
    const { tier } = req.body;
    if (!['SILVER', 'GOLD', 'PLATINUM'].includes(tier)) {
      return res.status(400).json({ error: 'tier must be SILVER, GOLD, or PLATINUM' });
    }
    await prisma.user.update({ where: { id: req.user.id }, data: { expansionTier: tier } });
    res.json({ ok: true, expansionTier: tier });
  }));
}

export default router;

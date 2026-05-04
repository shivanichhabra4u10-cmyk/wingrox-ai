// DIAGNOSTIC SESSION ROUTES · create / save / complete / list
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { 
  createSessionSchema, updateSessionSchema, completeSessionSchema, validate 
} from '../lib/validators.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

// POST /api/sessions — create new diagnostic session
router.post('/', asyncHandler(async (req, res) => {
  const data = validate(createSessionSchema, req.body);
  
  // Enforce tier eligibility — user can only start a session at their paid tier or below
  const tierRank = { NUCLEUS: 0, VANGUARD: 1, APEX: 2 };
  if (tierRank[data.tier] > tierRank[req.user.tier]) {
    return res.status(403).json({ 
      error: `Your account is ${req.user.tier}. To start a ${data.tier} session, upgrade first.`,
      requiresUpgrade: data.tier,
    });
  }
  
  const session = await prisma.diagnosticSession.create({
    data: {
      userId: req.user.id,
      tier: data.tier,
      profile: data.profile || {},
      status: 'IN_PROGRESS',
    },
  });
  
  res.status(201).json({ session });
}));

// GET /api/sessions — list user's sessions
router.get('/', asyncHandler(async (req, res) => {
  const sessions = await prisma.diagnosticSession.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, tier: true, status: true,
      createdAt: true, updatedAt: true, completedAt: true,
      profile: true,
      // Skip 'answers' and 'results' from list view (too heavy)
    },
  });
  res.json({ sessions });
}));

// GET /api/sessions/:id — full session detail
router.get('/:id', asyncHandler(async (req, res) => {
  const session = await prisma.diagnosticSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      files: { select: { id: true, filename: true, sizeBytes: true, createdAt: true } },
    },
  });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ session });
}));

// PATCH /api/sessions/:id — save profile or answers (called continuously during diagnostic)
router.patch('/:id', asyncHandler(async (req, res) => {
  const data = validate(updateSessionSchema, req.body);
  
  // Verify ownership
  const existing = await prisma.diagnosticSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    select: { id: true, status: true, profile: true, answers: true },
  });
  if (!existing) return res.status(404).json({ error: 'Session not found' });
  if (existing.status === 'COMPLETED') {
    return res.status(409).json({ error: 'Session already completed — cannot modify' });
  }
  
  // Merge updates (don't overwrite the whole jsonb blob)
  const updates = {};
  if (data.profile) {
    updates.profile = { ...(existing.profile || {}), ...data.profile };
  }
  if (data.answers) {
    updates.answers = { ...(existing.answers || {}), ...data.answers };
  }
  
  const session = await prisma.diagnosticSession.update({
    where: { id: req.params.id },
    data: updates,
  });
  
  res.json({ session });
}));

// POST /api/sessions/:id/complete — finalize session with computed results
router.post('/:id/complete', asyncHandler(async (req, res) => {
  const data = validate(completeSessionSchema, req.body);
  
  const existing = await prisma.diagnosticSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    select: { id: true, status: true },
  });
  if (!existing) return res.status(404).json({ error: 'Session not found' });
  if (existing.status === 'COMPLETED') {
    return res.status(409).json({ error: 'Session already completed' });
  }
  
  const session = await prisma.diagnosticSession.update({
    where: { id: req.params.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      results: data.results,
    },
  });
  
  res.json({ session });
}));

// DELETE /api/sessions/:id — soft delete (mark abandoned)
router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await prisma.diagnosticSession.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { status: 'ABANDONED' },
  });
  if (result.count === 0) return res.status(404).json({ error: 'Session not found' });
  res.json({ ok: true });
}));

export default router;

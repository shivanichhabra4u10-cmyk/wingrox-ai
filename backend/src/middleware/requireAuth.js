// requireAuth — attaches req.user from JWT, or 401s
import { verifyToken } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload?.userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  // Fetch fresh user (so tier changes are reflected immediately after payment)
  const user = await prisma.user.findUnique({ 
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, tier: true, expansionTier: true }
  });
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  next();
}

// optionalAuth — attaches req.user if token is valid, otherwise continues
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (payload?.userId) {
    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, tier: true }
    });
    if (user) req.user = user;
  }
  next();
}

// requireTier — gates access by tier (e.g. Vanguard-only endpoints)
export function requireTier(...allowedTiers) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedTiers.includes(req.user.tier)) {
      return res.status(403).json({ 
        error: 'This feature requires a higher tier',
        requiredTier: allowedTiers,
        currentTier: req.user.tier,
      });
    }
    next();
  };
}

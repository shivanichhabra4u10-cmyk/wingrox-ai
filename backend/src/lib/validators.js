// Request body validators using Zod
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Profile data — frontend sends this whole shape from dt-pf-* fields
export const profileSchema = z.object({
  name: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  mobile: z.string().max(50).optional(),
  linkedin: z.string().max(500).optional(),
  year: z.string().max(10).optional(),
  chips: z.object({
    priorities: z.array(z.string().max(120)).max(20).optional(),
    pains: z.array(z.string().max(120)).max(20).optional(),
    obstacles: z.array(z.string().max(120)).max(20).optional(),
    opps: z.array(z.string().max(120)).max(20).optional(),
    focus: z.array(z.string().max(120)).max(20).optional(),
  }).optional(),
  // 12 financial overrides — all optional, all stringy
  actualMRR: z.string().max(20).optional(),
  actualARPU: z.string().max(20).optional(),
  actualCAC: z.string().max(20).optional(),
  actualCustomerCount: z.string().max(20).optional(),
  actualRetentionPct: z.string().max(20).optional(),
  actualLifetime: z.string().max(20).optional(),
  actualMonthlyCost: z.string().max(20).optional(),
  actualNetMargin: z.string().max(20).optional(),
  actualGrossMargin: z.string().max(20).optional(),
  actualRunway: z.string().max(20).optional(),
  actualGrowthPct: z.string().max(20).optional(),
  actualLeads: z.string().max(20).optional(),
}).strict();

export const createSessionSchema = z.object({
  tier: z.enum(['NUCLEUS', 'VANGUARD', 'APEX']),
  profile: profileSchema.optional(),
});

export const updateSessionSchema = z.object({
  profile: profileSchema.optional(),
  // answers: { Q1: 5, Q2: 3, ... }
  answers: z.record(z.string().regex(/^Q\d+$/), z.number().int().min(0).max(10)).optional(),
});

export const completeSessionSchema = z.object({
  results: z.object({
    masterScore: z.number(),
    layerScores: z.record(z.string(), z.any()).optional(),
    moduleScores: z.record(z.string(), z.any()).optional(),
    bottlenecks: z.array(z.any()).optional(),
  }).passthrough(),
});

export const leadSchema = z.object({
  context: z.string().min(1).max(100),
  email: z.string().email(),
  name: z.string().max(200).optional(),
  mobile: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
  sessionId: z.string().optional(),
  masterScore: z.number().optional(),
  tier: z.enum(['NUCLEUS', 'VANGUARD', 'APEX']).optional(),
});

export const checkoutSchema = z.object({
  tier: z.enum(['VANGUARD']), // Only Vanguard is self-serve checkout (Apex is book-call)
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const expansionCheckoutSchema = z.object({
  tier: z.enum(['GOLD', 'PLATINUM']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Helper: validate and return parsed data or throw a clean 400
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = result.error.flatten().fieldErrors;
    throw err;
  }
  return result.data;
}

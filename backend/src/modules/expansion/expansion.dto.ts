import { z } from 'zod';

// =============================================================
// Reference taxonomies (mirrors the Intelligence Engine UI).
// Keeping these as enums hardens validation and helps OpenAPI.
// =============================================================

export const ExpansionIndustrySchema = z.enum([
  'FMCG',
  'SaaS',
  'Healthcare',
  'Fintech',
  'Industrial',
  'Climate',
  'Consumer',
  'Agri',
  'EV',
]);

export const ExpansionRevenueBandSchema = z.enum([
  'Pre-revenue',
  '< $500K',
  '$500K – $2M',
  '$2M – $10M',
  '$10M – $50M',
  '$50M+',
]);

export const ExpansionBusinessModelSchema = z.enum([
  'B2B',
  'B2C',
  'B2B2C',
  'Marketplace',
  'D2C',
]);

export const ExpansionGoalSchema = z.enum([
  'Revenue growth',
  'Find distributors',
  'Raise capital',
  'De-risk domestic',
  'IPO / M&A prep',
]);

// Country code is intentionally a string — we validate against the DB
// reference table at the service layer rather than locking the enum here.
export const CountryCodeSchema = z
  .string()
  .min(2)
  .max(8)
  .regex(/^[A-Z]+$/i, 'Country code must be alphabetic');

// =============================================================
// Inbound payloads
// =============================================================

export const EntryModelSchema = z.enum(['distributor', 'direct', 'jv', 'licensing']);

export const GenerateAssessmentSchema = z.object({
  companyName: z.string().min(1).max(160),
  hqCountry: z.string().min(2).max(80),
  industry: ExpansionIndustrySchema,
  revenueBand: ExpansionRevenueBandSchema,
  businessModel: ExpansionBusinessModelSchema.default('B2B'),
  goal: ExpansionGoalSchema.default('Revenue growth'),
  targetGeos: z.array(CountryCodeSchema).max(8).default([]),
  email: z.string().email().optional(),
  entryModel: EntryModelSchema.default('distributor'),
  entryCapitalUsdK: z.number().min(10).max(50000).default(150),
  metadata: z.record(z.unknown()).optional(),
});

export const ListSignalsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  apiLayer: z.string().optional(),
  industry: z.string().optional(),
  geo: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'monitor']).optional(),
  signalType: z
    .enum(['opportunity', 'risk', 'regulatory', 'demand', 'competitive'])
    .optional(),
  timeframe: z.enum(['7d', '30d', '90d']).default('7d'),
  sort: z.enum(['priority', 'recent', 'impact']).default('priority'),
});

export const ListCountriesSchema = z.object({
  region: z.string().optional(),
});

export const CreateLeadSchema = z.object({
  kind: z.enum(['report', 'premium', 'playbook', 'call']),
  name: z.string().min(1).max(160),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  assessmentId: z.string().optional(),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ListAssessmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  industry: z.string().optional(),
  email: z.string().email().optional(),
});

export const ListLeadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  kind: z.string().optional(),
  status: z.string().optional(),
});

export type GenerateAssessmentDTO = z.infer<typeof GenerateAssessmentSchema>;
export type EntryModelType = z.infer<typeof EntryModelSchema>;
export type ListSignalsDTO = z.infer<typeof ListSignalsSchema>;
export type ListCountriesDTO = z.infer<typeof ListCountriesSchema>;
export type CreateLeadDTO = z.infer<typeof CreateLeadSchema>;
export type ListAssessmentsDTO = z.infer<typeof ListAssessmentsSchema>;
export type ListLeadsDTO = z.infer<typeof ListLeadsSchema>;

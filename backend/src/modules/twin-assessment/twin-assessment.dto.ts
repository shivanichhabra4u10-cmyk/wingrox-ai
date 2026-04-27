import { z } from 'zod';

export const TwinPackageSchema = z.enum(['nucleus', 'catalyst', 'vanguard', 'apex']);

export const SendOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  packageKey: TwinPackageSchema.default('nucleus'),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const SaveProgressSchema = z.object({
  sessionToken: z.string().min(20),
  packageKey: TwinPackageSchema,
  company: z.record(z.unknown()).optional(),
  canvas: z.record(z.unknown()).optional(),
  answers: z.record(z.unknown()).optional(),
  aiAnswers: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CompleteAssessmentSchema = SaveProgressSchema.extend({
  report: z.record(z.unknown()).optional(),
});

export const ListAssessmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  email: z.string().email().optional(),
  status: z.string().optional(),
});

export type SendOtpDTO = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;
export type SaveProgressDTO = z.infer<typeof SaveProgressSchema>;
export type CompleteAssessmentDTO = z.infer<typeof CompleteAssessmentSchema>;
export type ListAssessmentsDTO = z.infer<typeof ListAssessmentsSchema>;

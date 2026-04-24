import { z } from 'zod';

export const CreateAccountSchema = z.object({
  name: z.string().min(2),
  legalName: z.string().optional(),
  website: z.string().url().optional(),
  country: z.string().min(2),
  industry: z.string().min(2),
  stage: z.string().min(2),
  annualRevenueUsd: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export const UpdateAccountSchema = CreateAccountSchema.partial();

export type CreateAccountDTO = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDTO = z.infer<typeof UpdateAccountSchema>;

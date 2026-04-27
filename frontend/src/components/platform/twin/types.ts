import { z } from 'zod';

export const PackageKeySchema = z.enum(['nucleus', 'catalyst', 'vanguard', 'apex']);
export type PackageKey = z.infer<typeof PackageKeySchema>;

export type TwinPackage = {
  key: PackageKey;
  name: string;
  tagline: string;
  price: string;
  subtitle: string;
  featureBullets: string[];
  cta: string;
  featured?: boolean;
};

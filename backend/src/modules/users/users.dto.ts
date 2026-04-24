import { z } from 'zod';

export const UserDTOSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']),
  avatar: z.string().optional(),
});

export type UserDTO = z.infer<typeof UserDTOSchema>;

export const CreateUserDTOSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).default('USER'),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;

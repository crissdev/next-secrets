import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty.'),
  description: z.string(),
});

export const createSecretSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty.'),
  value: z.string(),
  description: z.string(),
});

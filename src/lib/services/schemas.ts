import { z } from 'zod';

import { SECRET_TYPES } from '@/lib/definitions';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty.'),
  description: z.string(),
});

export const createSecretSchema = z.object({
  name: z.string().min(1, 'Secret name cannot be empty.'),
  value: z.string(),
  description: z.string(),
  type: z.enum(SECRET_TYPES),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.uuid(),
});

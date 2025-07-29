import { z } from 'zod';

import { SECRET_TYPE } from '@/lib/definitions';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty.'),
  description: z.string(),
});

export const createSecretSchema = z.object({
  name: z.string().min(1, 'Secret name cannot be empty.'),
  value: z.string().min(1, 'Secret value cannot be empty.'),
  description: z.string(),
  type: z.enum(SECRET_TYPE),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.uuid(),
});

export const updateSecretSchema = createSecretSchema.extend({
  id: z.uuid(),
});

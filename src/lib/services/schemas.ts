import { z } from 'zod';

import { SECRET_TYPE } from '@/lib/definitions';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty.'),
  description: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code.'),
});

export const createSecretSchema = z.object({
  name: z.string().min(1, 'Secret name cannot be empty.'),
  value: z.string().min(1, 'Secret value cannot be empty.'),
  description: z.string(),
  type: z.enum(SECRET_TYPE),
  environmentId: z.coerce.number<number>(),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.uuid(),
});

export const updateSecretSchema = createSecretSchema
  .extend({
    id: z.uuid(),
  })
  .omit({ value: true });

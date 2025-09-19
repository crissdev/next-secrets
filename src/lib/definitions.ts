import { type SecretType } from '@prisma/client';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  type: SecretType;
  value: string;
  environmentId: string;
  projectId: string;
  updatedAt: Date;
}

export interface Environment {
  id: string;
  name: string;
}

export enum SECRET_TYPE {
  API_KEY = 'API_KEY',
  CONNECTION_STRING = 'CONNECTION_STRING',
  PASSWORD = '',
  TOKEN = 'TOKEN',
  OTHER = 'OTHER',
}

// Update prisma/seed.ts if you change this
export const DEFAULT_ENVIRONMENTS: Environment[] = [
  { id: 'bbfd5e06-d229-4df2-8816-0702352ee62d', name: 'Development' },
  { id: 'e0244050-597a-4fe2-a201-af0ed54906bc', name: 'Staging' },
  { id: 'a777c2bf-1900-447f-bd8b-3403dc865cc4', name: 'Production' },
];

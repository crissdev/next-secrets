import { SecretType } from '@prisma/client';

export const secretTypeColors: Record<SecretType, string> = {
  [SecretType.API_KEY]: 'bg-blue-100 text-blue-800',
  [SecretType.CONNECTION_STRING]: 'bg-green-100 text-green-800',
  [SecretType.ENVIRONMENT_VARIABLE]: 'bg-purple-100 text-purple-800',
  [SecretType.OTHER]: 'bg-slate-100 text-slate-800',
  [SecretType.PASSWORD]: 'bg-amber-100 text-amber-800',
  [SecretType.TOKEN]: 'bg-indigo-100 text-indigo-800',
};

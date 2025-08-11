import { SECRET_TYPE } from '@/lib/definitions';

export const secretTypeColors: Record<SECRET_TYPE, string> = {
  [SECRET_TYPE.ApiKey]: 'bg-blue-100 text-blue-800',
  [SECRET_TYPE.ConnectionString]: 'bg-green-100 text-green-800',
  [SECRET_TYPE.EnvironmentVariable]: 'bg-purple-100 text-purple-800',
  [SECRET_TYPE.Other]: 'bg-slate-100 text-slate-800',
  [SECRET_TYPE.Password]: 'bg-amber-100 text-amber-800',
  [SECRET_TYPE.Token]: 'bg-indigo-100 text-indigo-800',
};

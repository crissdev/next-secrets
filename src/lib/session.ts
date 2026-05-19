import 'server-only';

import { headers } from 'next/headers';
import { connection } from 'next/server';

import { auth } from '@/lib/auth';

export async function getSession() {
  await connection();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

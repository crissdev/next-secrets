import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { getDatabaseProvider } from '@/lib/db/database-provider';
import { prisma } from '@/lib/db/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: getDatabaseProvider() }),
  ...(process.env.BETTER_AUTH_DISABLE_RATE_LIMIT === 'true' ? { rateLimit: { enabled: false } } : {}),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Password Reset] To: ${user.email}, URL: ${url}`);
    },
  },
});

export type Session = typeof auth.$Infer.Session;

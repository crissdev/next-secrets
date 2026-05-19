import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const sessionRes = await fetch(new URL('/api/auth/get-session', req.url), {
    headers: { cookie: req.headers.get('cookie') ?? '' },
  });
  const session = sessionRes.ok ? await sessionRes.json() : null;

  if (!session?.user) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}

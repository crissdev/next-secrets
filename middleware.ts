export { proxy as middleware } from '@/proxy';

export const config = {
  matcher: ['/((?!sign-in|sign-up|forgot-password|reset-password|api/auth|_next/static|_next/image|favicon\\.ico).*)'],
};

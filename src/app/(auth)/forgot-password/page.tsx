'use client';

import { CheckCircle2Icon, Loader2Icon, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/5 dark:shadow-black/20 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Forgot password?</h2>
        <p className="text-sm text-muted-foreground mt-1">We&apos;ll send you a link to reset it</p>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2Icon size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Check your inbox</p>
            <p className="text-sm text-muted-foreground mt-1">
              If <strong>{email}</strong> exists, a reset link has been sent.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <MailIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2Icon size={15} className="animate-spin" />
                Sending…
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      )}

      <p className="text-sm text-center text-muted-foreground mt-6">
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}

'use client';

import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    setError('');
    setLoading(true);

    const { error } = await authClient.resetPassword({ newPassword: password, token });

    if (error) {
      setError(error.message ?? 'Failed to reset password');
      setLoading(false);
    } else {
      router.push('/sign-in');
    }
  }

  if (!token) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-center">
        <p className="text-sm text-destructive">Invalid reset link. Please request a new one.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            className="pr-9"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2Icon size={15} className="animate-spin" />
            Resetting…
          </>
        ) : (
          'Reset password'
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/5 dark:shadow-black/20 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Reset password</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
      </div>

      <Suspense>
        <ResetPasswordForm />
      </Suspense>

      <p className="text-sm text-center text-muted-foreground mt-6">
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}

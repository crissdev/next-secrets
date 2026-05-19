'use client';

import { LogOutIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-client';

export default function SignOutButton({ userEmail }: { userEmail: string }) {
  async function handleSignOut() {
    await signOut();
    window.location.href = '/sign-in';
  }

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
        <LogOutIcon size={16} />
      </Button>
    </div>
  );
}

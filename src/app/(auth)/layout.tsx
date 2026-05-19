import { LockKeyholeIcon } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <LockKeyholeIcon size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Next Secrets</h1>
          <p className="text-sm text-muted-foreground">Secure secrets management</p>
        </div>
        {children}
      </div>
    </div>
  );
}

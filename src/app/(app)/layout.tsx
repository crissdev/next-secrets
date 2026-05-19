import { LockIcon } from 'lucide-react';
import { Suspense } from 'react';

import ProjectList from '@/app/(app)/projects/project-list';
import SignOutButton from '@/app/sign-out-button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { fetchProjects } from '@/lib/queries';
import { getSession } from '@/lib/session';

async function SidebarSession() {
  const session = await getSession();
  if (!session) return null;

  const projectsPromise = fetchProjects(session.user.id);

  return (
    <>
      <SidebarContent>
        <div className={'p-2'}>
          <Suspense fallback={null}>
            <ProjectList projectsPromise={projectsPromise} />
          </Suspense>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SignOutButton userEmail={session.user.email} />
      </SidebarFooter>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div data-testid={'app-title'} className={'text-xl font-bold inline-flex gap-2 items-center px-2 pt-2'}>
            <LockIcon size={'20'} className={'stroke-blue-700'} />
            Next Secrets
          </div>
        </SidebarHeader>
        <Suspense fallback={null}>
          <SidebarSession />
        </Suspense>
      </Sidebar>
      <main className={'flex flex-1 bg-slate-50 dark:bg-slate-900 overflow-hidden'}>{children}</main>
    </SidebarProvider>
  );
}

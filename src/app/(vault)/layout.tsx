import { LockIcon } from 'lucide-react';
import { type ReactNode, Suspense } from 'react';

import ProjectList from '@/app/(vault)/projects/project-list';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { fetchProjects } from '@/lib/queries';

export default async function VaultLayout({ children }: { children: ReactNode }) {
  const projectsPromise = fetchProjects();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div data-testid={'app-title'} className={'text-xl font-bold inline-flex gap-2 items-center px-2 pt-2'}>
            <LockIcon size={'20'} className={'stroke-blue-700'} />
            Next Secrets
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className={'p-4'}>
            <Suspense fallback={null}>
              <ProjectList projects={projectsPromise} />
            </Suspense>
          </div>
        </SidebarContent>
      </Sidebar>
      <main className={'flex flex-1 bg-slate-50 dark:bg-slate-900 overflow-hidden'}>{children}</main>
    </SidebarProvider>
  );
}

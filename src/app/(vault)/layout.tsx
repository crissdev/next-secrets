import { LockIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';

export default async function VaultLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div data-testid={'app-title'} className={'text-xl font-bold inline-flex gap-2 items-center p-2'}>
            <LockIcon size={'20'} className={'stroke-blue-700'} />
            Next Secrets
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className={'p-4 text-sm'}>
            <span className={'text-muted-foreground'} data-testid={'sidebar-empty-vault-message'}>
              No projects found. Create a new project to get started.
            </span>
          </div>
        </SidebarContent>
      </Sidebar>
      <main className={'flex flex-1 p-4'}>{children}</main>
    </SidebarProvider>
  );
}

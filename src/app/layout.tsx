import './globals.css';

import { LockIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import ProjectList from '@/app/projects/project-list';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { fetchProjects } from '@/lib/queries';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next Secrets',
  description:
    'NextSecrets is a web application for managing environment variables and secrets across ' +
    'different deployment environments (Development, Staging, Production).',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const projectsPromise = fetchProjects();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey={'next-secrets-theme'}
        >
          <Toaster richColors />
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <div data-testid={'app-title'} className={'text-xl font-bold inline-flex gap-2 items-center px-2 pt-2'}>
                  <LockIcon size={'20'} className={'stroke-blue-700'} />
                  Next Secrets
                </div>
              </SidebarHeader>
              <SidebarContent>
                <div className={'p-2'}>
                  <Suspense fallback={null}>
                    <ProjectList projectsPromise={projectsPromise} />
                  </Suspense>
                </div>
              </SidebarContent>
            </Sidebar>
            <main className={'flex flex-1 bg-slate-50 dark:bg-slate-900 overflow-hidden'}>{children}</main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

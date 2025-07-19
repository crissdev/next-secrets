'use client';

import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

import CreateProjectDialog from '@/app/(vault)/create-project-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Project } from '@/lib/definitions';

interface ProjectListProps {
  projects: Promise<Project[]>;
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const projectsList = use(projects);

  return (
    <div>
      <div className={'flex flex-col items-stretch gap-5'}>
        <Button
          variant={'default'}
          data-testid={'sidebar-create-project-button'}
          onClick={() => setCreateProjectDialogOpen(true)}
        >
          <PlusIcon size={20} />
          Create Project
        </Button>

        <CreateProjectDialog open={createProjectDialogOpen} onClose={() => setCreateProjectDialogOpen(false)} />

        {projectsList.length === 0 && (
          <span className={'text-muted-foreground'} data-testid={'sidebar-empty-vault-message'}>
            No projects found. Create a new project to get started.
          </span>
        )}

        <ScrollArea>
          <SidebarMenu>
            {projectsList.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link
                    className={'py-3 h-auto'}
                    data-testid={'sidebar-project-item'}
                    prefetch={false}
                    href={`/projects/${project.id}`}
                  >
                    {project.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </div>
    </div>
  );
}

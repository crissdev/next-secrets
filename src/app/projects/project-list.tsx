'use client';

import { MoreVertical, PencilLineIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import DeleteProjectDialog from '@/app/projects/delete-project-dialog';
import EditProjectDialog from '@/app/projects/edit-project-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { Project } from '@/lib/definitions';

interface ProjectListProps {
  projectsPromise: Promise<Project[]>;
}

export default function ProjectList({ projectsPromise }: ProjectListProps) {
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [contextMenuProjectId, setContextMenuProjectId] = useState<string | null>(null);
  const { id: selectedProjectId } = useParams<{ id?: string }>();

  const projectsList = use(projectsPromise);
  const contextMenuProjectName = projectsList.find((p) => p.id === contextMenuProjectId)?.name ?? 'N/A';

  useEffect(() => {
    if (selectedProjectId) {
      const element = document.querySelector(`[data-project-id="${selectedProjectId}"]`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedProjectId]);

  return (
    <div>
      <div className={'flex flex-col items-stretch gap-5'}>
        <div className="p-2">
          <Button
            className={'w-full'}
            variant={'default'}
            data-testid={'sidebar-create-project-button'}
            onClick={() => setCreateProjectDialogOpen(true)}
          >
            <PlusIcon size={20} />
            Create Project
          </Button>
        </div>

        <EditProjectDialog
          open={createProjectDialogOpen}
          onClose={() => {
            setCreateProjectDialogOpen(false);
            setContextMenuProjectId(null);
          }}
          project={contextMenuProjectId ? projectsList.find((p) => p.id === contextMenuProjectId) : undefined}
        />

        {contextMenuProjectId && contextMenuProjectName && (
          <DeleteProjectDialog
            projectId={contextMenuProjectId}
            projectName={contextMenuProjectName}
            open={deleteProjectDialogOpen}
            onClose={() => {
              setDeleteProjectDialogOpen(false);
              setContextMenuProjectId(null);
            }}
          ></DeleteProjectDialog>
        )}

        {projectsList.length === 0 && (
          <span className={'text-muted-foreground text-sm px-3'} data-testid={'sidebar-empty-vault-message'}>
            No projects found. Create a new project to get started.
          </span>
        )}

        {projectsList.length > 0 && (
          <div>
            <div className={'text-muted-foreground font-semibold text-sm tracking-wider pl-2 mb-3'}>PROJECTS</div>
            <SidebarMenu>
              {projectsList.map((project, index) => (
                <SidebarMenuItem key={project.id} className={`group/actions`} data-project-id={project.id}>
                  <SidebarMenuButton size={'lg'} asChild isActive={project.id === selectedProjectId}>
                    <Link
                      data-testid={`sidebar-project-name-${index}`}
                      prefetch={false}
                      href={`/projects/${project.id}`}
                    >
                      <span
                        data-testid={`sidebar-project-color-${index}`}
                        className={'rounded-full size-2 inline-block mr-1'}
                        style={{ backgroundColor: project.color ?? '#2563EBFF' }}
                      />
                      <span className={'inline-block'}>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction className={`opacity-0 group-hover/actions:opacity-100 mt-1 cursor-pointer`}>
                        <MoreVertical />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem asChild>
                        <SidebarMenuButton
                          variant={'outline'}
                          onClick={() => {
                            setContextMenuProjectId(project.id);
                            setCreateProjectDialogOpen(true);
                          }}
                        >
                          <PencilLineIcon />
                          <span>Edit</span>
                        </SidebarMenuButton>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <SidebarMenuButton
                          className={'text-destructive'}
                          variant={'outline'}
                          onClick={() => {
                            setContextMenuProjectId(project.id);
                            setDeleteProjectDialogOpen(true);
                          }}
                        >
                          <Trash2Icon size={20} className={'text-destructive'} />
                          <span>Delete</span>
                        </SidebarMenuButton>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}
      </div>
    </div>
  );
}

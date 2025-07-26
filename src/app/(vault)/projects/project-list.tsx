'use client';

import { MoreVertical, PencilLineIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use, useState } from 'react';

import DeleteProjectDialog from '@/app/(vault)/projects/delete-project-dialog';
import EditProjectDialog from '@/app/(vault)/projects/edit-project-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Project } from '@/lib/definitions';

interface ProjectListProps {
  projects: Promise<Project[]>;
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [contextMenuProjectId, setContextMenuProjectId] = useState<string | null>(null);
  const { id: selectedProjectId } = useParams<{ id?: string }>();

  const projectsList = use(projects);
  const contextMenuProjectName = projectsList.find((p) => p.id === contextMenuProjectId)?.name ?? 'N/A';

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
          <span className={'text-muted-foreground'} data-testid={'sidebar-empty-vault-message'}>
            No projects found. Create a new project to get started.
          </span>
        )}

        <SidebarMenu>
          {projectsList.map((project) => (
            <SidebarMenuItem key={project.id} className={`group/actions`}>
              <SidebarMenuButton size={'lg'} asChild isActive={project.id === selectedProjectId}>
                <Link data-testid={'sidebar-project-item'} prefetch={false} href={`/projects/${project.id}`}>
                  {project.name}
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
    </div>
  );
}

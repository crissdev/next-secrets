'use client';

import { PlusIcon } from 'lucide-react';
import { use, useState } from 'react';

import CreateProjectDialog from '@/app/(vault)/create-project-dialog';
import { Button } from '@/components/ui/button';
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

        <div className="space-y-2">
          {projectsList.map((project) => (
            <div key={project.id} className="px-2 py-1 rounded hover:bg-muted" data-testid={'sidebar-project-item'}>
              {project.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

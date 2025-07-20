import SecretList from '@/app/(vault)/projects/[id]/secret-list';
import { fetchProject, fetchSecrets } from '@/lib/queries';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await fetchProject(params.id);

  // todo: 404 if project is not found
  if (!project) throw new Error('No project');

  const secretsPromise = fetchSecrets(project.id);

  return (
    <div className={'bg-white w-full flex flex-col'}>
      <header className={'bg-white dark:bg-slate-800 py-3 px-4 border-b border-border'}>
        <div className={'flex flex-col'}>
          <h2 className={'font-bold text-xl'} data-testid={'selected-project-title'}>
            {project?.name}
          </h2>
          <span data-testid={'project-secrets-count'} className={'font-normal text-muted-foreground text-sm'}>
            0 secrets
          </span>
        </div>
      </header>

      <div className={'flex-1'}>
        <SecretList projectName={project?.name} secretsPromise={secretsPromise} />
      </div>
    </div>
  );
}

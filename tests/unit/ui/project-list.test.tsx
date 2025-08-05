import { act, render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';

import ProjectList from '@/app/(vault)/projects/project-list';
import { SidebarProvider } from '@/components/ui/sidebar';
import { type Project } from '@/lib/definitions';

describe('Project list', () => {
  const useParamsMock = useParams as jest.Mock<{ id?: string }, []>;

  beforeEach(() => {
    useParamsMock.mockReturnValue({});
  });

  test('Display empty vault message', async () => {
    await act(async () => {
      const projectsPromise = Promise.resolve([]);
      render(<ProjectList projectsPromise={projectsPromise} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-empty-vault-message')).toHaveTextContent(
        'No projects found. Create a new project to get started.',
      );
    });
  });

  test('Display a list of projects', async () => {
    await act(async () => {
      const projectsPromise = Promise.resolve<Project[]>([
        {
          id: crypto.randomUUID(),
          name: 'Project_1',
          description: 'Project_1 description',
          color: '#ff0000',
        },
      ]);
      render(
        <SidebarProvider>
          <ProjectList projectsPromise={projectsPromise} />
        </SidebarProvider>,
      );
    });
    expect(screen.getByTestId('sidebar-project-name-0')).toHaveTextContent('Project_1');
    expect(screen.getByTestId('sidebar-project-color-0')).toHaveStyle({ backgroundColor: '#ff0000' });
  });
});

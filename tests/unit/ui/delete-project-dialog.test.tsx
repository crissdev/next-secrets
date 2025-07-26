import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { revalidatePath } from 'next/cache';

import DeleteProjectDialog from '@/app/(vault)/projects/delete-project-dialog';

jest.mock('@/lib/queries');
import { revalidateProjects } from '@/lib/queries';

jest.mock('@/lib/store/db');
import { useParams } from 'next/navigation';

import { deleteProject } from '@/lib/store/db';

import { useRouterMockFactory } from '../factories';

describe('Delete project dialog', () => {
  const deleteProjectMock = deleteProject as jest.Mock<
    ReturnType<typeof deleteProject>,
    Parameters<typeof deleteProject>
  >;
  const useParamsMock = useParams as jest.Mock<{ id?: string }, []>;

  beforeEach(() => {
    useParamsMock.mockReturnValue({});
  });

  test('Delete a project via dialog', async () => {
    const projectId = crypto.randomUUID();
    const projectName = faker.lorem.words(2);
    const onCloseMock = jest.fn();
    const { pushMock } = useRouterMockFactory();

    render(<DeleteProjectDialog projectId={projectId} projectName={projectName} open onClose={onCloseMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(screen.getByTestId('warning-message')).toHaveTextContent(
      `Are you sure you want to delete "${projectName}"? This action cannot be undone and will delete all secrets within this project.`,
    );
    expect(deleteProjectMock).toHaveBeenCalledTimes(1);
    expect(deleteProjectMock).toHaveBeenCalledWith(projectId);
    expect(revalidateProjects).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/');
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

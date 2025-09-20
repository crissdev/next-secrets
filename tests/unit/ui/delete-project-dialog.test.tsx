import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { revalidatePath } from 'next/cache';
import { useParams } from 'next/navigation';

import DeleteProjectDialog from '@/app/projects/delete-project-dialog';
import { revalidateProjects } from '@/lib/queries';
import { deleteProject } from '@/lib/store/storage';

import { useRouterMockFactory } from '../factories';

jest.mock('@/lib/queries');

jest.mock('@/lib/store/storage');

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
    const projectId = faker.string.uuid();
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

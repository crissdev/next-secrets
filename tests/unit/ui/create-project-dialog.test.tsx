import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateProjectDialog from '@/app/(vault)/create-project-dialog';
import { revalidateProjects } from '@/lib/queries';
import { createProject } from '@/lib/store/db';

import { useRouterMockFactory } from '../factories';

jest.mock('@/lib/store/db');

jest.mock('@/lib/queries');

describe('Create project dialog', () => {
  const createProjectMock = createProject as jest.Mock<
    ReturnType<typeof createProject>,
    Parameters<typeof createProject>
  >;

  test('Create a new project via dialog', async () => {
    const { pushMock } = useRouterMockFactory();

    const projectId = crypto.randomUUID();
    const projectName = faker.lorem.word();
    const projectDescription = faker.lorem.sentence(3);
    createProjectMock.mockResolvedValueOnce({ id: projectId, name: projectName, description: projectDescription });

    const onCloseMock = jest.fn();
    render(<CreateProjectDialog open={true} onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    await userEvent.type(screen.getByRole('textbox', { name: 'Project name' }), projectName);
    await userEvent.type(screen.getByRole('textbox', { name: 'Description (optional)' }), projectDescription);
    await userEvent.click(screen.getByRole('button', { name: 'Create project' }));

    expect(createProject).toHaveBeenCalledTimes(1);
    expect(createProject).toHaveBeenCalledWith({
      name: projectName,
      description: projectDescription,
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    // Expect cache to be invalidated
    expect(revalidateProjects).toHaveBeenCalledTimes(1);

    // Expect page to navigate
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(`/projects/${projectId}`);
  });
});

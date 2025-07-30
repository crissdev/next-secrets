import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditProjectDialog from '@/app/(vault)/projects/edit-project-dialog';
import type { Project } from '@/lib/definitions';
import { revalidateProjects } from '@/lib/queries';

import { useRouterMockFactory } from '../factories';

jest.mock('@/lib/store/db');
import { createProject, updateProject } from '@/lib/store/db';

jest.mock('@/lib/queries');

describe('Edit project dialog', () => {
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
    render(<EditProjectDialog open={true} onClose={onCloseMock} />);
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

  test('Edit project via dialog', async () => {
    const onCloseMock = jest.fn();
    const project: Project = {
      id: crypto.randomUUID(),
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(3),
    };

    render(<EditProjectDialog open onClose={onCloseMock} project={project} />);
    expect(screen.getByRole('dialog', { name: 'Edit project' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveValue(project.name);
    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toHaveValue(project.description);

    await userEvent.clear(screen.getByRole('textbox', { name: 'Project name' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Project name' }), 'Updated name');
    await userEvent.clear(screen.getByRole('textbox', { name: 'Description (optional)' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Description (optional)' }), 'Updated description');
    await userEvent.click(screen.getByRole('button', { name: 'Update project' }));

    expect(updateProject).toHaveBeenCalledTimes(1);
    expect(updateProject).toHaveBeenCalledWith({
      id: project.id,
      name: 'Updated name',
      description: 'Updated description',
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    // Expect cache to be invalidated
    expect(revalidateProjects).toHaveBeenCalledTimes(1);
  });
});

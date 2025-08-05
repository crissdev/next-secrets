import { faker } from '@faker-js/faker';

import { createProject, getProject } from '@/lib/services/projects.service';

describe('Services', () => {
  test('Create project and save it to store', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    const project = await createProject({ name, description, color });
    expect(project).toStrictEqual({ id: expect.any(String), name, description, color });
  });

  test('Cannot create project with empty name', async () => {
    const name = '';
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    await expect(createProject({ name, description, color })).rejects.toThrow('Project name cannot be empty.');
  });

  test('Create project with duplicate name throws error', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    await createProject({ name, description, color });
    await expect(createProject({ name, description, color })).rejects.toThrow(
      `Project with name "${name}" already exists.`,
    );
  });

  test('Retrieve project by unique id', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    const { id } = await createProject({ name, description, color });
    const project = await getProject(id);
    expect(project).toStrictEqual({ id, name, description, color });
  });
});

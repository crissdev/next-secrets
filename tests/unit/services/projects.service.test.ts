import { faker } from '@faker-js/faker';

import { createProject } from '@/lib/services/projects.service';

describe('Services', () => {
  test('Cannot create project with empty name', async () => {
    const name = '';
    const description = faker.lorem.words(3);
    await expect(createProject({ name, description })).rejects.toThrow('Project name cannot be empty.');
  });

  test('Create project and save it to store', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const project = await createProject({ name, description });
    expect(project).toEqual({ id: expect.any(String), name, description });
  });

  test('Create project with duplicate name throws error', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    await createProject({ name, description });
    await expect(createProject({ name, description })).rejects.toThrow(`Project with name "${name}" already exists.`);
  });
});

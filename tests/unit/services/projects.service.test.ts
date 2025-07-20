import { faker } from '@faker-js/faker';

import { createProject, getProject } from '@/lib/services/projects.service';

describe('Services', () => {
  test('Create project and save it to store', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const project = await createProject({ name, description });
    expect(project).toStrictEqual({ id: expect.any(String), name, description });
  });

  test('Cannot create project with empty name', async () => {
    const name = '';
    const description = faker.lorem.words(3);
    await expect(createProject({ name, description })).rejects.toThrow('Project name cannot be empty.');
  });

  test('Create project with duplicate name throws error', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    await createProject({ name, description });
    await expect(createProject({ name, description })).rejects.toThrow(`Project with name "${name}" already exists.`);
  });

  test('Retrieve project by unique id', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const { id } = await createProject({ name, description });
    const project = await getProject(id);
    expect(project).toStrictEqual({ id, name, description });
  });
});

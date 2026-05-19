import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createProject, getProject } from '@/lib/services/projects.service';

const TEST_USER_ID = 'test-user-id';

describe('Projects service', () => {
  test('Create project and save it to store', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    const project = await createProject({ name, description, color }, TEST_USER_ID);
    expect(project).toStrictEqual({
      id: expect.any(String),
      name,
      description,
      color,
      userId: TEST_USER_ID,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test('Cannot create project with empty name', async () => {
    const name = '';
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    await expect(createProject({ name, description, color }, TEST_USER_ID)).rejects.toThrow(
      'Project name cannot be empty.',
    );
  });

  test('Create project with duplicate name throws error', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    await createProject({ name, description, color }, TEST_USER_ID);
    await expect(createProject({ name, description, color }, TEST_USER_ID)).rejects.toThrow(
      `Project with name "${name}" already exists`,
    );
  });

  test('Retrieve project by unique id', async () => {
    const name = faker.lorem.word();
    const description = faker.lorem.words(3);
    const color = faker.color.rgb({ format: 'hex' });
    const { id } = await createProject({ name, description, color }, TEST_USER_ID);
    const project = await getProject(id, TEST_USER_ID);
    expect(project).toStrictEqual({
      id,
      name,
      description,
      color,
      userId: TEST_USER_ID,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

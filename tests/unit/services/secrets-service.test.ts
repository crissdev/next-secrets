import { faker } from '@faker-js/faker';

import { type Secret, SECRET_TYPE } from '@/lib/definitions';
import { createProject } from '@/lib/services/projects.service';
import { createSecret, getSecrets, updateSecret } from '@/lib/services/secrets.service';

describe('Secret service', () => {
  test('Create a secret for a project', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPE.EnvironmentVariable,
      environmentId: 100,
    });

    expect(secret).toEqual<Secret>({
      id: expect.any(String),
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPE.EnvironmentVariable,
      lastUpdated: expect.any(String),
      environmentId: 100,
    });
  });

  test('Secret value is required', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });
    await expect(() =>
      createSecret(project.id, {
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        type: SECRET_TYPE.EnvironmentVariable,
        value: '',
        environmentId: 100,
      }),
    ).rejects.toThrow('Secret value cannot be empty.');
  });

  test('Retrieve a list of secrets for a project', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPE.EnvironmentVariable,
      environmentId: 100,
    });
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual<Secret[]>([
      {
        id: expect.any(String),
        name: 'CI Token',
        value: '12345',
        description: 'Token used in CI',
        type: SECRET_TYPE.EnvironmentVariable,
        lastUpdated: expect.any(String),
        environmentId: 100,
      },
    ]);
  });

  test('Update a secret for a project', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPE.EnvironmentVariable,
      environmentId: 100,
    });

    const updatedSecret = await updateSecret(project.id, {
      id: secret.id,
      name: 'Updated CI Token',
      value: '67890',
      description: 'Updated token used in CI',
      type: SECRET_TYPE.EnvironmentVariable,
      environmentId: 200,
    });

    expect(updatedSecret).toEqual<Secret>({
      id: secret.id,
      name: 'Updated CI Token',
      value: '67890',
      description: 'Updated token used in CI',
      type: SECRET_TYPE.EnvironmentVariable,
      lastUpdated: expect.any(String),
      environmentId: 200,
    });

    // Verify the secret was actually updated in the database
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual<Secret[]>([updatedSecret]);
  });

  test('Secret value is required when updating a secret', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });
    await expect(() =>
      updateSecret(project.id, {
        id: crypto.randomUUID(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        type: SECRET_TYPE.EnvironmentVariable,
        value: '',
        environmentId: 100,
      }),
    ).rejects.toThrow('Secret value cannot be empty.');
  });
});

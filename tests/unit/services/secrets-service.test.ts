import { faker } from '@faker-js/faker';

import { type Secret, SECRET_TYPES } from '@/lib/definitions';
import { createProject } from '@/lib/services/projects.service';
import { createSecret, getSecrets, updateSecret } from '@/lib/services/secrets.service';

describe('Secret service', () => {
  test('Create a secret for a project', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPES.EnvironmentVariable,
    });

    expect(secret).toEqual<Secret>({
      id: expect.any(String),
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPES.EnvironmentVariable,
    });
  });

  test('Retrieve a list of secrets for a project', async () => {
    // Create a project
    // Add secrets
    // Fetch secrets

    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPES.EnvironmentVariable,
    });
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual<Secret[]>([
      {
        id: expect.any(String),
        name: 'CI Token',
        value: '12345',
        description: 'Token used in CI',
        type: SECRET_TYPES.EnvironmentVariable,
      },
    ]);
  });

  test('Update a secret for a project', async () => {
    // Create a project
    // Create a secret
    // Update the secret
    // Verify the secret was updated

    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SECRET_TYPES.EnvironmentVariable,
    });

    const updatedSecret = await updateSecret(project.id, {
      id: secret.id,
      name: 'Updated CI Token',
      value: '67890',
      description: 'Updated token used in CI',
      type: SECRET_TYPES.EnvironmentVariable,
    });

    expect(updatedSecret).toEqual<Secret>({
      id: secret.id,
      name: 'Updated CI Token',
      value: '67890',
      description: 'Updated token used in CI',
      type: SECRET_TYPES.EnvironmentVariable,
    });

    // Verify the secret was actually updated in the database
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual<Secret[]>([updatedSecret]);
  });
});

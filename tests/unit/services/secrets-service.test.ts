import { faker } from '@faker-js/faker';

import { type Secret } from '@/lib/definitions';
import { createProject } from '@/lib/services/projects.service';
import { createSecret, getSecrets } from '@/lib/services/secrets.service';

describe('Secret service', () => {
  test('Create a secret for a project', async () => {
    const project = await createProject({ name: faker.lorem.words(2), description: '' });

    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
    });

    expect(secret).toEqual<Secret>({
      id: expect.any(String),
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
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
    });
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual<Secret[]>([
      { id: expect.any(String), name: 'CI Token', value: '12345', description: 'Token used in CI' },
    ]);
  });
});

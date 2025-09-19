import { faker } from '@faker-js/faker';
import { SecretType } from '@prisma/client';

import { DEFAULT_ENVIRONMENTS, type Secret } from '@/lib/definitions';
import { createProject } from '@/lib/services/projects.service';
import { createSecret, downloadSecrets, getSecrets, updateSecret } from '@/lib/services/secrets.service';

describe('Secret service', () => {
  async function createTestProject() {
    return await createProject({
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      color: faker.color.rgb({ format: 'hex' }),
    });
  }

  function createTestSecret(projectId: string, overrides: Partial<Omit<Secret, 'id'>> = {}) {
    return createSecret(projectId, {
      name: faker.lorem.words(2),
      value: faker.string.alphanumeric(10),
      description: faker.lorem.sentence(),
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
      ...overrides,
    });
  }

  test('Create a secret for a project', async () => {
    const project = await createTestProject();

    const envId = DEFAULT_ENVIRONMENTS[0].id;
    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: envId,
    });

    expect(secret).toStrictEqual({
      id: expect.any(String),
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: envId,
      projectId: project.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test('Retrieve a list of secrets for a project', async () => {
    const project = await createTestProject();

    const envId = DEFAULT_ENVIRONMENTS[0].id;
    await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: envId,
    });
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual([
      {
        id: expect.any(String),
        name: 'CI Token',
        value: '[REDACTED]',
        description: 'Token used in CI',
        type: SecretType.ENVIRONMENT_VARIABLE,
        environmentId: envId,
        projectId: project.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
  });

  test('Update a secret for a project', async () => {
    const project = await createTestProject();

    const secret = await createSecret(project.id, {
      name: 'CI Token',
      value: '12345',
      description: 'Token used in CI',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
    });

    const updatedSecret = await updateSecret({
      id: secret.id,
      name: 'Updated CI Token',
      description: 'Updated token used in CI',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[1].id,
    });

    expect(updatedSecret).toStrictEqual({
      id: secret.id,
      name: 'Updated CI Token',
      value: '[REDACTED]',
      description: 'Updated token used in CI',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[1].id,
      projectId: project.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    // Verify the secret was actually updated in the database
    const secrets = await getSecrets(project.id);
    expect(secrets).toStrictEqual([updatedSecret]);
  });

  test('Secret value is required when creating a secret', async () => {
    const project = await createTestProject();
    await expect(() =>
      createSecret(project.id, {
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        type: SecretType.ENVIRONMENT_VARIABLE,
        value: '',
        environmentId: DEFAULT_ENVIRONMENTS[0].id,
      }),
    ).rejects.toThrow('Secret value cannot be empty.');
  });

  test('Download selected secrets for a project', async () => {
    const project = await createTestProject();

    await createTestSecret(project.id);
    const secret2 = await createTestSecret(project.id);

    const secrets = await downloadSecrets(project.id, [secret2.id]);
    expect(secrets).toEqual([{ name: secret2.name, value: secret2.value }]);
  });

  test('Download all secrets for a project', async () => {
    const project = await createTestProject();

    const secret1 = await createTestSecret(project.id);
    const secret2 = await createTestSecret(project.id);

    const secrets = await downloadSecrets(project.id);
    expect(secrets).toEqual([
      { name: secret1.name, value: secret1.value },
      { name: secret2.name, value: secret2.value },
    ]);
  });
});

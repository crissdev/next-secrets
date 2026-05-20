import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SecretList from '@/app/(app)/projects/[id]/secret-list';
import { SecretGroup, SecretType } from '@/lib/db/prisma-client/enums';
import { DEFAULT_ENVIRONMENTS, DEFAULT_SECRET_GROUPS, type Secret } from '@/lib/definitions';
import { getSecretValue } from '@/lib/store/storage';
import { toTitleCase } from '@/lib/string-util';

vi.mock('@/lib/store/storage');

describe('Secret list', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({});
  });

  test('Display no secrets message', async () => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} onFilterChanged={vi.fn()} />);
    });
    expect(screen.getByTestId('no-secrets-message')).toHaveTextContent('No secrets yet');
    expect(screen.getByTestId('no-secrets-hint')).toHaveTextContent(`Add your first secret to the "XYZ" project.`);
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled();
  });

  test('Display a list of secrets', async () => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: faker.string.uuid(),
          name: 'Secret_1',
          value: '1',
          description: 'Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
          name: 'Secret_2',
          value: '2',
          description: 'Secret_2 description',
          type: SecretType.PASSWORD,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} onFilterChanged={vi.fn()} />);
    });

    expect(screen.getByRole('table')).toHaveProperty('rows.length', 3);

    expect(screen.getByTestId('secret-name-0')).toHaveTextContent('Secret_1');
    expect(screen.getByTestId('secret-description-0')).toHaveTextContent('Secret_1 description');
    expect(screen.getByTestId('secret-type-0')).toHaveTextContent('Environment Variable');
    expect(screen.getByTestId('secret-group-0')).toHaveTextContent('Runtime app');
    expect(screen.getByTestId('secret-environment-0')).toHaveTextContent(DEFAULT_ENVIRONMENTS[0].name);
    expect(screen.getByTestId('secret-value-0')).toHaveTextContent('••••••••');
    expect(screen.getByTestId('secret-updated-0')).toHaveTextContent('Just now');

    expect(screen.getByTestId('secret-name-1')).toHaveTextContent('Secret_2');
    expect(screen.getByTestId('secret-description-1')).toHaveTextContent('Secret_2 description');
    expect(screen.getByTestId('secret-type-1')).toHaveTextContent('Password');
    expect(screen.getByTestId('secret-group-1')).toHaveTextContent('Runtime app');
    expect(screen.getByTestId('secret-environment-1')).toHaveTextContent(DEFAULT_ENVIRONMENTS[0].name);
    expect(screen.getByTestId('secret-value-1')).toHaveTextContent('••••••••');
    expect(screen.getByTestId('secret-value-1')).toHaveTextContent('••••••••');
    expect(screen.getByTestId('secret-updated-1')).toHaveTextContent('Just now');
  });

  test.each(DEFAULT_ENVIRONMENTS)('Map environment ID=$id to environment name', async (environment) => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: faker.string.uuid(),
          name: 'Secret_1',
          value: '1',
          description: 'Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: environment.id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} onFilterChanged={vi.fn()} />);
    });
    expect(screen.getByTestId('secret-environment-0')).toHaveTextContent(environment.name);
  });

  test.each(Object.values(SecretType))('Map secret type (%s) to human readable name', async (type) => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: faker.string.uuid(),
          name: 'Secret_1',
          value: '1',
          description: 'Secret_1 description',
          type: type,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} onFilterChanged={vi.fn()} />);
    });
    const prettyName = toTitleCase(type);
    expect(screen.getByTestId('secret-type-0')).toHaveTextContent(prettyName);
  });

  test.each(DEFAULT_SECRET_GROUPS)('Map secret group $id to group name', async (group) => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: faker.string.uuid(),
          name: 'Secret_1',
          value: '1',
          description: 'Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: group.id,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} onFilterChanged={vi.fn()} />);
    });

    if (group.id !== SecretGroup.RUNTIME_APPLICATION) {
      await userEvent.click(screen.getByRole('combobox', { name: 'Select secret group' }));
      await userEvent.click(screen.getByRole('option', { name: group.name }));
    }

    expect(screen.getByTestId('secret-group-0')).toHaveTextContent(group.name);
  });

  test('Copy secret value to clipboard', async () => {
    userEvent.setup({ writeToClipboard: true });
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());

    const projectId = faker.string.uuid();
    const projectName = 'Test Project';
    const secretId = faker.string.uuid();
    const secretValue = '12345';

    vi.mocked(getSecretValue).mockResolvedValueOnce(secretValue);

    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: secretId,
          name: 'Secret_1',
          value: '[REDACTED]',
          description: 'Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      render(
        <SecretList
          projectInfo={{ id: projectId, name: projectName }}
          secretsPromise={secretsPromise}
          onFilterChanged={vi.fn()}
        />,
      );
    });

    await userEvent.click(screen.getByTestId('copy-secret-0'));

    expect(getSecretValue).toHaveBeenCalledTimes(1);
    expect(getSecretValue).toHaveBeenCalledWith(secretId);

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secretValue);
  });

  test('View secret value', async () => {
    const projectId = faker.string.uuid();
    const projectName = 'Test Project';
    const secretId = faker.string.uuid();
    const secretValue = '12345';

    vi.mocked(getSecretValue).mockResolvedValueOnce(secretValue);

    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: secretId,
          name: 'Secret_1',
          value: '[REDACTED]',
          description: 'Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      render(
        <SecretList
          projectInfo={{ id: projectId, name: projectName }}
          secretsPromise={secretsPromise}
          onFilterChanged={vi.fn()}
        />,
      );
    });

    await userEvent.click(screen.getByTestId('show-secret-0'));

    expect(getSecretValue).toHaveBeenCalledTimes(1);
    expect(getSecretValue).toHaveBeenCalledWith(secretId);

    expect(screen.getByTestId('secret-value-0')).toHaveTextContent(secretValue);
  });

  test('View secret does not fetch the secret if Copy is clicked first', async () => {
    userEvent.setup({ writeToClipboard: true });
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());

    const projectId = faker.string.uuid();
    const projectName = 'Test Project';
    const secretId = faker.string.uuid();
    const secretValue = '12345';

    vi.mocked(getSecretValue).mockResolvedValueOnce(secretValue);

    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: secretId,
          name: 'Secret_1',
          value: '[REDACTED]',
          description: 'Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      render(
        <SecretList
          projectInfo={{ id: projectId, name: projectName }}
          secretsPromise={secretsPromise}
          onFilterChanged={vi.fn()}
        />,
      );
    });

    await userEvent.click(screen.getByTestId('copy-secret-0'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secretValue);

    vi.mocked(getSecretValue).mockClear();
    await userEvent.click(screen.getByTestId('show-secret-0'));
    expect(getSecretValue).not.toHaveBeenCalled();
    expect(screen.getByTestId('secret-value-0')).toHaveTextContent(secretValue);
  });

  test('Filter secrets by name', async () => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: faker.string.uuid(),
          name: 'Secret_1',
          value: '1',
          description: '_1 Secret_1 description',
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
          name: 'Secret_2',
          value: '2',
          description: 'Secret_2 description',
          type: SecretType.PASSWORD,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ]);
      const projectInfo = { id: faker.string.uuid(), name: faker.lorem.words(2) };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} onFilterChanged={vi.fn()} />);
    });

    expect(screen.getByRole('table')).toHaveProperty('rows.length', 3);

    await userEvent.type(screen.getByPlaceholderText('Search secrets...'), '_1');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByTestId('secret-name-0')).toHaveTextContent('Secret_1');
  });

  test.each(DEFAULT_ENVIRONMENTS)('Filter secrets by environment $name', async ({ name: envName }) => {
    await act(async () => {
      const secrets = DEFAULT_ENVIRONMENTS.map<Secret>((env) => ({
        id: faker.string.uuid(),
        name: faker.lorem.words(2),
        value: '[REDACTED]',
        description: faker.lorem.sentence(5),
        type: SecretType.ENVIRONMENT_VARIABLE,
        group: SecretGroup.RUNTIME_APPLICATION,
        environmentId: env.id,
        updatedAt: new Date(),
        projectId: faker.string.uuid(),
      }));
      const secretsPromise = Promise.resolve(secrets);
      render(
        <SecretList
          projectInfo={{ id: faker.string.uuid(), name: faker.lorem.words(2) }}
          secretsPromise={secretsPromise}
          onFilterChanged={vi.fn()}
        />,
      );
    });

    expect(screen.getAllByRole('row')).toHaveLength(DEFAULT_ENVIRONMENTS.length + 1);
    expect(screen.getAllByTestId(/^secret-environment-\d/).map((e) => e.textContent)).toStrictEqual(
      DEFAULT_ENVIRONMENTS.map((env) => env.name),
    );

    // Filter
    await userEvent.click(screen.getByRole('combobox', { name: 'Select environment' }));
    await userEvent.click(screen.getByRole('option', { name: envName }));

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByTestId('secret-environment-0')).toHaveTextContent(envName);
  });

  test('Filter secrets by group', async () => {
    await act(async () => {
      const secrets: Secret[] = [
        {
          id: faker.string.uuid(),
          name: 'Runtime secret',
          value: '[REDACTED]',
          description: faker.lorem.sentence(5),
          type: SecretType.ENVIRONMENT_VARIABLE,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
          name: 'Actions secret',
          value: '[REDACTED]',
          description: faker.lorem.sentence(5),
          type: SecretType.TOKEN,
          group: SecretGroup.GITHUB_ACTIONS,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ];
      const secretsPromise = Promise.resolve(secrets);
      render(
        <SecretList
          projectInfo={{ id: faker.string.uuid(), name: faker.lorem.words(2) }}
          secretsPromise={secretsPromise}
          onFilterChanged={vi.fn()}
        />,
      );
    });

    expect(screen.getByTestId('secret-name-0')).toHaveTextContent('Runtime secret');
    expect(screen.queryByText('Actions secret')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox', { name: 'Select secret group' }));
    await userEvent.click(screen.getByRole('option', { name: 'GitHub Actions' }));

    expect(screen.getByTestId('secret-name-0')).toHaveTextContent('Actions secret');
    expect(screen.getByTestId('secret-group-0')).toHaveTextContent('GitHub Actions');
    expect(screen.queryByText('Runtime secret')).not.toBeInTheDocument();
  });

  test.each(Object.values<SecretType>(SecretType))('Filter secrets by type (%s)', async (type) => {
    await act(async () => {
      const secrets: Secret[] = [
        {
          id: faker.string.uuid(),
          name: faker.lorem.words(2),
          value: '[REDACTED]',
          description: faker.lorem.sentence(5),
          type: type,
          group: SecretGroup.RUNTIME_APPLICATION,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          updatedAt: new Date(),
          projectId: faker.string.uuid(),
        },
      ];
      const secretsPromise = Promise.resolve(secrets);
      render(
        <SecretList
          projectInfo={{ id: faker.string.uuid(), name: faker.lorem.words(2) }}
          secretsPromise={secretsPromise}
          onFilterChanged={vi.fn()}
        />,
      );
    });

    const prettyOptionName = toTitleCase(type);

    await userEvent.click(screen.getByRole('combobox', { name: 'Select secret type' }));
    await userEvent.click(screen.getByRole('option', { name: prettyOptionName }));

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByTestId('secret-type-0')).toHaveTextContent(prettyOptionName);
  });
});

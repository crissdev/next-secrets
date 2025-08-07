import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';

import SecretList from '@/app/(vault)/projects/[id]/secret-list';
import { DEFAULT_ENVIRONMENTS, type Secret, SECRET_TYPE } from '@/lib/definitions';

jest.mock('@/lib/store/db');
import { getSecretValue } from '@/lib/store/db';

describe('Secret list', () => {
  const useParamsMock = useParams as jest.Mock;

  beforeEach(() => {
    useParamsMock.mockReturnValue({});
  });

  test('Display no secrets message', async () => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} />);
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
          type: SECRET_TYPE.EnvironmentVariable,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: faker.string.uuid(),
          name: 'Secret_2',
          value: '2',
          description: 'Secret_2 description',
          type: SECRET_TYPE.Password,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} />);
    });

    expect(screen.getByRole('table')).toHaveProperty('rows.length', 3);

    expect(screen.getByTestId('secret-name-0')).toHaveTextContent('Secret_1');
    expect(screen.getByTestId('secret-description-0')).toHaveTextContent('Secret_1 description');
    expect(screen.getByTestId('secret-type-0')).toHaveTextContent('Environment Variable');
    expect(screen.getByTestId('secret-environment-0')).toHaveTextContent(DEFAULT_ENVIRONMENTS[0].name);
    expect(screen.getByTestId('secret-value-0')).toHaveTextContent('••••••••');
    expect(screen.getByTestId('secret-updated-0')).toHaveTextContent('Just now');

    expect(screen.getByTestId('secret-name-1')).toHaveTextContent('Secret_2');
    expect(screen.getByTestId('secret-description-1')).toHaveTextContent('Secret_2 description');
    expect(screen.getByTestId('secret-type-1')).toHaveTextContent('Password');
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
          type: SECRET_TYPE.EnvironmentVariable,
          environmentId: environment.id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} />);
    });
    expect(screen.getByTestId('secret-environment-0')).toHaveTextContent(environment.name);
  });

  test.each(Object.values(SECRET_TYPE))('Map secret type (%s) to human readable name', async (type) => {
    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: faker.string.uuid(),
          name: 'Secret_1',
          value: '1',
          description: 'Secret_1 description',
          type: type,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      const projectInfo = { id: '123', name: 'XYZ' };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} />);
    });
    expect(screen.getByTestId('secret-type-0')).toHaveTextContent(type);
  });

  test('Copy secret value to clipboard', async () => {
    userEvent.setup({ writeToClipboard: true });
    jest.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());

    const projectId = faker.string.uuid();
    const projectName = 'Test Project';
    const secretId = faker.string.uuid();
    const secretValue = '12345';

    const getSecretValueMock = getSecretValue as jest.Mock<Promise<string>, [projectId: string, secretId: string]>;
    getSecretValueMock.mockResolvedValueOnce(secretValue);

    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: secretId,
          name: 'Secret_1',
          value: '[REDACTED]',
          description: 'Secret_1 description',
          type: SECRET_TYPE.EnvironmentVariable,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      render(<SecretList projectInfo={{ id: projectId, name: projectName }} secretsPromise={secretsPromise} />);
    });

    await userEvent.click(screen.getByTestId('copy-secret-0'));

    expect(getSecretValueMock).toHaveBeenCalledTimes(1);
    expect(getSecretValueMock).toHaveBeenCalledWith(projectId, secretId);

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secretValue);
  });

  test('View secret value', async () => {
    const projectId = faker.string.uuid();
    const projectName = 'Test Project';
    const secretId = faker.string.uuid();
    const secretValue = '12345';

    const getSecretValueMock = getSecretValue as jest.Mock<Promise<string>, [projectId: string, secretId: string]>;
    getSecretValueMock.mockResolvedValueOnce(secretValue);

    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: secretId,
          name: 'Secret_1',
          value: '[REDACTED]',
          description: 'Secret_1 description',
          type: SECRET_TYPE.EnvironmentVariable,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      render(<SecretList projectInfo={{ id: projectId, name: projectName }} secretsPromise={secretsPromise} />);
    });

    await userEvent.click(screen.getByTestId('show-secret-0'));

    expect(getSecretValueMock).toHaveBeenCalledTimes(1);
    expect(getSecretValueMock).toHaveBeenCalledWith(projectId, secretId);

    expect(screen.getByTestId('secret-value-0')).toHaveTextContent(secretValue);
  });

  test('View secret does not fetch the secret if Copy is clicked first', async () => {
    userEvent.setup({ writeToClipboard: true });
    jest.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());

    const projectId = faker.string.uuid();
    const projectName = 'Test Project';
    const secretId = faker.string.uuid();
    const secretValue = '12345';

    const getSecretValueMock = getSecretValue as jest.Mock<Promise<string>, [projectId: string, secretId: string]>;
    getSecretValueMock.mockResolvedValueOnce(secretValue);

    await act(async () => {
      const secretsPromise = Promise.resolve<Secret[]>([
        {
          id: secretId,
          name: 'Secret_1',
          value: '[REDACTED]',
          description: 'Secret_1 description',
          type: SECRET_TYPE.EnvironmentVariable,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      render(<SecretList projectInfo={{ id: projectId, name: projectName }} secretsPromise={secretsPromise} />);
    });

    await userEvent.click(screen.getByTestId('copy-secret-0'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secretValue);

    getSecretValueMock.mockClear();
    await userEvent.click(screen.getByTestId('show-secret-0'));
    expect(getSecretValueMock).not.toHaveBeenCalled();
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
          type: SECRET_TYPE.EnvironmentVariable,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: faker.string.uuid(),
          name: 'Secret_2',
          value: '2',
          description: '_1 Secret_2 description',
          type: SECRET_TYPE.Password,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      const projectInfo = { id: faker.string.uuid(), name: faker.lorem.words(2) };
      render(<SecretList projectInfo={projectInfo} secretsPromise={secretsPromise} />);
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
        type: SECRET_TYPE.EnvironmentVariable,
        environmentId: env.id,
        lastUpdated: new Date().toISOString(),
      }));
      const secretsPromise = Promise.resolve(secrets);
      render(
        <SecretList
          projectInfo={{ id: faker.string.uuid(), name: faker.lorem.words(2) }}
          secretsPromise={secretsPromise}
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

  test.each(Object.values(SECRET_TYPE))('Filter secrets by type (%s)', async (type) => {
    await act(async () => {
      const secrets = [
        {
          id: faker.string.uuid(),
          name: faker.lorem.words(2),
          value: '[REDACTED]',
          description: faker.lorem.sentence(5),
          type: type,
          environmentId: DEFAULT_ENVIRONMENTS[0].id,
          lastUpdated: new Date().toISOString(),
        },
      ];
      const secretsPromise = Promise.resolve(secrets);
      render(
        <SecretList
          projectInfo={{ id: faker.string.uuid(), name: faker.lorem.words(2) }}
          secretsPromise={secretsPromise}
        />,
      );
    });

    await userEvent.click(screen.getByRole('combobox', { name: 'Select secret type' }));
    await userEvent.click(screen.getByRole('option', { name: type }));

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByTestId('secret-type-0')).toHaveTextContent(type);
  });
});

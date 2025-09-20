import { faker } from '@faker-js/faker';
import { SecretType } from '@prisma/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { revalidatePath } from 'next/cache';

import EditSecretDialog from '@/app/projects/edit-secret-dialog';
import { DEFAULT_ENVIRONMENTS, type Secret } from '@/lib/definitions';
import { createSecret, updateSecret, updateSecretValue } from '@/lib/store/storage';

jest.mock('@/lib/store/storage');
jest.mock('@/lib/queries');

describe('Create secret dialog', () => {
  test('Create a new secret via dialog', async () => {
    const projectId = faker.string.uuid();

    const onCloseMock = jest.fn();
    render(<EditSecretDialog projectId={projectId} open onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    const secretName = faker.lorem.words(3);
    const secretDescription = faker.lorem.words(5);
    const secretValue = faker.lorem.words(1);

    await userEvent.type(screen.getByRole('textbox', { name: 'Secret name' }), secretName);
    await userEvent.type(screen.getByRole('textbox', { name: 'Description (optional)' }), secretDescription);
    await userEvent.type(screen.getByRole('textbox', { name: 'Secret value' }), secretValue);
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }));

    expect(createSecret).toHaveBeenCalledTimes(1);
    expect(createSecret).toHaveBeenCalledWith(projectId, {
      name: secretName,
      description: secretDescription,
      value: secretValue,
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
    });
    expect(onCloseMock).toHaveBeenCalled();

    // Expect cache to be invalidated for selected project
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
  });

  test('Update secret via dialog', async () => {
    const projectId = faker.string.uuid();
    const secret: Secret = {
      id: faker.string.uuid(),
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(3),
      value: faker.lorem.word(),
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
      updatedAt: new Date(),
      projectId,
    };

    const onCloseMock = jest.fn();
    render(<EditSecretDialog projectId={projectId} open onClose={onCloseMock} secret={secret} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    // Verify initial values are populated
    expect(screen.getByRole('textbox', { name: 'Secret name' })).toHaveValue(secret.name);
    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toHaveValue(secret.description);
    expect(screen.getByRole('switch', { name: 'Update secret value' })).not.toBeChecked();
    expect(screen.queryByRole('textbox', { name: 'Secret value' })).not.toBeInTheDocument();

    // Update the values
    const updatedName = 'Updated secret name';
    const updatedDescription = 'Updated secret description';

    await userEvent.clear(screen.getByRole('textbox', { name: 'Secret name' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Secret name' }), updatedName);
    await userEvent.clear(screen.getByRole('textbox', { name: 'Description (optional)' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Description (optional)' }), updatedDescription);
    await userEvent.click(screen.getByRole('button', { name: 'Update secret' }));

    // Verify updateSecret was called with correct parameters
    expect(updateSecret).toHaveBeenCalledTimes(1);
    expect(updateSecret).toHaveBeenCalledWith({
      id: secret.id,
      name: updatedName,
      description: updatedDescription,
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
    });
    expect(onCloseMock).toHaveBeenCalled();

    // Expect cache to be invalidated for the selected project
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
  });

  test('All secret types are available', async () => {
    const onCloseMock = jest.fn();
    const projectId = faker.string.uuid();

    render(<EditSecretDialog projectId={projectId} open onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    await userEvent.click(screen.getByRole('combobox', { name: 'Secret type' }));
    expect(screen.getAllByRole('option').map((e) => e.textContent)).toEqual([
      'API Key',
      'Connection String',
      'Environment Variable',
      'Password',
      'Token',
      'Other',
    ]);
  });

  test('All environments are available', async () => {
    const onCloseMock = jest.fn();
    const projectId = faker.string.uuid();

    render(<EditSecretDialog projectId={projectId} open onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    await userEvent.click(screen.getByRole('combobox', { name: 'Environment' }));
    expect(
      screen
        .getAllByRole('option')
        .map((e) => e.textContent)
        .sort()
        .join(','),
    ).toEqual(
      Object.values(DEFAULT_ENVIRONMENTS)
        .map((e) => e.name)
        .sort()
        .join(','),
    );
  });

  test('Secret value is explicitly updated', async () => {
    const onCloseMock = jest.fn();
    const projectId = faker.string.uuid();
    const secret: Secret = {
      id: faker.string.uuid(),
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(3),
      value: faker.lorem.word(),
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
      updatedAt: new Date(),
      projectId,
    };

    render(<EditSecretDialog projectId={projectId} secret={secret} open onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    const updatedValue = 'updated-secret-value';
    await userEvent.click(screen.getByRole('switch', { name: 'Update secret value' }));
    expect(screen.getByRole('switch', { name: 'Update secret value' })).toBeChecked();
    await userEvent.clear(screen.getByRole('textbox', { name: 'Secret value' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Secret value' }), updatedValue);
    await userEvent.click(screen.getByRole('button', { name: 'Update secret' }));

    // Verify updateSecret was called with correct parameters
    expect(updateSecret).toHaveBeenCalledTimes(1);
    expect(updateSecret).toHaveBeenCalledWith({
      id: secret.id,
      name: secret.name,
      description: secret.description,
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
    });
    expect(updateSecretValue).toHaveBeenCalledTimes(1);
    expect(updateSecretValue).toHaveBeenCalledWith(secret.id, updatedValue);
    expect(onCloseMock).toHaveBeenCalled();
  });
});

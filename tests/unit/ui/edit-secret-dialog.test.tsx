import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { revalidatePath } from 'next/cache';

import EditSecretDialog from '@/app/(vault)/projects/[id]/edit-secret-dialog';
import { type Secret, SECRET_TYPE } from '@/lib/definitions';
import { createSecret, updateSecret } from '@/lib/store/db';

jest.mock('@/lib/store/db');
jest.mock('@/lib/queries');

describe('Create secret dialog', () => {
  test('Create a new secret via dialog', async () => {
    const projectId = crypto.randomUUID();

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
      type: SECRET_TYPE.EnvironmentVariable,
    });
    expect(onCloseMock).toHaveBeenCalled();

    // Expect cache to be invalidated for selected project
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
  });

  test('Edit secret via dialog', async () => {
    const projectId = crypto.randomUUID();
    const secret: Secret = {
      id: crypto.randomUUID(),
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(3),
      value: faker.lorem.word(),
      type: SECRET_TYPE.EnvironmentVariable,
    };

    const onCloseMock = jest.fn();
    render(<EditSecretDialog projectId={projectId} open onClose={onCloseMock} secret={secret} />);
    expect(screen.getByRole('dialog')).toBeVisible();

    // Verify initial values are populated
    expect(screen.getByRole('textbox', { name: 'Secret name' })).toHaveValue(secret.name);
    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toHaveValue(secret.description);
    expect(screen.getByRole('textbox', { name: 'Secret value' })).toHaveValue(secret.value);

    // Update the values
    const updatedName = 'Updated secret name';
    const updatedDescription = 'Updated secret description';
    const updatedValue = 'updated-secret-value';

    await userEvent.clear(screen.getByRole('textbox', { name: 'Secret name' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Secret name' }), updatedName);
    await userEvent.clear(screen.getByRole('textbox', { name: 'Description (optional)' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Description (optional)' }), updatedDescription);
    await userEvent.clear(screen.getByRole('textbox', { name: 'Secret value' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Secret value' }), updatedValue);

    await userEvent.click(screen.getByRole('button', { name: 'Update secret' }));

    // Verify updateSecret was called with correct parameters
    expect(updateSecret).toHaveBeenCalledTimes(1);
    expect(updateSecret).toHaveBeenCalledWith(projectId, {
      id: secret.id,
      name: updatedName,
      description: updatedDescription,
      value: updatedValue,
      type: SECRET_TYPE.EnvironmentVariable,
    });
    expect(onCloseMock).toHaveBeenCalled();

    // Expect cache to be invalidated for selected project
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
  });
});

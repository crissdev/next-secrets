import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { revalidatePath } from 'next/cache';

import DeleteSecretDialog from '@/app/(vault)/projects/delete-secret-dialog';

jest.mock('@/lib/store/db');
import { faker } from '@faker-js/faker';

import { deleteSecret } from '@/lib/store/db';

describe('Delete secret dialog', () => {
  const deleteSecretMock = deleteSecret as jest.Mock<ReturnType<typeof deleteSecret>, Parameters<typeof deleteSecret>>;

  test('Delete a secret via dialog', async () => {
    const projectId = crypto.randomUUID();
    const secretId = crypto.randomUUID();
    const secretName = faker.lorem.slug(3);
    const onCloseMock = jest.fn();

    render(
      <DeleteSecretDialog
        projectId={projectId}
        secretId={secretId}
        secretName={secretName}
        open
        onClose={onCloseMock}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Delete secret' })).toBeVisible();
    expect(screen.getByTestId('warning-message')).toHaveTextContent(
      `Are you sure you want to delete "${secretName}"? This action cannot be undone.`,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete secret' }));

    expect(deleteSecretMock).toHaveBeenCalledTimes(1);
    expect(deleteSecretMock).toHaveBeenCalledWith(projectId, secretId);
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

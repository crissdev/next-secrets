import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { revalidatePath } from 'next/cache';

import DeleteSecretDialog from '@/app/projects/delete-secret-dialog';
import { deleteSecret } from '@/lib/store/storage';

jest.mock('@/lib/store/storage');

describe('Delete secret dialog', () => {
  const deleteSecretMock = deleteSecret as jest.Mock<ReturnType<typeof deleteSecret>, Parameters<typeof deleteSecret>>;

  test('Delete a secret via dialog', async () => {
    const projectId = faker.string.uuid();
    const secretId = faker.string.uuid();
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
    expect(deleteSecretMock).toHaveBeenCalledWith(secretId);
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

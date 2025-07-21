import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateSecretDialog from '@/app/(vault)/projects/[id]/create-secret-dialog';
import { revalidateProjects } from '@/lib/queries';
import { createSecret } from '@/lib/store/db';

import { useRouterMockFactory } from '../factories';

jest.mock('@/lib/store/db');
jest.mock('@/lib/queries');

describe('Create secret dialog', () => {
  test('Create a new secret via dialog', async () => {
    const projectId = crypto.randomUUID();
    const { refreshMock } = useRouterMockFactory();

    const onCloseMock = jest.fn();
    render(<CreateSecretDialog projectId={projectId} open onClose={onCloseMock} />);
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
    });
    expect(onCloseMock).toHaveBeenCalled();

    // Expect page to refresh
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(refreshMock).toHaveBeenCalledWith();

    // Expect cache to be invalidated for selected project
    expect(revalidateProjects).toHaveBeenCalledTimes(1);
  });
});

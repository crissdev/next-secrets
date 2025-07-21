import { act, render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';

import SecretList from '@/app/(vault)/projects/[id]/secret-list';

describe('Secret list', () => {
  const useParamsMock = useParams as jest.Mock;

  beforeEach(() => {
    useParamsMock.mockResolvedValueOnce({});
  });

  test('Display no secrets message', async () => {
    await act(async () => {
      const secretsPromise = Promise.resolve([]);
      render(<SecretList projectName={'XYZ'} secretsPromise={secretsPromise} />);
    });
    expect(screen.getByTestId('no-secrets-message')).toHaveTextContent('No secrets yet');
    expect(screen.getByTestId('no-secrets-hint')).toHaveTextContent(`Add your first secret to the "XYZ" project.`);
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled();
  });
});

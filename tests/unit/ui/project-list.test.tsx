import { act, render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';

import ProjectList from '@/app/(vault)/project-list';

describe('Project list', () => {
  const useParamsMock = useParams as jest.Mock;

  test('Display empty vault message', async () => {
    useParamsMock.mockResolvedValueOnce({});

    await act(async () => {
      const projectsPromise = Promise.resolve([]);
      render(<ProjectList projects={projectsPromise} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-empty-vault-message')).toHaveTextContent(
        'No projects found. Create a new project to get started.',
      );
    });
  });
});

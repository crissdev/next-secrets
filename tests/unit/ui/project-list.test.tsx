import { act, render, screen, waitFor } from '@testing-library/react';

import ProjectList from '@/app/(vault)/project-list';

describe('Project list', () => {
  test('Display empty vault message', async () => {
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

import { render } from '@testing-library/react';

import ProjectList from '@/app/(vault)/project-list';

describe('Project list', () => {
  // todo: Refactor to a unit test
  test('Display empty vault message', async () => {
    const { getByTestId } = render(<ProjectList projects={Promise.resolve([])} />);
    expect(getByTestId('empty-vault-message')).toHaveTextContent('No Projects Yet');
    expect(getByTestId('empty-vault-hint')).toHaveTextContent(
      'Create your first project to start managing your secrets securely.',
    );
  });
});

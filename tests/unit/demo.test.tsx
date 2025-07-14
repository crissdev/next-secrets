import { render } from '@testing-library/react';

describe('Demo tests', () => {
  test('should pass a simple test', () => {
    const { getByRole } = render(<h1>Hello</h1>);
    expect(getByRole('heading')).toHaveTextContent('Hello');
  });
});

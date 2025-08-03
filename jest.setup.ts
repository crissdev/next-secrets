import '@testing-library/jest-dom';

import { initStore, teardownStore } from './tests/unit/setup';

// Always mock next/cache
jest.mock('next/cache');
jest.mock('next/navigation');

beforeAll(async () => await initStore());
afterAll(async () => await teardownStore());

beforeEach(async () => {
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();

  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

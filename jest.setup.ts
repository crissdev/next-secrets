import '@testing-library/jest-dom';

import { initStore, teardownStore } from './tests/unit/setup';

beforeAll(async () => {
  await initStore();
});

afterAll(async () => {
  await teardownStore();
});

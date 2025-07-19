import '@testing-library/jest-dom';

import { initStore, teardownStore } from './tests/unit/setup';

// Always mock next/cache
jest.mock('next/cache');

beforeAll(async () => await initStore());
afterAll(async () => await teardownStore());

import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

const env = process.env as Record<string, string | undefined>;
env.DATABASE_PROVIDER ??= 'postgresql';
env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/postgres';

vi.mock('server-only', () => ({}));
vi.mock('next/cache');
vi.mock('next/navigation');
vi.mock('@/lib/session', () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: 'test-user-id', email: 'test@example.com' } }),
  requireSession: vi.fn().mockResolvedValue({ user: { id: 'test-user-id', email: 'test@example.com' } }),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture =
    vi.fn() as unknown as typeof window.HTMLElement.prototype.hasPointerCapture;
  window.HTMLElement.prototype.scrollIntoView =
    vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollIntoView;

  global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

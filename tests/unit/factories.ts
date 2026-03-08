import { useRouter } from 'next/navigation';
import { vi } from 'vitest';

export function useRouterMockFactory() {
  const useRouterMock = vi.mocked(useRouter);
  const pushMock = vi.fn();
  const refreshMock = vi.fn();
  const backMock = vi.fn();
  const forwardMock = vi.fn();
  const replaceMock = vi.fn();
  const prefetchMock = vi.fn();

  useRouterMock.mockReturnValue({
    push: pushMock,
    refresh: refreshMock,
    back: backMock,
    forward: forwardMock,
    replace: replaceMock,
    prefetch: prefetchMock,
  });

  return {
    pushMock,
    refreshMock,
    backMock,
    forwardMock,
    replaceMock,
    prefetchMock,
  };
}

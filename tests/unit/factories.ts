import { useRouter } from 'next/navigation';

export function useRouterMockFactory() {
  const useRouterMock = useRouter as jest.Mock<ReturnType<typeof useRouter>, Parameters<typeof useRouter>>;
  const pushMock = jest.fn();
  const refreshMock = jest.fn();
  const backMock = jest.fn();
  const forwardMock = jest.fn();
  const replaceMock = jest.fn();
  const prefetchMock = jest.fn();

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

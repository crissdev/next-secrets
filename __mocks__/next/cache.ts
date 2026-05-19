import { vi } from 'vitest';

export const unstable_cache = vi.fn((f) => f);
export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();
export const updateTag = vi.fn();
export const refresh = vi.fn();
export const unstable_noStore = vi.fn();
export const cacheTag = vi.fn();
export const cacheLife = vi.fn();

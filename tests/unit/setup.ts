import fs from 'node:fs/promises';
import path from 'node:path';

import { dataFilePath } from '@/lib/store/db';

export async function initStore() {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
}

export async function teardownStore() {
  try {
    await fs.unlink(dataFilePath);
  } catch {}
}

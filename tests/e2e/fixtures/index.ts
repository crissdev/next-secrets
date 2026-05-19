import { faker } from '@faker-js/faker';
import { expect, type Page, test as base, type TestInfo } from '@playwright/test';

import type { createProject } from '@/lib/services/projects.service';

class ProjectsPage {
  constructor(public readonly page: Page) {}

  public async createProjectViaModal(data?: Partial<Parameters<typeof createProject>[0]>) {
    const projectName = data?.name ?? faker.lorem.word();
    const projectDescription = data?.description ?? faker.lorem.words(3);
    const previousUrl = this.page.url();

    await this.page.getByTestId('sidebar-create-project-button').click();
    await expect(this.page.getByRole('dialog', { name: 'Create new project' })).toBeVisible();

    await this.page.getByRole('textbox', { name: 'Project name' }).fill(projectName);
    await this.page.getByRole('textbox', { name: 'Description' }).fill(projectDescription);
    await this.page.getByRole('button', { name: 'Create project' }).click();

    // Verify the project was created
    await expect(this.page.getByRole('dialog', { name: 'Create new project' })).not.toBeVisible();

    // The page navigates to Project page for the newly created project
    await expect(this.page).toHaveURL((url) => {
      return url.href !== previousUrl && /\/projects\/[a-f0-9-]{36}/i.test(url.pathname);
    });
    await expect(this.page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();

    // The new project is displayed in the sidebar
    await expect(this.page.getByTestId('sidebar-project-item').filter({ hasText: projectName })).toBeVisible();
  }
}

async function createAuthenticatedSession(page: Page, testInfo: TestInfo) {
  const baseURL = String(testInfo.project.use.baseURL ?? 'http://localhost:3000');
  const email = `e2e-${Date.now()}-${faker.string.alphanumeric(8)}@example.com`.toLowerCase();
  const password = 'Password123!';

  const response = await page.request.post(new URL('/api/auth/sign-up/email', baseURL).toString(), {
    data: {
      name: 'E2E User',
      email,
      password,
      callbackURL: '/',
    },
  });

  expect(response.ok(), await response.text()).toBe(true);
}

export const test = base.extend<{ projectsPage: ProjectsPage }>({
  page: async ({ page }, run, testInfo) => {
    await createAuthenticatedSession(page, testInfo);
    await run(page);
  },
  projectsPage: async ({ page }, $) => $(new ProjectsPage(page)),
});

export { expect };

import { faker } from '@faker-js/faker';
import { expect, type Page, test as base } from '@playwright/test';

import type { createProject } from '@/lib/services/projects.service';

class ProjectsPage {
  constructor(public readonly page: Page) {}

  public async createProjectViaModal(data?: Partial<Parameters<typeof createProject>[0]>) {
    const projectName = data?.name ?? faker.lorem.word();
    const projectDescription = data?.description ?? faker.lorem.words(3);

    await this.page.getByTestId('sidebar-create-project-button').click();
    await expect(this.page.getByRole('dialog', { name: 'Create new project' })).toBeVisible();

    await this.page.getByRole('textbox', { name: 'Project name' }).fill(projectName);
    await this.page.getByRole('textbox', { name: 'Description' }).fill(projectDescription);
    await this.page.getByRole('button', { name: 'Create project' }).click();

    // Verify the project was created
    await expect(this.page.getByRole('dialog', { name: 'Create new project' })).not.toBeVisible();
    await expect(this.page.getByTestId('sidebar-project-item').filter({ hasText: projectName })).toBeVisible();

    // The page navigates to Project page for the newly created project
    await expect(this.page).toHaveURL(/\/projects\/[a-f0-9-]{36}/i);
  }
}

export const test = base.extend<{ projectsPage: ProjectsPage }>({
  projectsPage: async ({ page }, $) => $(new ProjectsPage(page)),
});

export { expect };

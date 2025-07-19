import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('Display application title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Next Secrets');
    await expect(page.getByTestId('app-title')).toHaveText('Next Secrets');
  });

  test('Create new project via modal', async ({ page }) => {
    await page.goto('/');

    const projectName = faker.lorem.word();
    const projectDescription = faker.lorem.words(3);

    await page.getByTestId('sidebar-create-project-button').click();
    await expect(page.getByRole('dialog', { name: 'Create new project' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Project name' }).fill(projectName);
    await page.getByRole('textbox', { name: 'Description' }).fill(projectDescription);
    await page.getByRole('button', { name: 'Create project' }).click();

    // Verify the project was created
    await expect(page.getByTestId('sidebar-project-item').filter({ hasText: projectName })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Create new project' })).not.toBeVisible();
  });
});

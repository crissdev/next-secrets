import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('Display application title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Next Secrets');
    await expect(page.getByTestId('app-title')).toHaveText('Next Secrets');
  });

  test('Display empty vault message', async ({ page }) => {
    await page.goto('/');

    // Check sidebar
    await expect(page.getByTestId('sidebar-empty-vault-message')).toHaveText(
      'No projects found. Create a new project to get started.',
    );

    // Check page
    await expect(page.getByTestId('empty-vault-message')).toHaveText('No Projects Yet');
    await expect(page.getByTestId('empty-vault-hint')).toHaveText(
      'Create your first project to start managing your secrets securely.',
    );
  });
});

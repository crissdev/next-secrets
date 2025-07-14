import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('should show application title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Next Secrets');
    await expect(page.getByTestId('app-title')).toHaveText('Next Secrets');
  });
});

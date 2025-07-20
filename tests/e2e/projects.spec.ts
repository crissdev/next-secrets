import { faker } from '@faker-js/faker';

import { expect, test } from './fixtures';

test.describe('Home page', () => {
  test('Display application title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Next Secrets');
    await expect(page.getByTestId('app-title')).toHaveText('Next Secrets');
  });

  test('Navigate to project page via sidebar link', async ({ page, projectsPage }) => {
    await page.goto('/');

    let projectName = faker.lorem.words(2);
    await projectsPage.createProjectViaModal({ name: projectName });

    projectName = faker.lorem.words(2);
    await projectsPage.createProjectViaModal({ name: projectName });

    await expect(page.getByTestId('selected-project-title')).toHaveText(projectName);
  });

  test('Display list of secrets for the selected project', async ({ page, projectsPage }) => {
    await page.goto('/');

    const projectName = faker.lorem.words(2);
    await projectsPage.createProjectViaModal({ name: projectName });

    await expect(page.getByTestId('project-secrets-count')).toHaveText('0 secrets');
  });
});

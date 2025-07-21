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

    let projectName = faker.lorem.words(3);
    await projectsPage.createProjectViaModal({ name: projectName });

    projectName = faker.lorem.words(3);
    await projectsPage.createProjectViaModal({ name: projectName });

    await expect(page.getByTestId('selected-project-title')).toHaveText(projectName);
  });

  test('Display list of secrets for the selected project', async ({ page, projectsPage }) => {
    await page.goto('/');

    const projectName = faker.lorem.words(3);
    await projectsPage.createProjectViaModal({ name: projectName });

    await expect(page.getByTestId('project-secrets-count')).toHaveText('0 secrets');
  });

  test('Create secret for new project', async ({ page, projectsPage }) => {
    await page.goto('/');
    await projectsPage.createProjectViaModal();

    await page.getByTestId('empty-list-add-secret').click();
    await expect(page.getByRole('dialog', { name: 'Add new secret' })).toBeVisible();

    const secretName = faker.lorem.words(3);
    const secretDescription = faker.lorem.words(5);
    const secretValue = faker.lorem.words(1);

    await page.getByRole('textbox', { name: 'Secret name' }).fill(secretName);
    await page.getByRole('textbox', { name: 'Description' }).fill(secretDescription);
    await page.getByRole('textbox', { name: 'Secret value' }).fill(secretValue);
    await page.getByRole('button', { name: 'Add secret' }).click();

    await expect(page.getByTestId('secret-name-0')).toHaveText(secretName);
    await expect(page.getByTestId('secret-description-0')).toHaveText(secretDescription);

    await expect(page.getByTestId('project-secrets-count')).toHaveText('1 secret');
    await expect(page.getByTestId('no-secrets-message')).not.toBeAttached();
    await expect(page.getByTestId('no-secrets-hint')).not.toBeAttached();
  });
});

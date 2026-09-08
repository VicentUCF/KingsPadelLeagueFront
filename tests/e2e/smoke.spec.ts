import { expect, test } from '@playwright/test';

test('home page starts up and renders the main landmark', async ({ page }) => {
	const response = await page.goto('/');

	expect(response?.ok()).toBe(true);
	await expect(page).toHaveTitle('Kings Padel League: resultados, clasificación y calendario');
	await expect(page.locator('#main-content')).toBeVisible();
});

test('standings page loads via primary navigation', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Clasificación' }).first().click();

	await expect(page).toHaveURL(/\/clasificacion\/?$/);
	await expect(page.locator('#main-content')).toBeVisible();
});

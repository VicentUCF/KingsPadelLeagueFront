import { expect, test } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';

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

test('scheduled matchday shows its lineup and exports an Instagram Story', async ({ page }) => {
	await page.goto('/jornadas/jornada-3');

	await expect(page.getByText('Jornada programada')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Iris Rojo' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Alex Rey' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Nora Vega' })).toBeVisible();
	await expect(page.getByText('Parejas por confirmar')).toHaveCount(0);
	await expect(page.getByText('Pendiente')).toHaveCount(0);
	await expect(page.locator('.match-card__pair-score').first()).toHaveText('VS');
	await expect(page.getByText('“Roar”')).toHaveCount(0);

	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Descargar Story' }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('kpl-jornada-3-instagram-story.png');
	const path = await download.path();
	expect(path).not.toBeNull();
	if (path) {
		expect((await stat(path)).size).toBeGreaterThan(10_000);
		const png = await readFile(path);
		expect(png.readUInt32BE(16)).toBe(1080);
		expect(png.readUInt32BE(20)).toBe(1920);
	}
	await expect(page.getByRole('status')).toContainText('Imagen descargada');
});

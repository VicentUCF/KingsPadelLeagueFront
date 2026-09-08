import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: 'html',
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	// Runs against the fixture API (tests/fixtures/kpl-api-server.mjs) via the
	// same dev:fixture entrypoint test:ssg uses, so E2E doesn't depend on the
	// real KPL backend or its credentials.
	webServer: {
		command: `node tests/dev-with-fixture.mjs --host 127.0.0.1 --port ${PORT}`,
		url: `http://127.0.0.1:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});

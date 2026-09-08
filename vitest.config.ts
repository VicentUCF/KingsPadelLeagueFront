import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			// Only src/lib is unit-testable today (pure functions). Pages and
			// .astro components need Playwright/browser-level checks instead of
			// component-level coverage — see docs/quality.md.
			include: ['src/lib/**/*.ts'],
			// A floor slightly below the measured baseline (~60/49/63/60% at the
			// time this was set), not a target — see docs/quality.md for how to
			// raise it. lib/api (http-client.ts, league-repository.ts) is the
			// biggest real gap: it does live network I/O and needs a fetch mock
			// to test meaningfully, which is out of scope here.
			thresholds: {
				statements: 55,
				branches: 45,
				functions: 55,
				lines: 55,
			},
		},
	},
});

/**
 * Architecture rules for src/lib's layers (see README.md "Arquitectura de
 * src/lib"): api (HTTP/parsing) -> domain (business logic) -> the top-level
 * src/lib/*.ts facades that pages/components are meant to consume.
 *
 * Scope note: dependency-cruiser has no .astro extractor (`npx depcruise -i`
 * lists supported extensions; .astro isn't one of them), so it only ever
 * sees the .ts graph inside src/lib. The "UI must go through the src/lib/*.ts
 * facades" boundary is enforced separately in eslint.config.js
 * (no-restricted-imports on src/components, src/layouts, src/pages), since
 * eslint-plugin-astro *does* parse .astro frontmatter.
 */
module.exports = {
	forbidden: [
		{
			name: 'no-circular',
			severity: 'error',
			comment: 'Circular imports make module boundaries and load order hard to reason about.',
			from: {},
			to: { circular: true },
		},
		{
			name: 'no-orphans',
			severity: 'warn',
			comment:
				'A module nothing imports is either dead code (see `npm run knip`) or missing from an entry point.',
			from: {
				orphan: true,
				pathNot: [
					'\\.d\\.ts$',
					'^src/content\\.config\\.ts$',
					// Astro route entry points: invoked by file-based routing, never imported.
					'^src/pages/',
					// Consumed only from .astro frontmatter, invisible to this tool (see file header).
					'^src/lib/news\\.ts$',
					'^src/lib/league-presentation\\.ts$',
					// Browser entry imported by an Astro component's client-side script.
					'^src/scripts/matchday-story\\.ts$',
					'^tests/fixtures/',
					'^tests/dev-with-fixture\\.mjs$',
					'^tests/ssg-build\\.mjs$',
				],
			},
			to: {},
		},
		{
			name: 'no-unresolvable',
			severity: 'error',
			comment: 'An import that cannot be resolved is either a typo or a missing dependency.',
			from: {},
			to: {
				couldNotResolve: true,
				// astro:content/astro:transitions are virtual modules injected by
				// Astro's Vite plugin at build time — they never exist on disk, so
				// no static resolver (including tsc) can resolve them.
				pathNot: ['^astro:'],
			},
		},
		{
			name: 'api-no-domain',
			severity: 'error',
			comment:
				'src/lib/api (HTTP client, parsers, repository) must not depend on src/lib/domain — domain depends on api, not the other way round.',
			from: { path: '^src/lib/api/' },
			to: { path: '^src/lib/domain/' },
		},
	],
	options: {
		doNotFollow: { path: 'node_modules' },
		tsPreCompilationDeps: true,
		tsConfig: { fileName: 'tsconfig.json' },
		enhancedResolveOptions: {
			exportsFields: ['exports'],
			conditionNames: ['import', 'node', 'default', 'types'],
		},
	},
};

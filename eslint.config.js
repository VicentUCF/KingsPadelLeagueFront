import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Rules that flag patterns especially common in careless/AI-generated code:
// unmanaged debug output, disable directives without justification, and
// leftover review markers. Kept in one place so both .ts and .astro share them.
const aiSlopRules = {
	'no-console': ['error', { allow: ['warn', 'error'] }],
	'no-debugger': 'error',
	'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'hack'], location: 'start' }],
	'@eslint-community/eslint-comments/no-unused-disable': 'error',
	'@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
};

// TypeScript rules that don't require type information, so they're safe to
// apply to .astro frontmatter too (where the program is intentionally
// disabled, see below).
const typescriptHardeningRules = {
	'@typescript-eslint/no-explicit-any': 'error',
	'@typescript-eslint/no-unused-vars': [
		'error',
		{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
	],
	'@typescript-eslint/ban-ts-comment': [
		'error',
		{
			'ts-expect-error': 'allow-with-description',
			'ts-ignore': true,
			'ts-nocheck': true,
			'ts-check': false,
			minimumDescriptionLength: 10,
		},
	],
};

// Requires a type-checked program, so it only applies to real .ts modules
// (see the astro block below, which intentionally runs without one).
const typedHardeningRules = {
	// Numbers/booleans in templates are a normal, safe pattern in this
	// codebase (ids, counts, scores); keep the rule for the genuinely risky
	// cases (objects, `any`, nullish values silently stringified).
	'@typescript-eslint/restrict-template-expressions': [
		'error',
		{ allowNumber: true, allowBoolean: true },
	],
};

export default defineConfig(
	{
		ignores: [
			'dist/**',
			'.astro/**',
			'node_modules/**',
			'coverage/**',
			'playwright-report/**',
			'test-results/**',
			'public/admin/**',
			'design/**',
		],
	},

	js.configs.recommended,
	eslintPluginAstro.configs['flat/recommended'],

	// Type-aware TypeScript linting: scoped to real .ts modules only, and
	// explicitly excluding the virtual .ts files eslint-plugin-astro extracts
	// from .astro frontmatter (those run without a project — see the astro
	// block below — so a type-checked program would either conflict with
	// that or silently do nothing).
	{
		files: ['**/*.ts', '**/*.mts', '**/*.cts'],
		ignores: ['**/*.astro/*.ts'],
		extends: [tseslint.configs.strictTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: { ...typescriptHardeningRules, ...typedHardeningRules },
	},

	// Astro frontmatter/scripts: register the TypeScript plugin without
	// touching languageOptions.parser, which eslint-plugin-astro's own config
	// already set to astro-eslint-parser. Extending a typescript-eslint
	// shareable config here would silently overwrite that parser and break
	// parsing of every .astro file.
	{
		files: ['**/*.astro'],
		plugins: { '@typescript-eslint': tseslint.plugin },
		rules: typescriptHardeningRules,
	},

	{
		plugins: {
			'@eslint-community/eslint-comments': eslintComments,
		},
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
		rules: aiSlopRules,
	},

	// Architecture boundary: UI must go through the stable src/lib/*.ts
	// facades, not src/lib/api or src/lib/domain internals. dependency-cruiser
	// enforces the equivalent rule for the .ts graph, but it can't parse
	// .astro frontmatter (see .dependency-cruiser.cjs), so this is the real
	// enforcement point for components/layouts/pages.
	{
		files: ['src/components/**/*.astro', 'src/layouts/**/*.astro', 'src/pages/**/*.{astro,ts}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/lib/api/*', '**/lib/api'],
							message:
								'Import from a src/lib/*.ts facade (e.g. kpl-api.ts) instead of src/lib/api internals.',
						},
						{
							group: ['**/lib/domain/*', '**/lib/domain'],
							message:
								'Import from a src/lib/*.ts facade (e.g. public-league.ts) instead of src/lib/domain internals.',
						},
					],
				},
			],
		},
	},

	// Node-side scripts (test runners, fixtures, config files): allowed to log
	// and don't participate in the typed program the way app/lib code does.
	{
		files: ['tests/**/*.mjs', 'tests/**/*.cjs', '*.config.{js,mjs,cjs,ts}', '.*.{js,mjs,cjs}'],
		languageOptions: { globals: globals.node },
		rules: {
			'no-console': 'off',
		},
	},

	eslintConfigPrettier,
);

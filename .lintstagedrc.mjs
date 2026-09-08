// Pre-commit only: fixes/formats the files actually staged, nothing else.
// Full-project checks (typecheck, knip, architecture, tests) run in
// pre-push/CI instead — see docs/quality.md.
export default {
	'*.{js,mjs,cjs,ts,mts,cts,astro}': ['eslint --fix', 'prettier --write'],
	'src/**/*.css': ['stylelint --fix', 'prettier --write'],
	'*.{json,md,mdx,yml,yaml}': ['prettier --write'],
};

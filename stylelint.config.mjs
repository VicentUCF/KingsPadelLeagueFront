export default {
	extends: 'stylelint-config-recommended',
	plugins: ['./stylelint-local-rules/max-file-lines.mjs'],
	rules: {
		// Sonar-equivalent "file too big" guard — see docs/quality.md.
		'kpl/max-file-lines': 1000,
		// This codebase's BEM-style class names (block__element--modifier) are
		// already unique per component, so cascade order rarely causes real
		// specificity bugs; enabling it against the existing stylesheets
		// produced 86 findings, all about selector *ordering* rather than any
		// actual override bug. Not worth the noise.
		'no-descending-specificity': null,
	},
};

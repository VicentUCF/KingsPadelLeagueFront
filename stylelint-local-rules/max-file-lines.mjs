import stylelint from 'stylelint';

// Sonar's "Files should not have too many lines" (S104) has no equivalent in
// stylelint core — this is the same check, scoped to CSS, since large CSS
// files are exactly the case that surfaced the gap (see docs/quality.md).
const ruleName = 'kpl/max-file-lines';

const messages = stylelint.utils.ruleMessages(ruleName, {
	rejected: (count, max) =>
		`File has ${count} lines, exceeding the maximum of ${max}. Split it into smaller, focused stylesheets.`,
});

const meta = {
	url: 'https://github.com/VicentUCF/KingsPadelLeagueAstro/blob/main/docs/quality.md',
};

/** @type {import('stylelint').Rule} */
const ruleFunction = (primary) => (root, result) => {
	const validOptions = stylelint.utils.validateOptions(result, ruleName, {
		actual: primary,
		possible: (value) => typeof value === 'number' && value > 0,
	});

	if (!validOptions) return;

	const source = root.source?.input.css ?? '';
	const lineCount = source.split('\n').length;

	if (lineCount > primary) {
		stylelint.utils.report({
			message: messages.rejected(lineCount, primary),
			node: root,
			result,
			ruleName,
		});
	}
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default stylelint.createPlugin(ruleName, ruleFunction);

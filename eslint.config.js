// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticJs from '@stylistic/eslint-plugin-js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{ignores: ['dist']},
	{languageOptions: {globals: globals.browser}},
	{
		plugins: {
			'@stylistic/js': stylisticJs,
			'jsdoc': jsdoc,
		},
		rules: {
			'no-duplicate-imports': 'error',
			'no-console': ['error', {allow: ['error']}],
			'@stylistic/js/linebreak-style': ['error', 'unix'],
			'@stylistic/js/brace-style': ['error', '1tbs'],
			'@stylistic/js/indent': ['error', 'tab', {'SwitchCase': 1}],
			'@stylistic/js/no-trailing-spaces': 'error',
			'@stylistic/js/no-multi-spaces': ['error', {'ignoreEOLComments': true}],
			'@stylistic/js/no-tabs': ['error', {allowIndentationTabs: true}],
			'@stylistic/js/no-multiple-empty-lines': ['error', {max: 2, maxBOF: 1, maxEOF: 1}],
			'@stylistic/js/no-whitespace-before-property': 'error',
			'@stylistic/js/keyword-spacing': ['error', {'before': true, after: true}],
			'@stylistic/js/switch-colon-spacing': ['error', {'before': false, 'after': true}],
			'@stylistic/js/space-infix-ops': 'error',
			'@stylistic/js/key-spacing': ['error', {'beforeColon': false, 'afterColon': true}],
			'@stylistic/js/block-spacing': 'error',
			'@stylistic/js/space-before-function-paren': ['error', 'never'],
			'@stylistic/js/space-unary-ops': ['error', {'words': true, 'nonwords': false}],
			'@stylistic/js/space-before-blocks': 'error',
			'@stylistic/js/function-call-spacing': ['error', 'never'],
			'@stylistic/js/array-bracket-spacing': ['error', 'never'],
			'@stylistic/js/object-curly-spacing': ['error', 'never'],
			'@stylistic/js/space-in-parens': ['error', 'never'],
			'@stylistic/js/comma-spacing': ['error', {'before': false, 'after': true}],
			'@stylistic/js/arrow-spacing': ['error', {'before': true, 'after': true}],
			'@stylistic/js/rest-spread-spacing': ['error', 'never'],
			'@stylistic/js/semi': ['error', 'always'],
			'@stylistic/js/quotes': ['error', 'single', {'avoidEscape': true}],
			...jsdoc.configs['flat/recommended'].rules,
			'jsdoc/check-indentation': 'error',
			//'jsdoc/check-line-alignment': ['error', 'always'],
			'jsdoc/check-template-names': 'error',
			'jsdoc/informative-docs': 'error',
			'jsdoc/lines-before-block': 'error',
			'jsdoc/no-blank-blocks': 'warn',
			'jsdoc/require-asterisk-prefix': 'error',
			'jsdoc/require-jsdoc': 'off',
			'jsdoc/require-throws': 'error',
			//"jsdoc/require-description": "warn",
			'jsdoc/require-hyphen-before-param-description': 'warn',
			'jsdoc/require-property-description': 'off',
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-returns-description': 'off',
			'jsdoc/require-returns-type': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/tag-lines': ['error' | 'warn', 'any', {'startLines': 1}]
		}
	},
);

module.exports = {
	root: true,
	env: {
		node: true,
	},

	plugins: [
		'@typescript-eslint'
	],

	extends: [
		'plugin:@typescript-eslint/recommended',
	],

	rules: {
		'class-methods-use-this': 0,
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		indent: 'off',
		'max-len': 0,
		'no-tabs': 0,
		'import/prefer-default-export': 0,
		'spaced-comment': [
			'error',
			'always',
			{
				markers: ['/']
			}
		],
		'comma-dangle': 0,
		'no-plusplus': 0,
		'prefer-destructuring': 0,
		'@typescript-eslint/indent': [
			'error',
			'tab'
		],
		camelcase: 'off',
		'@typescript-eslint/camelcase': [
			'error',
			{
				properties: 'always',
				allow: [
					'^(S|M)[0-9]+_',
				],
			}
		],
		'@typescript-eslint/explicit-member-accessibility': 2,
		'@typescript-eslint/explicit-function-return-type': 2,
		'@typescript-eslint/no-explicit-any': 0,
		'no-unused-vars': 0,
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				args: 'after-used'
			}
		],
		// @typescript-eslint/semi should be used instead as soon as it has been released in 1.8.0
		semi: 'off',
	},
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
	},
};
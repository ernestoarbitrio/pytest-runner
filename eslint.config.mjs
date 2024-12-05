import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        ignores: ['**/out', '**/dist', '**/*.d.ts'],
    },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 6,
            sourceType: 'module',
        },

        rules: {
            '@typescript-eslint/naming-convention': 'warn',
            curly: 'warn',
            eqeqeq: 'warn',
            'no-throw-literal': 'warn',
            'no-unused-vars': 'error',
            semi: ['warn', 'always'],
        },
    },
];

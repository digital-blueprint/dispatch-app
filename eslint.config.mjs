import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: ['dist/', 'vendor/', '*.cjs', 'src/micromodal.es.js'],
    },
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    {
        plugins: {
            jsdoc: jsdoc,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.es2020,
                ...globals.mocha,
            },
        },
        rules: {
            'no-unused-vars': ['error', {args: 'none'}],
            semi: [2, 'always'],
            'jsdoc/require-jsdoc': 0,
            'jsdoc/require-param-description': 0,
            'jsdoc/require-returns': 0,
            'jsdoc/require-param-type': 0,
            'jsdoc/require-returns-description': 0,
            'jsdoc/tag-lines': 0,
        },
    },
];

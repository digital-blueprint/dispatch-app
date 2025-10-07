import {defineConfig} from 'i18next-cli';

export default defineConfig({
    locales: ['en', 'de'],
    extract: {
        input: ['src/**/*.js'],
        output: 'src/i18n/{{language}}/{{namespace}}.json',
        defaultNS: 'translation',
        functions: ['t', '*.t'],
        indentation: 4,
    },
});

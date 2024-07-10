export default {
    createOldCatalogs: false,
    indentation: 4,
    keepRemoved: false,
    locales: ['en', 'de'],
    output: 'src/i18n/$LOCALE/$NAMESPACE.json',
    input: ['src/**/*.js'],
    sort: true,
    i18nextOptions: {compatibilityJSON: 'v4'},
};

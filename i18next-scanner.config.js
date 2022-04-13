module.exports = {
    input: ['src/**/*.js'],
    output: './',
    options: {
        debug: false,
        sort: true,
        removeUnusedKeys: true,
        lngs: ['en', 'de'],
        func: {
            list: ['i18n.t', '_i18n.t'],
        },
        resource: {
            loadPath: 'src/i18n/{{lng}}/{{ns}}.json',
            savePath: 'src/i18n/{{lng}}/{{ns}}.json',
            jsonIndent: 4,
        },
    },
};

module.exports = {
    input: [
        'src/**/*.js',
    ],
    output: './',
    options: {
        debug: false,
        removeUnusedKeys: true,
        lngs: ['en','de'],
        func: {
            list: ['i18n.t', 'i18nKey']
        },
        resource: {
            loadPath: 'src/i18n/{{lng}}/{{ns}}.json',
            savePath: 'src/i18n/{{lng}}/{{ns}}.json'
        },
    },
}

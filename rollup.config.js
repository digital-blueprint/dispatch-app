import path from 'path';
import url from 'url';
import glob from 'glob';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import {terser} from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import urlPlugin from '@rollup/plugin-url';
import license from 'rollup-plugin-license';
import del from 'rollup-plugin-delete';
import emitEJS from 'rollup-plugin-emit-ejs';
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import appConfig from './app.config.js';
import {
    getPackagePath,
    getBuildInfo,
    generateTLSConfig,
    getDistPath,
} from './vendor/toolkit/rollup.utils.js';

const pkg = require('./package.json');
const appEnv = typeof process.env.APP_ENV !== 'undefined' ? process.env.APP_ENV : 'local';
const watch = process.env.ROLLUP_WATCH === 'true';
const buildFull = (!watch && appEnv !== 'test') || process.env.FORCE_FULL !== undefined;
let useTerser = buildFull;
let useBabel = buildFull;
let checkLicenses = buildFull;
let useHTTPS = false;

console.log('APP_ENV: ' + appEnv);

let config;
if (appEnv in appConfig) {
    config = appConfig[appEnv];
} else if (appEnv === 'test') {
    config = {
        basePath: '/',
        entryPointURL: 'https://test',
        keyCloakBaseURL: 'https://test',
        keyCloakClientId: '',
        keyCloakRealm: '',
        matomoUrl: '',
        matomoSiteId: -1,
        nextcloudBaseURL: 'https://test',
        nextcloudName: '',
        pdfAsQualifiedlySigningServer: 'https://test',
        hiddenActivities: [],
    };
} else {
    console.error(`Unknown build environment: '${appEnv}', use one of '${Object.keys(appConfig)}'`);
    process.exit(1);
}

if (config.nextcloudBaseURL) {
    config.nextcloudFileURL = config.nextcloudBaseURL + '/index.php/apps/files/?dir=';
    config.nextcloudWebAppPasswordURL = config.nextcloudBaseURL + '/index.php/apps/webapppassword';
    config.nextcloudWebDavURL = config.nextcloudBaseURL + '/remote.php/dav/files';
} else {
    config.nextcloudFileURL = '';
    config.nextcloudWebAppPasswordURL = '';
    config.nextcloudWebDavURL = '';
}

if (watch) {
    config.basePath = '/dist/';
}

function getOrigin(url) {
    if (url) return new URL(url).origin;
    return '';
}

config.CSP = `default-src 'self' 'unsafe-eval' 'unsafe-inline' \
${getOrigin(config.matomoUrl)} ${getOrigin(config.keyCloakBaseURL)} ${getOrigin(
    config.entryPointURL
)} \
httpbin.org ${getOrigin(config.nextcloudBaseURL)} www.handy-signatur.at \
${getOrigin(config.pdfAsQualifiedlySigningServer)}; \
img-src * blob: data:`;

export default (async () => {
    let privatePath = await getDistPath(pkg.name);
    return {
        input:
            appEnv != 'test'
                ? [
                      'src/' + pkg.internalName + '.js',
                      'src/dbp-show-requests.js',
                      'src/dbp-create-request.js',
                      'vendor/signature/src/dbp-qualified-signature-pdf-upload.js',
                      'vendor/signature/src/dbp-official-signature-pdf-upload.js',
                  ]
                : glob.sync('test/**/*.js'),
        output: {
            dir: 'dist',
            entryFileNames: '[name].js',
            chunkFileNames: 'shared/[name].[hash].[format].js',
            format: 'esm',
            sourcemap: true,
        },
        preserveEntrySignatures: false,
        // external: ['zlib', 'http', 'fs', 'https', 'url'],
        onwarn: function (warning, warn) {
            // ignore chai warnings
            if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('/chai/')) {
                return;
            }
            // keycloak bundled code uses eval
            if (warning.code === 'EVAL') {
                return;
            }
            warn(warning);
        },
        plugins: [
            del({
                targets: 'dist/*',
            }),
            emitEJS({
                src: 'assets',
                include: ['**/*.ejs', '**/.*.ejs'],
                data: {
                    getUrl: (p) => {
                        return url.resolve(config.basePath, p);
                    },
                    getPrivateUrl: (p) => {
                        return url.resolve(`${config.basePath}${privatePath}/`, p);
                    },
                    isVisible: (name) => {
                        return !config.hiddenActivities.includes(name);
                    },
                    name: pkg.internalName,
                    entryPointURL: config.entryPointURL,
                    nextcloudWebAppPasswordURL: config.nextcloudWebAppPasswordURL,
                    nextcloudWebDavURL: config.nextcloudWebDavURL,
                    nextcloudBaseURL: config.nextcloudBaseURL,
                    nextcloudFileURL: config.nextcloudFileURL,
                    nextcloudName: config.nextcloudName,
                    keyCloakBaseURL: config.keyCloakBaseURL,
                    keyCloakRealm: config.keyCloakRealm,
                    keyCloakClientId: config.keyCloakClientId,
                    CSP: config.CSP,
                    matomoUrl: config.matomoUrl,
                    matomoSiteId: config.matomoSiteId,
                    buildInfo: getBuildInfo(appEnv),
                },
            }),
            resolve({
                // ignore node_modules from vendored packages
                moduleDirectories: [path.join(process.cwd(), 'node_modules')],
                browser: true,
                preferBuiltins: true,
            }),
            checkLicenses &&
                license({
                    banner: {
                        commentStyle: 'ignored',
                        content: `
License: <%= pkg.license %>
Dependencies:
<% _.forEach(dependencies, function (dependency) { if (dependency.name) { %>
<%= dependency.name %>: <%= dependency.license %><% }}) %>
`,
                    },
                    thirdParty: {
                        allow: {
                            test: '(MIT OR BSD-3-Clause OR Apache-2.0 OR LGPL-2.1-or-later)',
                            failOnUnlicensed: true,
                            failOnViolation: true,
                        },
                    },
                }),
            commonjs({
                include: 'node_modules/**',
            }),
            json(),
            urlPlugin({
                limit: 0,
                include: [await getPackagePath('select2', '**/*.css')],
                emitFiles: true,
                fileName: 'shared/[name].[hash][extname]',
            }),
            copy({
                targets: [
                    {
                        src: 'vendor/signature/assets/*-placeholder.png',
                        dest: 'dist/local/@dbp-topics/signature',
                    },
                    {src: 'assets/*.css', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/*.ico', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/*.metadata.json', dest: 'dist'},
                    {src: 'src/*.metadata.json', dest: 'dist'},
                    {src: 'vendor/signature/src/*.metadata.json', dest: 'dist'},
                    {src: 'assets/*.svg', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/htaccess-shared', dest: 'dist/shared/', rename: '.htaccess'},
                    {src: 'assets/icon-*.png', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/apple-*.png', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/safari-*.svg', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/images/*', dest: 'dist/images'},
                    {src: 'assets/site.webmanifest', dest: 'dist', rename: pkg.internalName + '.webmanifest'},
                    {src: 'assets/silent-check-sso.html', dest: 'dist'},
                    {
                        src: await getPackagePath('pdfjs-dist', 'legacy/build/pdf.worker.js'),
                        dest: 'dist/local/@dbp-topics/signature/pdfjs',
                    },
                    {
                        src: await getPackagePath('pdfjs-dist', 'cmaps/*'),
                        dest: 'dist/local/@dbp-topics/signature/pdfjs',
                    }, // do we want all map files?
                    {
                        src: await getPackagePath('@tugraz/font-source-sans-pro', 'files/*'),
                        dest: 'dist/' + (await getDistPath(pkg.name, 'fonts/source-sans-pro')),
                    },
                    {
                        src: await getPackagePath('@tugraz/web-components', 'src/spinner.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)), rename: 'tug_spinner.js'
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'src/spinner.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)),
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'misc/browser-check.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)),
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'assets/icons/*.svg'),
                        dest: 'dist/' + (await getDistPath('@dbp-toolkit/common', 'icons')),
                    },
                    {
                        src: await getPackagePath('tabulator-tables', 'dist/css'),
                        dest:
                            'dist/' +
                            (await getDistPath('@dbp-toolkit/file-handling', 'tabulator-tables')),
                    },
                ],
            }),
            useBabel &&
                getBabelOutputPlugin({
                    compact: false,
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                loose: true,
                                shippedProposals: true,
                                bugfixes: true,
                                modules: false,
                                targets: {
                                    esmodules: true,
                                },
                            },
                        ],
                    ],
                }),
            useTerser ? terser() : false,
            watch
                ? serve({
                      contentBase: '.',
                      host: '127.0.0.1',
                      port: 8001,
                      historyApiFallback: config.basePath + pkg.internalName + '.html',
                      https: useHTTPS ? await generateTLSConfig() : false,
                      headers: {
                          'Content-Security-Policy': config.CSP,
                      },
                  })
                : false,
        ],
    };
})();

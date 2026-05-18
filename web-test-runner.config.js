import process from 'node:process';
import {playwrightLauncher} from '@web/test-runner-playwright';

import {registry} from 'playwright-core/lib/coreBundle';

async function setup() {
    const browsersToInstall = [];
    if (!process.env.FIREFOX_BIN) {
        browsersToInstall.push('firefox');
    }
    if (!process.env.CHROMIUM_BIN) {
        browsersToInstall.push('chromium');
    }
    if (browsersToInstall.length > 0) {
        await registry.installBrowsersForNpmInstall(browsersToInstall);
    }
    if (!process.env.FIREFOX_BIN) {
        process.env.FIREFOX_BIN = registry.registry.findExecutable('firefox').executablePath();
    }
    if (!process.env.CHROMIUM_BIN) {
        process.env.CHROMIUM_BIN = registry.registry.findExecutable('chromium').executablePath();
    }
}

await setup();

export default {
    files: 'dist/*.js',
    testFramework: {
        config: {
            ui: 'tdd',
            timeout: 2000 * (process.env.CI === undefined ? 1 : 10),
        },
    },
    browsers: [
        playwrightLauncher({
            product: 'firefox',
            launchOptions: {
                executablePath: process.env.FIREFOX_BIN,
                headless: true,
            },
        }),
        playwrightLauncher({
            product: 'chromium',
            launchOptions: {
                executablePath: process.env.CHROMIUM_BIN,
                headless: true,
            },
        }),
    ],
};

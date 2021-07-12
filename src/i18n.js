import {createInstance} from '@dbp-toolkit/common/i18next.js';

import de from './i18n/de/translation.json';
import en from './i18n/en/translation.json';

const i18n = createInstance({en: en, de: de}, 'de', 'en');

export function createI18nInstance () {
    return i18n.cloneInstance();
}
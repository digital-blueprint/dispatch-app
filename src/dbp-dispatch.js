import '@webcomponents/scoped-custom-element-registry';
import {AppShell} from '@dbp-toolkit/app-shell';
import * as commonUtils from '@dbp-toolkit/common/utils';
import {Translated} from '@dbp-toolkit/common/src/translated';

commonUtils.defineCustomElement('dbp-dispatch', AppShell);
commonUtils.defineCustomElement('dbp-translated', Translated);

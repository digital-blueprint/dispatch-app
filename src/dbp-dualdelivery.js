import '@webcomponents/scoped-custom-element-registry';
import {AppShell} from '@dbp-toolkit/app-shell';
import * as commonUtils from '@dbp-toolkit/common/utils';
import {Translated} from "@dbp-toolkit/common/src/translated";
import {TUGrazLogo} from "@dbp-toolkit/app-shell/src/tugraz-logo";

commonUtils.defineCustomElement('dbp-dualdelivery', AppShell);
commonUtils.defineCustomElement('dbp-translated', Translated);
commonUtils.defineCustomElement('dbp-tugraz-logo', TUGrazLogo);

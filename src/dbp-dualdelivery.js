import {AppShell} from '@dbp-toolkit/app-shell';
import * as commonUtils from '@dbp-toolkit/common/utils';
import {Provider} from '@dbp-toolkit/provider';

// It's important that the Provider is created before the AppShell, so the AppShell can subscribe to the Provider
commonUtils.defineCustomElement('dbp-provider', Provider);
commonUtils.defineCustomElement('dbp-dualdelivery', AppShell);

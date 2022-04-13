import {createInstance} from './i18n.js';
import {css, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/styles';

class DdActivity extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
    }

    static get scopedElements() {
        return {};
    }

    static get properties() {
        return {
            ...super.properties,
            lang: {type: String},
        };
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'lang':
                    this._i18n.changeLanguage(this.lang);
                    break;
            }
        });

        super.update(changedProperties);
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getLinkCss()}

            h2:first-child {
                margin-top: 0;
            }

            h2 {
                margin-bottom: 10px;
            }

            .subheadline {
                font-style: italic;
                padding-left: 2em;
                margin-top: -5px;
            }
        `;
    }

    render() {
        const i18n = this._i18n;
        return html`
            <h2>${i18n.t('dd-activity.headline')}</h2>
            <p class="subheadline">${i18n.t('dd-activity.sub-headline')}</p>
            <p>${i18n.t('dd-activity.description-text')}</p>
        `;
    }
}

commonUtils.defineCustomElement('dbp-dd-activity', DdActivity);

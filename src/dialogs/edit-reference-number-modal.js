import {css, html} from 'lit';
import {Icon, Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {createInstance} from '../i18n.js';

export class DispatchEditReferenceNumberModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.referenceNumber = '';
    }

    static get scopedElements() {
        return {
            'dbp-modal': Modal,
            'dbp-icon': Icon,
        };
    }

    static get properties() {
        return {
            lang: {type: String},
            referenceNumber: {type: String},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    open(referenceNumber = this.referenceNumber) {
        this.referenceNumber = referenceNumber || '';
        this.updateComplete.then(() => {
            const input = /** @type {HTMLInputElement} */ (this._('#reference-number-input'));
            if (input) {
                input.value = this.referenceNumber;
            }
            this._('#modal').open();
        });
    }

    close() {
        this._('#modal').close();
    }

    _onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', {bubbles: true, composed: true}));
        this.close();
    }

    _onConfirm() {
        const input = /** @type {HTMLInputElement} */ (this._('#reference-number-input'));
        this.dispatchEvent(
            new CustomEvent('confirm', {
                detail: {referenceNumber: input.value},
                bubbles: true,
                composed: true,
            }),
        );
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getButtonCSS()}

            .content {
                display: flex;
                flex-direction: column;
                gap: 1em;
                padding: 0;
            }

            .content .input {
                box-sizing: border-box;
                width: 100%;
            }

            .footer-menu {
                display: flex;
                justify-content: space-between;
                gap: 5px;
                margin: 1em 0 0 0;
                padding: 0;
            }
        `;
    }

    render() {
        const i18n = this._i18n;

        return html`
            <dbp-modal
                id="modal"
                modal-id="edit-reference-number-modal"
                title="${i18n.t('show-requests.reference-number-dialog-title')}"
                style="
                    --dbp-modal-min-width: 320px;
                    --dbp-modal-max-width: 500px;
                    --dbp-modal-min-height: 185px;
                    --dbp-modal-content-overflow-y: unset;
                "
                lang="${this.lang}">
                <div slot="content" class="content">
                    <input
                        type="text"
                        class="input"
                        id="reference-number-input"
                        .value=${this.referenceNumber} />
                </div>
                <menu slot="footer" class="footer-menu">
                    <button
                        class="button"
                        aria-label="Close this dialog window"
                        @click="${this._onCancel}">
                        <dbp-icon name="close" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                    </button>
                    <button class="button select-button is-primary" @click="${this._onConfirm}">
                        <dbp-icon name="checkmark" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.edit-reference-number-dialog-button-ok')}
                    </button>
                </menu>
            </dbp-modal>
        `;
    }
}

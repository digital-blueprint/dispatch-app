import {css, html} from 'lit';
import {Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {createInstance} from '../i18n.js';

export class DispatchEditSubjectModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.subject = '';
    }

    static get scopedElements() {
        return {
            'dbp-modal': Modal,
        };
    }

    static get properties() {
        return {
            lang: {type: String},
            subject: {type: String},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    open(subject = this.subject) {
        this.subject = subject || this._i18n.t('create-request.default-subject');
        this.updateComplete.then(() => {
            const input = /** @type {HTMLInputElement} */ (this._('#subject-input'));
            if (input) {
                input.value = this.subject;
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
        const input = /** @type {HTMLInputElement} */ (this._('#subject-input'));
        const subject = input.value || this._i18n.t('create-request.default-subject');
        this.dispatchEvent(
            new CustomEvent('confirm', {
                detail: {subject},
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

            /*
             * Mirror the original MicroModal modal-content layout:
             * - column layout with normal flow
             * - inputs are full width, gap: 1em
             */
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

            /*
             * Mirror the original modal-footer-btn:
             * - cancel button on the left, confirm button on the right
             * - vertical distance to the input above
             */
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
                modal-id="edit-subject-modal"
                title="${i18n.t('show-requests.edit-subject-modal-title')}"
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
                        id="subject-input"
                        .value=${this.subject || i18n.t('create-request.default-subject')} />
                </div>
                <menu slot="footer" class="footer-menu">
                    <button
                        class="button"
                        aria-label="Close this dialog window"
                        @click="${this._onCancel}">
                        ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                    </button>
                    <button class="button select-button is-primary" @click="${this._onConfirm}">
                        ${i18n.t('show-requests.edit-subject-dialog-button-ok')}
                    </button>
                </menu>
            </dbp-modal>
        `;
    }
}

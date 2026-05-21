import {css, html} from 'lit';
import {Icon, Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import {CountrySelect} from '@dbp-toolkit/country-select';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {createInstance} from '../i18n.js';

export class DispatchEditSenderModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.sender = {};
    }

    static get scopedElements() {
        return {
            'dbp-country-select': CountrySelect,
            'dbp-modal': Modal,
            'dbp-icon': Icon,
        };
    }

    static get properties() {
        return {
            lang: {type: String},
            sender: {type: Object},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    open(sender = this.sender) {
        this.sender = {...(sender || {})};
        this.updateComplete.then(() => {
            this._('#modal').open();
        });
    }

    close() {
        this._('#modal').close();
    }

    checkValidity(input) {
        const isValid = input.reportValidity();
        input.setAttribute('aria-invalid', !isValid);
        return isValid;
    }

    _onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', {bubbles: true, composed: true}));
        this.close();
    }

    _onConfirm() {
        const countrySelectContainer =
            this._('#address-country').shadowRoot.querySelector('.select2-control');
        const countrySelect = countrySelectContainer.querySelector('.select');

        const fields = [
            this._('#sender-organization-name'),
            this._('#sender-street-address'),
            this._('#sender-postal-code'),
            this._('#sender-address-locality'),
            countrySelect,
        ];

        if (!fields.every((field) => this.checkValidity(field))) {
            return;
        }

        const buildingNumberInput = this._('#sender-building-number');
        this.dispatchEvent(
            new CustomEvent('confirm', {
                detail: {
                    senderOrganizationName: this._('#sender-organization-name').value,
                    senderFullName: this._('#sender-full-name').value,
                    senderAddressCountry: countrySelect.value,
                    senderPostalCode: this._('#sender-postal-code').value,
                    senderAddressLocality: this._('#sender-address-locality').value,
                    senderStreetAddress: this._('#sender-street-address').value,
                    senderBuildingNumber: buildingNumberInput ? buildingNumberInput.value : '',
                },
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

            .content .input,
            .content select {
                background: var(--dbp-background);
                border: solid 1px var(--dbp-muted);
                border-radius: var(--dbp-border-radius);
                box-sizing: border-box;
                color: var(--dbp-content);
                font-family: inherit;
                font-size: inherit;
                padding: calc(0.375em - 1px) calc(0.625em - 1px);
                width: 100%;
            }

            .content select {
                -moz-appearance: auto;
                -webkit-appearance: auto;
                appearance: auto;
            }

            .nf-label {
                padding-bottom: 2px;
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
        const sender = this.sender || {};

        return html`
            <dbp-modal
                id="modal"
                modal-id="edit-sender-modal"
                title="${i18n.t('show-requests.edit-sender-dialog-title')}"
                style="
                    --dbp-modal-min-width: 320px;
                    --dbp-modal-max-width: 400px;
                    --dbp-modal-min-height: fit-content;
                    --dbp-modal-content-overflow-y: unset;
                    --dbp-modal-overflow: visible;
                "
                lang="${this.lang}">
                <div slot="content" class="content">
                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-sender-fn-dialog-label')}
                        </div>
                        <input
                            type="text"
                            class="input"
                            id="sender-full-name"
                            .value=${sender.senderFullName || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-sender-gn-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="sender-organization-name"
                            .value=${sender.senderOrganizationName || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-sender-sa-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="sender-street-address"
                            .value=${sender.senderStreetAddress || ''} />
                    </div>

                    ${sender.senderBuildingNumber
                        ? html`
                              <div>
                                  <div class="nf-label">
                                      ${i18n.t('show-requests.edit-sender-bn-dialog-label')}
                                  </div>
                                  <input
                                      type="text"
                                      class="input"
                                      maxlength="10"
                                      id="sender-building-number"
                                      .value=${sender.senderBuildingNumber || ''} />
                              </div>
                          `
                        : ''}

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-sender-pc-dialog-label')}
                        </div>
                        <input
                            required
                            type="number"
                            class="input"
                            id="sender-postal-code"
                            .value=${sender.senderPostalCode || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-sender-al-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="sender-address-locality"
                            .value=${sender.senderAddressLocality || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-sender-ac-dialog-label')}
                        </div>
                        <dbp-country-select id="address-country"></dbp-country-select>
                    </div>
                </div>

                <menu slot="footer" class="footer-menu">
                    <button
                        class="button"
                        aria-label="Close this dialog window"
                        @click="${this._onCancel}">
                        <dbp-icon name="close" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.edit-sender-dialog-button-cancel')}
                    </button>
                    <button class="button select-button is-primary" @click="${this._onConfirm}">
                        <dbp-icon name="checkmark" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.edit-sender-dialog-button-ok')}
                    </button>
                </menu>
            </dbp-modal>
        `;
    }
}

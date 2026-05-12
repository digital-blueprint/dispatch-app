import {css, html} from 'lit';
import {Icon, Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonStyles from '@dbp-toolkit/common/styles';
import * as dispatchHelper from '../utils.js';
import {createInstance} from '../i18n.js';

export class DispatchEditRecipientModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.recipient = {};
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
            recipient: {type: Object},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    open(recipient = this.recipient) {
        this.recipient = {...(recipient || {})};
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
        const fields = [
            this._('#given-name'),
            this._('#family-name'),
            this._('#birthdate-day'),
            this._('#birthdate-month'),
            this._('#birthdate-year'),
            this._('#street-address'),
            this._('#postal-code'),
            this._('#address-locality'),
            this._('#address-country'),
        ];

        if (!fields.every((field) => this.checkValidity(field))) {
            return;
        }

        this.dispatchEvent(
            new CustomEvent('confirm', {
                detail: {
                    givenName: this._('#given-name').value,
                    familyName: this._('#family-name').value,
                    addressCountry: this._('#address-country').value,
                    postalCode: this._('#postal-code').value,
                    addressLocality: this._('#address-locality').value,
                    streetAddress: this._('#street-address').value,
                    birthDateDay: this._('#birthdate-day').value,
                    birthDateMonth: this._('#birthdate-month').value,
                    birthDateYear: this._('#birthdate-year').value,
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

            .birthdate-input {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                width: 100%;
            }

            #birthdate-day,
            #birthdate-month {
                flex: 1;
            }

            #birthdate-year {
                flex: 2;
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
        const recipient = this.recipient || {};
        const countries =
            this.lang === 'en'
                ? dispatchHelper.getEnglishCountryList()
                : dispatchHelper.getGermanCountryList();

        return html`
            <dbp-modal
                id="modal"
                modal-id="edit-recipient-modal"
                title="${i18n.t('show-requests.edit-recipient-dialog-title')}"
                style="
                    --dbp-modal-min-width: 320px;
                    --dbp-modal-max-width: 400px;
                    --dbp-modal-min-height: fit-content;
                    --dbp-modal-content-overflow-y: unset;
                "
                lang="${this.lang}">
                <div slot="content" class="content">
                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-recipient-gn-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="given-name"
                            .value=${recipient.givenName || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-recipient-fn-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="family-name"
                            .value=${recipient.familyName || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}
                        </div>
                        <div class="birthdate-input">
                            <input
                                type="number"
                                class="input"
                                id="birthdate-day"
                                min="1"
                                max="31"
                                lang="${this.lang}"
                                placeholder="${i18n.t(
                                    'show-requests.add-recipient-birthdate-dialog-placeholder-day',
                                )}"
                                .value=${recipient.birthDateDay || ''} />
                            <input
                                type="number"
                                class="input"
                                id="birthdate-month"
                                min="1"
                                max="12"
                                lang="${this.lang}"
                                placeholder="${i18n.t(
                                    'show-requests.add-recipient-birthdate-dialog-placeholder-month',
                                )}"
                                .value=${recipient.birthDateMonth || ''} />
                            <input
                                type="number"
                                class="input"
                                id="birthdate-year"
                                min="1800"
                                max="2300"
                                lang="${this.lang}"
                                placeholder="${i18n.t(
                                    'show-requests.add-recipient-birthdate-dialog-placeholder-year',
                                )}"
                                .value=${recipient.birthDateYear || ''} />
                        </div>
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-recipient-sa-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="street-address"
                            .value=${recipient.streetAddress || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-recipient-pc-dialog-label')}
                        </div>
                        <input
                            required
                            type="number"
                            class="input"
                            id="postal-code"
                            .value=${recipient.postalCode || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-recipient-al-dialog-label')}
                        </div>
                        <input
                            required
                            type="text"
                            class="input"
                            id="address-locality"
                            .value=${recipient.addressLocality || ''} />
                    </div>

                    <div>
                        <div class="nf-label">
                            ${i18n.t('show-requests.edit-recipient-ac-dialog-label')}
                        </div>
                        <select required id="address-country">
                            ${Object.entries(countries).map(
                                ([code, name]) => html`
                                    <option
                                        value=${code}
                                        ?selected=${code === (recipient.addressCountry || 'AT')}>
                                        ${name}
                                    </option>
                                `,
                            )}
                        </select>
                    </div>
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
                        ${i18n.t('show-requests.edit-recipient-dialog-button-ok')}
                    </button>
                </menu>
            </dbp-modal>
        `;
    }
}

import {css, html} from 'lit';
import {Icon, Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import {CountrySelect} from '@dbp-toolkit/country-select';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {CustomPersonSelect} from '../person-select.js';
import {createInstance} from '../i18n.js';

export class DispatchAddRecipientModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.entryPointUrl = '';
        this.recipient = {};
        this.personSelectorIsDisabled = false;
    }

    static get scopedElements() {
        return {
            'dbp-country-select': CountrySelect,
            'dbp-modal': Modal,
            'dbp-icon': Icon,
            'dbp-person-select': CustomPersonSelect,
        };
    }

    static get properties() {
        return {
            lang: {type: String},
            entryPointUrl: {type: String, attribute: 'entry-point-url'},
            recipient: {type: Object},
            personSelectorIsDisabled: {type: Boolean},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    open(recipient = {}) {
        this.recipient = {...recipient};
        this.personSelectorIsDisabled = false;
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

    _disablePersonSelector() {
        this.personSelectorIsDisabled = true;
    }

    _onPersonSelected(event) {
        const personData = event.target.dataset.object;
        if (!personData) {
            this.recipient = {};
            this.requestUpdate();
            return;
        }

        const person = JSON.parse(personData);
        this.recipient = {personIdentifier: person.identifier};
        this.requestUpdate();
    }

    _resetFields() {
        this.recipient = {};
        this.personSelectorIsDisabled = false;

        this.updateComplete.then(() => {
            [
                '#given-name',
                '#family-name',
                '#birthdate-day',
                '#birthdate-month',
                '#birthdate-year',
                '#street-address',
                '#postal-code',
                '#address-locality',
            ].forEach((selector) => {
                const input = this._(selector);
                if (input) {
                    input.value = '';
                    input.removeAttribute('aria-invalid');
                }
            });

            const countrySelectContainer =
                this._('#address-country').shadowRoot.querySelector('.select2-control');
            const countrySelect = countrySelectContainer.querySelector('.select');
            if (countrySelect) {
                countrySelect.value = 'AT';
                countrySelect.removeAttribute('aria-invalid');
            }

            const selector = this._('#recipient-selector');
            if (selector) {
                selector.clear();
            }
        });
    }

    _onCancel() {
        this._resetFields();
        this.dispatchEvent(new CustomEvent('cancel', {bubbles: true, composed: true}));
        this.close();
    }

    _onConfirm(event) {
        const button = event.target;
        const hasPerson = this.recipient && this.recipient.personIdentifier;
        const countrySelectContainer =
            this._('#address-country').shadowRoot.querySelector('.select2-control');
        const countrySelect = countrySelectContainer.querySelector('.select');

        const fields = hasPerson
            ? [this._('#address-country')]
            : [
                  this._('#given-name'),
                  this._('#family-name'),
                  this._('#birthdate-day'),
                  this._('#birthdate-month'),
                  this._('#birthdate-year'),
                  this._('#street-address'),
                  this._('#postal-code'),
                  this._('#address-locality'),
                  countrySelect,
              ];

        if (!fields.every((field) => this.checkValidity(field))) {
            return;
        }

        button.disabled = true;
        const recipient = hasPerson
            ? {
                  personIdentifier: this.recipient.personIdentifier,
                  addressCountry: this._('#address-country').value,
              }
            : {
                  givenName: this._('#given-name').value,
                  familyName: this._('#family-name').value,
                  addressCountry: countrySelect.value,
                  postalCode: this._('#postal-code').value,
                  addressLocality: this._('#address-locality').value,
                  streetAddress: this._('#street-address').value,
                  birthDateDay: this._('#birthdate-day').value,
                  birthDateMonth: this._('#birthdate-month').value,
                  birthDateYear: this._('#birthdate-year').value,
              };

        this.dispatchEvent(
            new CustomEvent('confirm', {
                detail: {recipient, complete: () => (button.disabled = false)},
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

            .content-container {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .content-container h4 {
                margin-top: 0;
            }

            .content-right {
                display: flex;
                flex-direction: column;
                gap: 0.4em;
                padding-left: 20px;
            }

            .content-left {
                border-right: var(--dbp-border);
                padding-right: 20px;
            }

            .input,
            select {
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

            select {
                -moz-appearance: auto !important;
                -webkit-appearance: auto !important;
                appearance: auto !important;
                background: var(--dbp-background) !important;
                background-image: none !important;
                padding-right: calc(0.625em - 1px);
            }

            select option {
                background-color: var(--dbp-background);
                color: var(--dbp-content);
            }

            .nf-label {
                padding-bottom: 2px;
            }

            .muted {
                color: var(--dbp-muted);
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

            @container (max-width: 490px) {
                .content-container {
                    grid-template-columns: minmax(0, 1fr);
                }

                .content-right {
                    padding-left: 0;
                }

                .content-left h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                }

                .content-right h4 {
                    margin-top: 30px;
                    margin-bottom: 10px;
                }

                .content-left {
                    padding-right: 0;
                    border-right: 0;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--dbp-content);
                }
            }
        `;
    }

    render() {
        const i18n = this._i18n;
        const recipient = this.recipient || {};
        const hasPerson = recipient.personIdentifier;

        return html`
            <dbp-modal
                id="modal"
                modal-id="add-recipient-modal"
                title="${i18n.t('show-requests.add-recipient-dialog-title')}"
                style="
                    --dbp-modal-min-width: 320px;
                    --dbp-modal-max-width: 736px;
                    --dbp-modal-min-height: fit-content;
                    --dbp-modal-content-overflow-y: unset;
                    --dbp-modal-overflow: visible;
                "
                lang="${this.lang}">
                <div slot="content" class="content-container">
                    <div class="content-left">
                        <div class="nf-label selector">
                            <h4>${i18n.t('show-requests.add-recipient-person-select-label')}</h4>
                        </div>
                        <dbp-person-select
                            id="recipient-selector"
                            subscribe="auth"
                            lang="${this.lang}"
                            entry-point-url="${this.entryPointUrl}"
                            show-reload-button
                            ?disabled=${this.personSelectorIsDisabled}
                            @change="${this._onPersonSelected}"></dbp-person-select>
                    </div>

                    <div class="content-right">
                        <h4 class="${hasPerson ? 'muted' : ''}">
                            ${i18n.t('show-requests.add-recipient-or-text')}
                        </h4>

                        <div>
                            <div class="nf-label no-selector ${hasPerson ? 'muted' : ''}">
                                ${i18n.t('show-requests.add-recipient-gn-dialog-label')}
                            </div>
                            <input
                                ?disabled=${hasPerson}
                                required
                                type="text"
                                class="input"
                                id="given-name"
                                .value=${recipient.givenName || ''}
                                @input="${this._disablePersonSelector}" />
                        </div>

                        <div>
                            <div class="nf-label no-selector ${hasPerson ? 'muted' : ''}">
                                ${i18n.t('show-requests.add-recipient-fn-dialog-label')}
                            </div>
                            <input
                                ?disabled=${hasPerson}
                                required
                                type="text"
                                class="input"
                                id="family-name"
                                .value=${recipient.familyName || ''}
                                @input="${this._disablePersonSelector}" />
                        </div>

                        <div>
                            <div class="nf-label no-selector ${hasPerson ? 'muted' : ''}">
                                ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}
                            </div>
                            <div class="birthdate-input">
                                <input
                                    ?disabled=${hasPerson}
                                    type="number"
                                    class="input"
                                    id="birthdate-day"
                                    min="1"
                                    max="31"
                                    lang="${this.lang}"
                                    placeholder="${i18n.t(
                                        'show-requests.add-recipient-birthdate-dialog-placeholder-day',
                                    )}"
                                    .value=${recipient.birthDateDay || ''}
                                    @input="${this._disablePersonSelector}" />
                                <input
                                    ?disabled=${hasPerson}
                                    type="number"
                                    class="input"
                                    id="birthdate-month"
                                    min="1"
                                    max="12"
                                    lang="${this.lang}"
                                    placeholder="${i18n.t(
                                        'show-requests.add-recipient-birthdate-dialog-placeholder-month',
                                    )}"
                                    .value=${recipient.birthDateMonth || ''}
                                    @input="${this._disablePersonSelector}" />
                                <input
                                    ?disabled=${hasPerson}
                                    type="number"
                                    class="input"
                                    id="birthdate-year"
                                    min="1800"
                                    max="2300"
                                    lang="${this.lang}"
                                    placeholder="${i18n.t(
                                        'show-requests.add-recipient-birthdate-dialog-placeholder-year',
                                    )}"
                                    .value=${recipient.birthDateYear || ''}
                                    @input="${this._disablePersonSelector}" />
                            </div>
                        </div>

                        <div>
                            <div class="nf-label no-selector ${hasPerson ? 'muted' : ''}">
                                ${i18n.t('show-requests.add-recipient-sa-dialog-label')}
                            </div>
                            <input
                                ?disabled=${hasPerson}
                                required
                                type="text"
                                class="input"
                                id="street-address"
                                .value=${recipient.streetAddress || ''}
                                @input="${this._disablePersonSelector}" />
                        </div>

                        <div>
                            <div class="nf-label no-selector ${hasPerson ? 'muted' : ''}">
                                ${i18n.t('show-requests.add-recipient-pc-dialog-label')}
                            </div>
                            <input
                                ?disabled=${hasPerson}
                                required
                                type="number"
                                class="input"
                                id="postal-code"
                                .value=${recipient.postalCode || ''}
                                @input="${this._disablePersonSelector}" />
                        </div>

                        <div>
                            <div class="nf-label no-selector ${hasPerson ? 'muted' : ''}">
                                ${i18n.t('show-requests.add-recipient-al-dialog-label')}
                            </div>
                            <input
                                ?disabled=${hasPerson}
                                required
                                type="text"
                                class="input"
                                id="address-locality"
                                .value=${recipient.addressLocality || ''}
                                @input="${this._disablePersonSelector}" />
                        </div>

                        <div>
                            <div class="nf-label no-selector">
                                ${i18n.t('show-requests.add-recipient-ac-dialog-label')}
                            </div>
                            <dbp-country-select id="address-country"></dbp-country-select>
                        </div>
                    </div>
                </div>

                <menu slot="footer" class="footer-menu">
                    <button
                        class="button"
                        aria-label="Close this dialog window"
                        @click="${this._onCancel}">
                        <dbp-icon name="close" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.add-recipient-dialog-button-cancel')}
                    </button>
                    <button class="button " @click="${this._resetFields}">
                        <dbp-icon name="spinner-arrow" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.reset-select-button-text')}
                    </button>
                    <button class="button select-button is-primary" @click="${this._onConfirm}">
                        <dbp-icon name="checkmark" aria-hidden="true"></dbp-icon>
                        ${i18n.t('show-requests.add-recipient-dialog-button-ok')}
                    </button>
                </menu>
            </dbp-modal>
        `;
    }
}

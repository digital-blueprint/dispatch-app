import {createInstance} from './i18n.js';
import {css, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import DBPDispatchLitElement from "./dbp-dispatch-lit-element";
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {LoadingButton, Icon, MiniSpinner, InlineNotification} from "@dbp-toolkit/common";
import {classMap} from "lit/directives/class-map.js";
import { send } from '@dbp-toolkit/common/notification';
import {Activity} from './activity.js';
import metadata from './dbp-create-request.metadata.json';

class CreateRequest extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.activity = new Activity(metadata);
        this.entryPointUrl = '';

        this.senderGivenName = "";
        this.senderFamilyName = "";
        this.senderAddressCountry = "";
        this.senderPostalCode = "";
        this.senderAddressLocality = "";
        this.senderStreetAddress = "";
        this.senderBuildingNumber = "";
        this.emptyFieldsGiven = false;
    }

    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-mini-spinner': MiniSpinner,
            'dbp-loading-button': LoadingButton,
            'dbp-inline-notification': InlineNotification
        };
    }

    static get properties() {
        return {
            ...super.properties,
            lang: {type: String},
            entryPointUrl: { type: String, attribute: 'entry-point-url' },

            senderGivenName: {type: String, attribute: false},
            senderFamilyName: {type: String, attribute: false},
            senderAddressCountry: {type: String, attribute: false},
            senderPostalCode: {type: String, attribute: false},
            senderAddressLocality: {type: String, attribute: false},
            senderStreetAddress: {type: String, attribute: false},
            senderBuildingNumber: {type: String, attribute: false},
            emptyFieldsGiven: {type: Boolean, attribute: false},
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

    processSenderGivenNameInput(event) {
        this.senderGivenName = "";
        if (this._('#sender-given-name').value !== '') {
            this.senderGivenName = this._('#sender-given-name').value;
        } else {
            this.senderGivenName = '';
        }
    }

    processSenderFamilyNameInput(event) {
        this.senderFamilyName = "";
        if (this._('#sender-family-name').value !== '') {
            this.senderFamilyName = this._('#sender-family-name').value;
        } else {
            this.senderFamilyName = '';
        }
    }

    processSenderAddressCountryInput(event) {
        this.senderAddressCountry = "";
        if (this._('#sender-address-country').value !== '') {
            this.senderAddressCountry = this._('#sender-address-country').value;
        } else {
            this.senderAddressCountry = '';
        }
    }

    processSenderPostalCodeInput(event) {
        this.senderPostalCode = "";
        if (this._('#sender-postal-code').value !== '') {
            this.senderPostalCode = this._('#sender-postal-code').value;
        } else {
            this.senderPostalCode = '';
        }
    }

    processSenderAddressLocalityInput(event) {
        this.senderAddressLocality = "";
        if (this._('#sender-address-locality').value !== '') {
            this.senderAddressLocality = this._('#sender-address-locality').value;
        } else {
            this.senderAddressLocality = '';
        }
    }

    processSenderStreetAddressInput(event) {
        this.senderStreetAddress = "";
        if (this._('#sender-street-address').value !== '') {
            this.senderStreetAddress = this._('#sender-street-address').value;
        } else {
            this.senderStreetAddress = '';
        }
    }

    processSenderBuildingNumberInput(event) {
        this.senderBuildingNumber = "";
        if (this._('#sender-building-number').value !== '') {
            this.senderBuildingNumber = this._('#sender-building-number').value;
        } else {
            this.senderBuildingNumber = '';
        }
    }

    async _onCreateRequestButtonClicked(event) {
        if (this.senderBuildingNumber === '' || this.senderStreetAddress === '' || this.senderAddressLocality === '' || this.senderPostalCode === '' || this.senderAddressCountry === '' || this.senderFamilyName === '' || this.senderGivenName === '') {
            this.emptyFieldsGiven = true;
            console.log("some fields are empty");
            return;
        } else {
            console.log("all fields are set");
            this.emptyFieldsGiven = false;
        }

        const i18n = this._i18n;
        try {
            let response = await this.sendCreateDispatchRequest();
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 201) {
                this._('#sender-given-name').value = '';
                this._('#sender-family-name').value = '';
                this._('#sender-address-country').value = '';
                this._('#sender-postal-code').value = '';
                this._('#sender-address-locality').value = '';
                this._('#sender-street-address').value = '';
                this._('#sender-building-number').value = '';

                send({
                    "summary": i18n.t('create-request.successfully-requested-title'),
                    "body": i18n.t('create-request.successfully-requested-text'),
                    "type": "success",
                    "timeout": 5,
                });
            } else {
                // TODO show error code specific notification
                send({
                    "summary": i18n.t('create-request.error-requested-title'),
                    "body": i18n.t('create-request.error-requested-text'),
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } finally {
            // TODO
        }
    }

    getCurrentTime() {
        let date = new Date();
        let currentHours = ('0' + (date.getHours() + 1)).slice(-2);
        let currentMinutes = ('0' + date.getMinutes()).slice(-2);

        return currentHours + ':' + currentMinutes;
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getLinkCss()}
            ${commonStyles.getNotificationCSS()}
            ${commonStyles.getActivityCSS()}

            h2:first-child {
                margin-top: 0;
            }

            h2 {
                margin-bottom: 10px;
            }

        `;
    }

    render() {
        const i18n = this._i18n;
        return html`
            <div class="control ${classMap({hidden: this.isLoggedIn() || !this.isLoading()})}">
                <span class="loading">
                    <dbp-mini-spinner text=${i18n.t('check-out.loading-message')}></dbp-mini-spinner>
                </span>
            </div>
            
            <dbp-inline-notification class="${classMap({ hidden: this.isLoggedIn() || this.isLoading()})}" 
                            type="warning"
                            body="${i18n.t('error-login-message')}">
            </dbp-inline-notification>

            <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading()})}">
                
                <h2>${this.activity.getName(this.lang)}</h2>
                <p class="subheadline">
                    <slot name="description">
                        ${this.activity.getDescription(this.lang)}
                    </slot>
                </p>
                
                <slot name="activity-description">
                    <p>${i18n.t('create-request.description-text')}</p>
                </slot>

                <dbp-inline-notification class="${classMap({hidden: !this.emptyFieldsGiven})}"
                                         type="warning"
                                         body="${i18n.t('create-request.empty-fields-given')}">
                </dbp-inline-notification>
                
                <div class="border">
                    <div class="container">
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-given-name')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-given-name" placeholder="" name="senderGivenName"
                                       .value="${this.senderGivenName}" @input="${(event) => {this.processSenderGivenNameInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-family-name')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-family-name" placeholder="" name="senderFamilyName"
                                       .value="${this.senderFamilyName}" @input="${(event) => {this.processSenderFamilyNameInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-address-country')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-address-country" placeholder="" name="senderAddressCountry"
                                       .value="${this.senderAddressCountry}" @input="${(event) => {this.processSenderAddressCountryInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-postal-code')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-postal-code" placeholder="" name="senderPostalCode"
                                       .value="${this.senderPostalCode}" @input="${(event) => {this.processSenderPostalCodeInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-address-locality')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-address-locality" placeholder="" name="senderAddressLocality"
                                       .value="${this.senderAddressLocality}" @input="${(event) => {this.processSenderAddressLocalityInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-street-address')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-street-address" placeholder="" name="senderStreetAddress"
                                       .value="${this.senderStreetAddress}" @input="${(event) => {this.processSenderStreetAddressInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('create-request.sender-building-number')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-building-number" placeholder="" name="senderBuildingNumber"
                                       .value="${this.senderBuildingNumber}" @input="${(event) => {this.processSenderBuildingNumberInput(event);}}">
                            </div>
                        </div>
                        <div class="btn">
                            <dbp-loading-button id="send-btn" type="is-primary" 
                                                value="${i18n.t('create-request.create-request-button-text')}"
                                                @click="${this._onCreateRequestButtonClicked}" 
                                                title="${i18n.t('create-request.create-request-button-text')}" 
                                                ?disabled=${this.senderGivenName === '' || this.senderFamilyName === '' || this.senderPostalAddress === ''}
                            ></dbp-loading-button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

commonUtils.defineCustomElement('dbp-create-request', CreateRequest);

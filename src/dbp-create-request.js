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
        this.senderPostalAddress = "";
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
            senderPostalAddress: {type: String, attribute: false},
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

    processSenderPostalAddressInput(event) {
        this.senderPostalAddress = "";
        if (this._('#sender-postal-address').value !== '') {
            this.senderPostalAddress = this._('#sender-postal-address').value;
        } else {
            this.senderPostalAddress = '';
        }
    }

    async _onCreateRequestButtonClicked(event) {
        if (this.senderPostalAddress === '' || this.senderFamilyName === '' || this.senderGivenName === '') {
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
                this._('#sender-postal-address').value = '';

                send({
                    "summary": i18n.t('create-request.successfully-requested-title'),
                    "body": i18n.t('create-request.successfully-requested-text'),
                    "type": "success",
                    "timeout": 5,
                });
            } else {
                // TODO show error code specific notification
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
                            <label class="label">${i18n.t('create-request.sender-postal-address')}</label>
                            <div class="control">
                                <input type="text" class="input" id="sender-postal-address" placeholder="" name="senderPostalAddress"
                                       .value="${this.senderPostalAddress}" @input="${(event) => {this.processSenderPostalAddressInput(event);}}">
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

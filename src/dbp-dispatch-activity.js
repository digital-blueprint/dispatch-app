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
import metadata from './dbp-dispatch-activity.metadata.json';

class DispatchActivity extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.activity = new Activity(metadata);
        this.entryPointUrl = '';
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

    processInput(event) {
        // TODO
    }

    setNumber(event) {
        // TODO
    }

    getCurrentTime() {
        let date = new Date();
        let currentHours = ('0' + (date.getHours() + 1)).slice(-2);
        let currentMinutes = ('0' + date.getMinutes()).slice(-2);

        return currentHours + ':' + currentMinutes;
    }

    async _atChangeInput(event)  {
        if (this._("#send-btn") )
            this._("#send-btn").disabled = false; // TODO
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
            
            <dbp-inline-notification class=" ${classMap({ hidden: this.isLoggedIn() || this.isLoading() })}" 
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
                    <p>${i18n.t('dispatch-activity.description-text')}</p>
                </slot>
                
                <div class="border">
                    <div class="container">
                        <div class="field">
                            <label class="label">${i18n.t('dispatch-activity.email')}</label>
                            <div class="control">
                                <input type="email" class="input" id="email-field" placeholder="mail@email.at" name="email" .value="" @input="${(event) => {this.processInput(event); this._atChangeInput(event);}}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('field-text')}</label>
                            <div class="control">
                                TODO
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">${i18n.t('dispatch-activity.end-time')}</label>
                            <div class="control">
                                <input type="time" class="input" placeholder="hh:mm" id="end-time" name="endTime" .defaultValue="${this.getCurrentTime()}" @input="${(event) => {this._atChangeInput(event);}}">
                            </div>
                        </div>
                        <div class="btn">
                            <dbp-loading-button id="send-btn" type="is-primary" value="${i18n.t('button-text')}" 
                                                @click="${this._onButtonClicked}" title="${i18n.t('button-text')}" 
                                                ?disabled=false></dbp-loading-button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

commonUtils.defineCustomElement('dbp-dispatch-activity', DispatchActivity);

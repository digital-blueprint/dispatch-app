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
import metadata from './dbp-show-requests.metadata.json';
import MicroModal from './micromodal.es';
import {FileSource} from '@dbp-toolkit/file-handling';

class ShowRequests extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.activity = new Activity(metadata);
        this.entryPointUrl = '';
        this.loading = false;
        this._initialFetchDone = false;
        this.requestList = [];
        this.showListView = true;
        this.showDetailsView = false;
        this.showEditRecipientView = false;
        this.currentItem = null;
        this.currentRecipient = null;

        this.fileHandlingEnabledTargets = "local";
        this.nextcloudWebAppPasswordURL = "";
        this.nextcloudWebDavURL = "";
        this.nextcloudName = "";
        this.nextcloudFileURL = "";
        this.nextcloudAuthInfo = "";
    }

    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-mini-spinner': MiniSpinner,
            'dbp-loading-button': LoadingButton,
            'dbp-inline-notification': InlineNotification,
            'dbp-file-source': FileSource,
        };
    }

    static get properties() {
        return {
            ...super.properties,
            lang: {type: String},
            entryPointUrl: { type: String, attribute: 'entry-point-url' },
            loading: { type: Boolean, attribute: false },
            initialRequestsLoading: { type: Boolean, attribute: false },
            requestList: { type: Array, attribute: false },
            showListView: { type: Boolean, attribute: false },
            showDetailsView: { type: Boolean, attribute: false },
            showEditRecipientView: { type: Boolean, attribute: false },
            currentItem: { type: Object, attribute: false },
            currentRecipient: { type: Object, attribute: false },

            fileHandlingEnabledTargets: {type: String, attribute: 'file-handling-enabled-targets'},
            nextcloudWebAppPasswordURL: {type: String, attribute: 'nextcloud-web-app-password-url'},
            nextcloudWebDavURL: {type: String, attribute: 'nextcloud-webdav-url'},
            nextcloudName: {type: String, attribute: 'nextcloud-name'},
            nextcloudFileURL: {type: String, attribute: 'nextcloud-file-url'},
            nextcloudAuthInfo: {type: String, attribute: 'nextcloud-auth-info'},
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

    /*
    * Open  file source
    *
    */
    openFileSource() {
        const fileSource = this._('#file-source');
        if (fileSource) {
            this._('#file-source').openDialog();
        }
    }

    async onFileSelected(event) {
        await this.addFile(event.detail.file);
    }

    async addFile(file) {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        console.log(file);

        let response = await this.sendAddFileToRequest(id, file);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 201) {
            send({
                "summary": i18n.t('show-requests.successfully-added-file-title'),
                "body": i18n.t('show-requests.successfully-added-file-text'),
                "type": "success",
                "timeout": 5,
            });

            let resp = await this.getDispatchRequest(id);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }
        } else {
            // TODO error handling
        }
    }

    async addRecipientToRequest(event, item) {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let givenName = this._('#tf-add-recipient-gn-dialog').value;
        let familyName = this._('#tf-add-recipient-fn-dialog').value;
        let addressCountry = this._('#tf-add-recipient-ac-dialog').value;
        let postalCode = this._('#tf-add-recipient-pc-dialog').value;
        let addressLocality = this._('#tf-add-recipient-al-dialog').value;
        let streetAddress = this._('#tf-add-recipient-sa-dialog').value;
        let buildingNumber = this._('#tf-add-recipient-bn-dialog').value;

        let response = await this.sendAddRequestRecipientsRequest(id, givenName, familyName, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 201) {
            send({
                "summary": i18n.t('show-requests.successfully-added-recipient-title'),
                "body": i18n.t('show-requests.successfully-added-recipient-text'),
                "type": "success",
                "timeout": 5,
            });

            let resp = await this.getDispatchRequest(id);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }
        } else {
            // TODO error handling
        }
    }

    async updateRecipient(event, item) {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let recipientId = this.currentRecipient.identifier;
        let givenName = this._('#tf-edit-recipient-gn-dialog').value;
        let familyName = this._('#tf-edit-recipient-fn-dialog').value;
        let addressCountry = this._('#tf-edit-recipient-ac-dialog').value;
        let postalCode = this._('#tf-edit-recipient-pc-dialog').value;
        let addressLocality = this._('#tf-edit-recipient-al-dialog').value;
        let streetAddress = this._('#tf-edit-recipient-sa-dialog').value;
        let buildingNumber = this._('#tf-edit-recipient-bn-dialog').value;

        let response = await this.sendUpdateRecipientRequest(recipientId, id, givenName, familyName, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('show-requests.successfully-edited-recipient-title'),
                "body": i18n.t('show-requests.successfully-edited-recipient-text'),
                "type": "success",
                "timeout": 5,
            });

            // this.currentRecipient = responseBody;

            let resp = await this.getDispatchRequest(id);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }
        } else {
            // TODO error handling
        }
    }

    async editRequest(event, item) {
        this.showListView = false;
        this.showDetailsView = true;
        this.currentItem = item;
        //await this.getDispatchRequest(item.identifier);
    }

    async deleteRequest(event, item) {
        const i18n = this._i18n;

        if (item.dateSubmitted) {
            send({
                "summary": i18n.t('show-requests.delete-not-allowed-title'),
                "body": i18n.t('show-requests.delete-not-allowed-text'),
                "type": "danger",
                "timeout": 5,
            });
            return;
        }

        if(confirm(i18n.t('show-requests.delete-dialog-text'))) {
            let response = await this.sendDeleteDispatchRequest(item.identifier);
            if (response.status === 204) {
                this.getListOfRequests();
                send({
                    "summary": i18n.t('show-requests.successfully-deleted-title'),
                    "body": i18n.t('show-requests.successfully-deleted-text'),
                    "type": "success",
                    "timeout": 5,
                });
                if (this.currentItem) {
                    this.showListView = true;
                    this.showDetailsView = false;
                    this.currentItem = null;
                }
            } else {
                // TODO error handling
            }
        }
    }

    async submitRequest(event, item) {
        const i18n = this._i18n;

        if (item.dateSubmitted) {
            send({
                "summary": i18n.t('show-requests.delete-not-allowed-title'),
                "body": i18n.t('show-requests.delete-not-allowed-text'),
                "type": "danger",
                "timeout": 5,
            });
            return;
        }

        if (item.files && item.files.length > 0 && item.recipients && item.recipients.length > 0) {

            if(confirm(i18n.t('show-requests.submit-dialog-text'))) {
                let response = await this.sendSubmitDispatchRequest(item.identifier);
                if (response.status === 201) {
                    this.getListOfRequests();
                    send({
                        "summary": i18n.t('show-requests.successfully-submitted-title'),
                        "body": i18n.t('show-requests.successfully-submitted-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                } else {
                    // TODO error handling
                }
            }
        } else {
            send({
                "summary": i18n.t('show-requests.empty-fields-submitted-title'),
                "body": i18n.t('show-requests.empty-fields-submitted-text'),
                "type": "danger",
                "timeout": 5,
            });
        }
    }

    async confirmEditSender() {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let senderGivenName = this._('#tf-edit-sender-gn-dialog').value;
        let senderFamilyName = this._('#tf-edit-sender-fn-dialog').value;
        let senderAddressCountry = this._('#tf-edit-sender-ac-dialog').value;
        let senderPostalCode = this._('#tf-edit-sender-pc-dialog').value;
        let senderAddressLocality = this._('#tf-edit-sender-al-dialog').value;
        let senderStreetAddress = this._('#tf-edit-sender-sa-dialog').value;
        let senderBuildingNumber = this._('#tf-edit-sender-bn-dialog').value;

        let response = await this.sendEditDispatchRequest(id, senderGivenName, senderFamilyName, senderAddressCountry, senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('show-requests.successfully-updated-sender-title'),
                "body": i18n.t('show-requests.successfully-updated-sender-text'),
                "type": "success",
                "timeout": 5,
            });

            this.currentItem = responseBody;
        } else {
            // TODO error handling
        }
    }

    parseListOfRequests(response) {
        let list = [];

        let numTypes = parseInt(response['hydra:totalItems']);
        if (isNaN(numTypes)) {
            numTypes = 0;
        }
        for (let i = 0; i < numTypes; i++ ) {
            list[i] = response['hydra:member'][i];
        }
        list.sort(this.compareListItems);

        return list;
    }

    /**
     * Get a list of all requests
     *
     * @returns {Array} list
     */
    async getListOfRequests() {
        this.initialRequestsLoading = !this._initialFetchDone;
        try {
            let response = await this.getListOfDispatchRequests();
            let responseBody = await response.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.requestList = this.parseListOfRequests(responseBody);
            }
        } finally {
            this.initialRequestsLoading = false;
            this._initialFetchDone = true;
        }
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getLinkCss()}
            ${commonStyles.getNotificationCSS()}
            ${commonStyles.getActivityCSS()}
            ${commonStyles.getModalDialogCSS()}
            ${commonStyles.getButtonCSS()}

            a {
                color: var(--dbp-override-content);
                cursor: pointer;
                text-decoration: none;
            }

            h3 {
                font-weight: 300;
                margin-top: 1.3em;
                margin-bottom: 1.3em;
            }
            
            .border {
                border-top: var(--dbp-override-border);
            }
            
            .requests {
                margin-top: 1em;
            }
            
            .request-item:first-child {
                border-top: none;
                padding-top: 0;
                margin-top: 0;
            }
            
            .request-item {
                margin: 1.5em 0 1.5em 1em;
            }

            .request-item span:first-child {
                margin-top: 0;
            }

            .request-item span {
                font-weight: 700;
                margin-top: 0.5em;
            }
            
            .sender-data, .files-data, .recipients-data {
                margin: 0.5em 0 0.5em 1em;
            }

            .request-buttons {
                display: flex;
                justify-content: space-between;
                padding-top: 0.5em;
                margin-left: -1em;
            }

            .request-item.details .files-data,
            .request-item.details .recipients-data {
                display: flex;
                justify-content: space-between;
            }

            .request-item.details .recipients-data {
                padding-bottom: 1em;
            }
            
            .request-item.details .request-buttons {
                padding-top: 1.5em;
                border-top: var(--dbp-override-border);
            }
            
            .request-item.details .sender-data-btn {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }

            .back-navigation {
                padding-top: 1em;
            }
            
            .back-navigation dbp-icon {
                font-size: 0.8em;
                padding-right: 7px;
                padding-bottom: 2px;
            }
            
            .edit-recipient-btn {
                margin-left: -1.5em;
                padding-bottom: 1em;
            }
            
            .recipient-entry .border {
                margin-left: -1.5em;
                margin-bottom: 1em;
            }
            
            .rec-2-btns {
                display: flex;
                flex-direction: row-reverse;
            }

            h2:first-child {
                margin-top: 0;
            }

            h2 {
                margin-bottom: 10px;
            }

            #edit-sender-modal-box, 
            #add-recipient-modal-box,
            #edit-recipient-modal-box {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 15px 20px 20px;
                /*max-height: 190px;*/
                /*min-height: 190px;*/
                max-height: 630px;
                min-height: 630px;
                min-width: 320px;
                max-width: 400px;
            }

            #edit-sender-modal-box header.modal-header,
            #add-recipient-modal-box header.modal-header,
            #edit-recipient-modal-box header.modal-header {
                padding: 0px;
                display: flex;
                justify-content: space-between;
            }

            #edit-sender-modal-box footer.modal-footer .modal-footer-btn,
            #add-recipient-modal-box footer.modal-footer .modal-footer-btn,
            #edit-recipient-modal-box footer.modal-footer .modal-footer-btn {
                padding: 0px;
                display: flex;
                justify-content: space-between;
            }

            #edit-sender-modal-content,
            #add-recipient-modal-content,
            #edit-recipient-modal-content {
                display: flex;
                padding-left: 0px;
                padding-right: 0px;
                overflow: unset;
                gap: 1em;
                flex-direction: column;
            }

            #edit-sender-modal-content div .input,
            #add-recipient-modal-content div .input,
            #edit-recipient-modal-content div .input {
                width: 100%;
            }

            #edit-sender-modal-content .nf-label,
            #add-recipient-modal-content .nf-label,
            #edit-recipient-modal-content .nf-label {
                padding-bottom: 2px;
            }
            
            #edit-sender-modal-title,
            #add-recipient-modal-title,
            #edit-recipient-modal-title {
                margin: 0;
                padding: 0;
            }
        `;
    }

    render() {
        const i18n = this._i18n;

        if (this.isLoggedIn() && !this.isLoading() && !this._initialFetchDone && !this.initialRequestsLoading) {
            this.getListOfRequests();
        }

        return html`
            <div class="control ${classMap({hidden: this.isLoggedIn() || !this.isLoading()})}">
                <span class="loading">
                    <dbp-mini-spinner text=${i18n.t('loading-message')}></dbp-mini-spinner>
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
                    <p>${i18n.t('show-requests.description-text')}
                        <a href="#" class="int-link-internal" title="${i18n.t('show-requests.create-new-request')}"
                           @click="${(e) => {
                                this.dispatchEvent(
                                    new CustomEvent('dbp-show-activity', {
                                        detail: {name: 'create-request'},
                                    })
                                );
                                e.preventDefault();
                           }}"
                        >
                            <span>${i18n.t('show-requests.create-new-request')}.</span>
                        </a>
                    </p>
                </slot>

                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView || this.showEditRecipientView })}">
                    ${i18n.t('show-requests.dispatch-orders')}
                </h3>
                
                <div class="requests ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView || this.showEditRecipientView })}">
                    ${this.requestList.map(i => html`
                        <div class="request-item">
                            <span>${i18n.t('show-requests.id')}:</span> ${i.identifier}<br>
                            <span>${i18n.t('show-requests.date-created')}:</span> ${i.dateCreated}<br>
                            <span>${i18n.t('show-requests.date-submitted')}:</span> 
                                ${i.dateSubmitted ? i.dateSubmitted : i18n.t('show-requests.empty-date-submitted')}<br>
                            
                            <span>${i18n.t('show-requests.sender')}:</span>
                            <div class="sender-data">
                                ${i.senderFamilyName ? html`
                                        ${i18n.t('show-requests.sender-family-name')}: ${i.senderFamilyName}<br>
                                ` : ``}
                                ${i.senderGivenName ? html`
                                        ${i18n.t('show-requests.sender-given-name')}: ${i.senderGivenName}<br>
                                ` : ``}
                                ${i.senderAddressCountry ? html`
                                        ${i18n.t('show-requests.sender-address-country')}: ${i.senderAddressCountry}<br>
                                ` : ``}
                                ${i.senderPostalCode ? html`
                                        ${i18n.t('show-requests.sender-postal-code')}: ${i.senderPostalCode}<br>
                                ` : ``}
                                ${i.senderAddressLocality ? html`
                                        ${i18n.t('show-requests.sender-address-locality')}: ${i.senderAddressLocality}<br>
                                ` : ``}
                                ${i.senderStreetAddress ? html`
                                        ${i18n.t('show-requests.sender-street-address')}: ${i.senderStreetAddress}<br>
                                ` : ``}
                                ${i.senderBuildingNumber ? html`
                                        ${i18n.t('show-requests.sender-building-number')}: ${i.senderBuildingNumber}
                                ` : ``}
                            </div>

                            <span>${i18n.t('show-requests.files')}:</span>
                            <div class="files-data">
                                ${i.files.map(file => html`
                                    ${file.name}<br>
                                `)}
                                 <div class="no-files ${classMap({hidden: !this.isLoggedIn() || i.files.length !== 0})}">${i18n.t('show-requests.empty-files-text')}</div>
                            </div>

                            <span>${i18n.t('show-requests.recipients')}:</span>
                            <div class="recipients-data">
                                ${i.recipients.map(j => html`
                                    ${j.familyName}<br>
                                    ${j.givenName}<br>
                                    <br>
                                `)}
                                <div class="no-recipients ${classMap({hidden: !this.isLoggedIn() || i.recipients.length !== 0})}">${i18n.t('show-requests.no-recipients-text')}</div>
                            </div>
                            
                            <div class="request-buttons">
                                <div class="edit-buttons">
                                    <dbp-loading-button id="edit-btn"
                                                        ?disabled="${this.loading || i.dateSubmitted}"
                                                        value="${i18n.t('show-requests.edit-button-text')}" 
                                                        @click="${(event) => { this.editRequest(event, i); }}" 
                                                        title="${i18n.t('show-requests.edit-button-text')}"
                                    >
                                        ${i18n.t('show-requests.edit-button-text')}
                                    </dbp-loading-button>
                                    <dbp-loading-button id="delete-btn" 
                                                        ?disabled="${this.loading || i.dateSubmitted}" 
                                                        value="${i18n.t('show-requests.delete-button-text')}" 
                                                        @click="${(event) => { this.deleteRequest(event, i); }}" 
                                                        title="${i18n.t('show-requests.delete-button-text')}"
                                    >
                                        ${i18n.t('show-requests.delete-button-text')}
                                    </dbp-loading-button>
                                </div>
                                <div class="submit-button">
                                    <dbp-loading-button type="is-primary"
                                                        id="submit-btn" 
                                                        ?disabled="${this.loading || i.dateSubmitted}" 
                                                        value="${i18n.t('show-requests.submit-button-text')}" 
                                                        @click="${(event) => { this.submitRequest(event, i); }}" 
                                                        title="${i18n.t('show-requests.submit-button-text')}"
                                    >
                                        ${i18n.t('show-requests.submit-button-text')}
                                    </dbp-loading-button>
                                </div>
                            </div>
                        </div>
                        <div class="border">
                    `)}
                    <span class="control ${classMap({hidden: this.isLoggedIn() && !this.initialRequestsLoading})}">
                        <span class="loading">
                            <dbp-mini-spinner text=${i18n.t('loading-message')}></dbp-mini-spinner>
                        </span>
                    </span>
                    
                    <div class="no-requests ${classMap({hidden: !this.isLoggedIn() || this.initialRequestsLoading || this.requestList.length !== 0})}">${i18n.t('show-requests.no-requests-message')}</div>
                
                </div>

                <span class="back-navigation ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView || this.showEditRecipientView })}">
                    <a href="#" title="${i18n.t('show-requests.back-to-list')}"
                       @click="${(e) => {
                           this.showListView = true;
                           this.showDetailsView = false;
                           this.currentItem = null;
                       }}"
                    >
                        <dbp-icon name="chevron-left"></dbp-icon>
                        ${i18n.t('show-requests.back-to-list')}.
                    </a>
                </span>
                
                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView || this.showEditRecipientView })}">
                    ${i18n.t('show-requests.detailed-dispatch-order')}:
                </h3>

                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView || this.showEditRecipientView })}">
                    ${ this.currentItem ? html`
                        <div class="request-item details">
                            <span>${i18n.t('show-requests.id')}:</span> ${this.currentItem.identifier}<br>
                            <span>${i18n.t('show-requests.date-created')}:</span> ${this.currentItem.dateCreated}<br>
                            <span>${i18n.t('show-requests.date-submitted')}:</span> 
                                ${this.currentItem.dateSubmitted ? this.currentItem.dateSubmitted : i18n.t('show-requests.empty-date-submitted')}<br>
                            
                            <span>${i18n.t('show-requests.sender')}:</span>
                            <div class="sender-data-btn">
                                <div class="sender-data">
                                    ${this.currentItem.senderFamilyName ? html`
                                        ${i18n.t('show-requests.sender-family-name')}: ${this.currentItem.senderFamilyName}<br>
                                    ` : ``}
                                    ${this.currentItem.senderGivenName ? html`
                                        ${i18n.t('show-requests.sender-given-name')}: ${this.currentItem.senderGivenName}<br>
                                    ` : ``}
                                    ${this.currentItem.senderAddressCountry ? html`
                                        ${i18n.t('show-requests.sender-address-country')}: ${this.currentItem.senderAddressCountry}<br>
                                    ` : ``}
                                    ${this.currentItem.senderPostalCode ? html`
                                        ${i18n.t('show-requests.sender-postal-code')}: ${this.currentItem.senderPostalCode}<br>
                                    ` : ``}
                                    ${this.currentItem.senderAddressLocality ? html`
                                        ${i18n.t('show-requests.sender-address-locality')}: ${this.currentItem.senderAddressLocality}<br>
                                    ` : ``}
                                    ${this.currentItem.senderStreetAddress ? html`
                                        ${i18n.t('show-requests.sender-street-address')}: ${this.currentItem.senderStreetAddress}<br>
                                    ` : ``}
                                    ${this.currentItem.senderBuildingNumber ? html`
                                        ${i18n.t('show-requests.sender-building-number')}: ${this.currentItem.senderBuildingNumber}
                                    ` : ``}
                                </div>
                                <dbp-loading-button id="edit-btn"
                                                        ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                        value="${i18n.t('show-requests.edit-button-text')}" 
                                                        @click="${(event) => { 
                                                            console.log("on edit sender clicked");
                                                            MicroModal.show(this._('#edit-sender-modal'), {
                                                                disableScroll: true,
                                                                onClose: (modal) => {
                                                                    this.loading = false;
                                                                },
                                                            });
                                                        }}" 
                                                        title="${i18n.t('show-requests.edit-button-text')}"
                                >
                                    ${i18n.t('show-requests.edit-button-text')}
                                </dbp-loading-button>
                            </div>
                            
                            <span>${i18n.t('show-requests.files')}:</span>
                            <div class="files-data">
                                ${this.currentItem.files.map(file => html`
                                    ${file.name}<br>
                                `)}
                                 <div class="no-files ${classMap({hidden: !this.isLoggedIn() || this.currentItem.files.length !== 0})}">${i18n.t('show-requests.empty-files-text')}</div>
                                <dbp-loading-button id="add-files-btn"
                                                ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                value="${i18n.t('show-requests.add-files-button-text')}" 
                                                @click="${(event) => { 
                                                    console.log("on add files clicked");
                                                    this.openFileSource();
                                                }}" 
                                                title="${i18n.t('show-requests.add-files-button-text')}"
                                >
                                    ${i18n.t('show-requests.add-files-button-text')}
                                </dbp-loading-button>
                                <dbp-file-source
                                      id="file-source"
                                      context="${i18n.t('show-requests.filepicker-context')}"
                                      allowed-mime-types="image/*,application/pdf,.pdf"
                                      nextcloud-auth-url="${this.nextcloudWebAppPasswordURL}"
                                      nextcloud-web-dav-url="${this.nextcloudWebDavURL}"
                                      nextcloud-name="${this.nextcloudName}"
                                      nextcloud-file-url="${this.nextcloudFileURL}"
                                      nexcloud-auth-info="${this.nextcloudAuthInfo}"
                                      enabled-targets="${this.fileHandlingEnabledTargets}"
                                      decompress-zip
                                      lang="${this.lang}"
                                      text="${i18n.t('show-requests.filepicker-context')}"
                                      button-label="${i18n.t(
                                            'show-requests.filepicker-button-title'
                                      )}"
                                      number-of-files="1"
                                      @dbp-file-source-file-selected="${this.onFileSelected}">
                                </dbp-file-source>
                            </div>

                            <span>${i18n.t('show-requests.recipients')}:</span>
                            <div class="recipients-data">
                                ${this.currentItem.recipients.map(j => html`
                                    ${j.familyName}<br>
                                    ${j.givenName}<br>
                                    <br>
                                `)}
                                <div class="no-recipients ${classMap({hidden: !this.isLoggedIn() || this.currentItem.recipients.length !== 0})}">${i18n.t('show-requests.no-recipients-text')}</div>
                                <dbp-loading-button id="add-recipient-btn"
                                                    ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                    value="${i18n.t('show-requests.add-recipient-button-text')}" 
                                                    @click="${(event) => { 
                                                        console.log("on add recipient clicked");
                                                        MicroModal.show(this._('#add-recipient-modal'), {
                                                            disableScroll: true,
                                                            onClose: (modal) => {
                                                                this.loading = false;
                                                            },
                                                        });
                                                    }}" 
                                                    title="${i18n.t('show-requests.add-recipient-button-text')}"
                                >
                                    ${i18n.t('show-requests.add-recipient-button-text')}
                            </dbp-loading-button>
                            <dbp-loading-button id="edit-recipient-btn"
                                                    ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                    value="${i18n.t('show-requests.edit-recipient-button-text')}" 
                                                    @click="${(event) => {
                                                        console.log("on edit recipient clicked");
                                                        this.showListView = false;
                                                        this.showDetailsView = false;
                                                        this.showEditRecipientView = true;
                                                    }}" 
                                                    title="${i18n.t('show-requests.edit-recipient-button-text')}"
                                >
                                    ${i18n.t('show-requests.edit-recipient-button-text')}
                            </dbp-loading-button>
                            </div>
                            <div class="request-buttons">
                                <div class="edit-buttons">
                                    <dbp-loading-button id="delete-btn" 
                                                        ?disabled="${this.loading || this.currentItem.dateSubmitted}" 
                                                        value="${i18n.t('show-requests.delete-button-text')}" 
                                                        @click="${(event) => { this.deleteRequest(event, this.currentItem); }}" 
                                                        title="${i18n.t('show-requests.delete-button-text')}"
                                    >
                                        ${i18n.t('show-requests.delete-button-text')}
                                    </dbp-loading-button>
                                </div>
                                <div class="submit-button">
                                    <dbp-loading-button type="is-primary"
                                                        id="submit-btn" 
                                                        ?disabled="${this.loading || this.currentItem.dateSubmitted}" 
                                                        value="${i18n.t('show-requests.submit-button-text')}" 
                                                        @click="${(event) => { this.submitRequest(event, this.currentItem); }}" 
                                                        title="${i18n.t('show-requests.submit-button-text')}"
                                    >
                                        ${i18n.t('show-requests.submit-button-text')}
                                    </dbp-loading-button>
                                </div>
                            </div>
                        </div>
                    ` : ``}
                </div>

                <span class="back-navigation ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView || this.showDetailsView })}">
                    <a href="#" title="${i18n.t('show-requests.back-to-recipients-list')}"
                       @click="${(e) => {
                           this.showListView = false;
                           this.showDetailsView = true;
                           this.showEditRecipientView = false;
                           this.currentRecipient = null;
                       }}"
                    >
                        <dbp-icon name="chevron-left"></dbp-icon>
                        ${i18n.t('show-requests.back-to-recipients-list')}.
                    </a>
                </span>

                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView || this.showDetailsView })}">
                    ${i18n.t('show-requests.recipients')}:
                </h3>
                
                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView || this.showDetailsView })}">
                    ${ this.currentItem && this.currentItem.recipients ? html`
                        <div class="request-item details">
                            ${this.currentItem.recipients.map(j => html`
                                <div class="recipient-entry">
                                    <div class="recipient-data">
                                        <strong>${j.familyName}</strong> ${j.givenName}<br>
                                        ${j.postalCode} ${j.addressLocality}<br>
                                        ${j.streetAddress} ${j.buildingNumber}<br>
                                        ${j.addressCountry}
                                    </div>
                                    <dbp-loading-button class="edit-recipient-btn"
                                                    ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                    value="${i18n.t('show-requests.edit-recipient-button-text')}" 
                                                    @click="${(event) => {
                                                        console.log("on edit recipient clicked");
                                                        this.currentRecipient = j;
                                                        MicroModal.show(this._('#edit-recipient-modal'), {
                                                            disableScroll: true,
                                                            onClose: (modal) => {
                                                                this.loading = false;
                                                                this.currentRecipient = null;
                                                            },
                                                        });
                                                    }}" 
                                                    title="${i18n.t('show-requests.edit-recipient-button-text')}"
                                        >
                                            ${i18n.t('show-requests.edit-recipient-button-text')}
                                    </dbp-loading-button>
                                    <div class="border"></div>
                                </div>
                            `)}
                            <div class="no-recipients ${classMap({hidden: !this.isLoggedIn() || this.currentItem.recipients.length !== 0})}">${i18n.t('show-requests.no-recipients-text')}</div>
                            <div class="rec-2-btns">
                                <dbp-loading-button id="add-recipient-2-btn"
                                                    ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                    value="${i18n.t('show-requests.add-recipient-button-text')}" 
                                                    @click="${(event) => {
                                                        console.log("on add recipient clicked");
                                                        MicroModal.show(this._('#add-recipient-modal'), {
                                                            disableScroll: true,
                                                            onClose: (modal) => {
                                                                this.loading = false;
                                                            },
                                                        });
                                                    }}" 
                                                    title="${i18n.t('show-requests.add-recipient-button-text')}"
                                >${i18n.t('show-requests.add-recipient-button-text')}</dbp-loading-button>
                            </div>
                        </div>
                    ` : `` }
                </div>
            </div>
            
            <div class="modal micromodal-slide" id="edit-sender-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div
                            class="modal-container"
                            id="edit-sender-modal-box"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-sender-modal-title">
                        <header class="modal-header">
                            <h3 id="edit-sender-modal-title">
                                ${i18n.t('show-requests.edit-sender-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#edit-sender-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="edit-sender-modal-content">
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-fn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-fn-dialog"
                                            id="tf-edit-sender-fn-dialog"
                                            value="${this.currentItem ? this.currentItem.senderFamilyName : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-gn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-gn-dialog"
                                            id="tf-edit-sender-gn-dialog"
                                            value="${this.currentItem ? this.currentItem.senderGivenName : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-ac-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-ac-dialog"
                                            id="tf-edit-sender-ac-dialog"
                                            maxlength="2"
                                            value="${this.currentItem ? this.currentItem.senderAddressCountry : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-pc-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-pc-dialog"
                                            id="tf-edit-sender-pc-dialog"
                                            value="${this.currentItem ? this.currentItem.senderPostalCode : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-al-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-al-dialog"
                                            id="tf-edit-sender-al-dialog"
                                            value="${this.currentItem ? this.currentItem.senderAddressLocality : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-sa-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-sa-dialog"
                                            id="tf-edit-sender-sa-dialog"
                                            value="${this.currentItem ? this.currentItem.senderStreetAddress : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-bn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-bn-dialog"
                                            id="tf-edit-sender-bn-dialog"
                                            value="${this.currentItem ? this.currentItem.senderBuildingNumber : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn">
                                <button
                                        class="button"
                                        data-micromodal-close
                                        aria-label="Close this dialog window"
                                        @click="${() => {
                                            MicroModal.close(this._('#edit-sender-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-sender-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-sender-confirm-btn"
                                        @click="${() => {
                                            this.confirmEditSender().then(r => {
                                                MicroModal.close(this._('#edit-sender-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.edit-sender-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
            
            <div class="modal micromodal-slide" id="add-recipient-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div class="modal-container"
                         id="add-recipient-modal-box"
                         role="dialog"
                         aria-modal="true"
                         aria-labelledby="add-recipient-modal-title">
                        <header class="modal-header">
                            <h3 id="add-recipient-modal-title">
                                ${i18n.t('show-requests.add-recipient-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#add-recipient-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="add-recipient-modal-content">
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-fn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-fn-dialog"
                                            id="tf-add-recipient-fn-dialog"
                                            value="Mustermann"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-gn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-gn-dialog"
                                            id="tf-add-recipient-gn-dialog"
                                            value="Max"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-ac-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-ac-dialog"
                                            id="tf-add-recipient-ac-dialog"
                                            value="AT"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-pc-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-pc-dialog"
                                            id="tf-add-recipient-pc-dialog"
                                            value="8010"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-al-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-al-dialog"
                                            id="tf-add-recipient-al-dialog"
                                            value="Graz"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-sa-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-sa-dialog"
                                            id="tf-add-recipient-sa-dialog"
                                            value="Am Grund"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-bn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-recipient-bn-dialog"
                                            id="tf-add-recipient-bn-dialog"
                                            value="1"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn">
                                <button
                                        class="button"
                                        data-micromodal-close
                                        aria-label="Close this dialog window"
                                        @click="${() => {
                                            MicroModal.close(this._('#add-recipient-modal'));
                                        }}">
                                    ${i18n.t('show-requests.add-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="add-recipient-confirm-btn"
                                        @click="${() => {
                                            this.addRecipientToRequest().then(r => {
                                                MicroModal.close(this._('#add-recipient-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.add-recipient-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
            
            <div class="modal micromodal-slide" id="edit-recipient-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div class="modal-container"
                         id="edit-recipient-modal-box"
                         role="dialog"
                         aria-modal="true"
                         aria-labelledby="edit-recipient-modal-title">
                        <header class="modal-header">
                            <h3 id="edit-recipient-modal-title">
                                ${i18n.t('show-requests.edit-recipient-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#edit-recipient-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="edit-recipient-modal-content">
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-fn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-fn-dialog"
                                            id="tf-edit-recipient-fn-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.familyName : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-gn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-gn-dialog"
                                            id="tf-edit-recipient-gn-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.givenName : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-ac-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-ac-dialog"
                                            id="tf-edit-recipient-ac-dialog"
                                            maxlength="2"
                                            value="${this.currentRecipient ? this.currentRecipient.addressCountry : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-pc-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-pc-dialog"
                                            id="tf-edit-recipient-pc-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.postalCode : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-al-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-al-dialog"
                                            id="tf-edit-recipient-al-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.addressLocality : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-sa-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-sa-dialog"
                                            id="tf-edit-recipient-sa-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.streetAddress : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-bn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-recipient-bn-dialog"
                                            id="tf-edit-recipient-bn-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.buildingNumber : ``}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn">
                                <button
                                        class="button"
                                        data-micromodal-close
                                        aria-label="Close this dialog window"
                                        @click="${() => {
                                            MicroModal.close(this._('#edit-recipient-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-recipient-confirm-btn"
                                        @click="${() => {
                                            this.updateRecipient().then(r => {
                                                MicroModal.close(this._('#edit-recipient-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }
}

commonUtils.defineCustomElement('dbp-show-requests', ShowRequests);

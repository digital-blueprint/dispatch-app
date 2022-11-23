import {createInstance} from './i18n.js';
import {css, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import DBPDispatchLitElement from "./dbp-dispatch-lit-element";
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {LoadingButton, IconButton, Icon, MiniSpinner, InlineNotification} from "@dbp-toolkit/common";
import {PersonSelect} from "@dbp-toolkit/person-select";
import {ResourceSelect} from "@dbp-toolkit/resource-select";
import {classMap} from "lit/directives/class-map.js";
import { send } from '@dbp-toolkit/common/notification';
import {Activity} from './activity.js';
import metadata from './dbp-create-request.metadata.json';
import * as dispatchStyles from './styles';
import * as dispatchHelper from './utils';
import {FileSource} from '@dbp-toolkit/file-handling';
import MicroModal from './micromodal.es';
import {humanFileSize} from '@dbp-toolkit/common/i18next';


class CreateRequest extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.activity = new Activity(metadata);
        this.entryPointUrl = '';

        this.currentItem = {};

        this.currentItem.files = [];
        this.currentItem.recipients = [];

        this.currentRecipient = {};

        this.currentItem.senderGivenName = "";
        this.currentItem.senderFamilyName = "";
        this.currentItem.senderAddressCountry = "";
        this.currentItem.senderPostalCode = "";
        this.currentItem.senderAddressLocality = "";
        this.currentItem.senderStreetAddress = "";
        this.currentItem.senderBuildingNumber = "";

        this.subject = '';

        this.showDetailsView = false;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

        this.organization = "";
        this.organizationId = "";

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
            'dbp-icon-button': IconButton,
            'dbp-inline-notification': InlineNotification,
            'dbp-file-source': FileSource,
            'dbp-person-select': PersonSelect,
            'dbp-resource-select': ResourceSelect
        };
    }

    static get properties() {
        return {
            ...super.properties,
            lang: {type: String},
            entryPointUrl: { type: String, attribute: 'entry-point-url' },

            currentItem: { type: Object, attribute: false },
            currentRecipient: { type: Object, attribute: false },

            subject: {type: String, attribute: false},

            emptyFieldsGiven: {type: Boolean, attribute: false},
            showDetailsView: {type: Boolean, attribute: false},
            hasSender: {type: Boolean, attribute: false},
            hasRecipients: {type: Boolean, attribute: false},

            organization: {type: String, attribute: false},
            organizationId: {type: String, attribute: false},

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

    async processCreateDispatchRequest() {
        const i18n = this._i18n;
        try {
            let response = await this.sendCreateDispatchRequest();
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 201) {
                // send({
                //     "summary": i18n.t('create-request.successfully-requested-title'),
                //     "body": i18n.t('create-request.successfully-requested-text'),
                //     "type": "success",
                //     "timeout": 5,
                // });
                this.currentItem = responseBody;
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

    async _onCreateRequestButtonClicked(event) {
        MicroModal.show(this._('#add-subject-modal'), {
            disableScroll: true,
            onClose: (modal) => {
                this.loading = false;
            },
        });
    }

    getCurrentTime() {
        let date = new Date();
        let currentHours = ('0' + (date.getHours() + 1)).slice(-2);
        let currentMinutes = ('0' + date.getMinutes()).slice(-2);

        return currentHours + ':' + currentMinutes;
    }

    saveRequest() {
        this.clearAll();

        const i18n = this._i18n;
        send({
            "summary": i18n.t('create-request.successfully-saved-title'),
            "body": i18n.t('create-request.successfully-saved-text'),
            "type": "success",
            "timeout": 5,
        });
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
            /*${commonStyles.getRadioAndCheckboxCss()}*/
            ${dispatchStyles.getShowDispatchRequestsCss()}
            ${dispatchStyles.getDispatchRequestStyles()}

            h2:first-child {
                margin-top: 0;
            }

            h2 {
                margin-bottom: 10px;
            }
            
            .details.header {
                display: block;
                grid-template-columns: none;
                padding-bottom: 1.5em;
                border-bottom: 1px solid var(--dbp-override-muted);
                text-align: start;
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

                <dbp-inline-notification class="${classMap({hidden: !this.hasEmptyFields})}"
                                         type="warning"
                                         body="${i18n.t('create-request.empty-fields-given')}">
                </dbp-inline-notification>

                <div class="btn ${classMap({hidden: this.showDetailsView})}">
                    <dbp-loading-button id="send-btn" type="is-primary"
                                        value="${i18n.t('create-request.create-request-button-text')}"
                                        @click="${this._onCreateRequestButtonClicked}"
                                        title="${i18n.t('create-request.create-request-button-text')}"
                                        ?disabled="false"
                    ></dbp-loading-button>
                </div>
                
                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView })}">
                    ${i18n.t('create-request.create-dispatch-order')}:
                </h3>

                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView })}">

                    ${ this.currentItem && !this.currentItem.dateSubmitted ? html`
                                <div class="left-button">
                                    <dbp-loading-button id="save-btn" 
                                                        ?disabled="${this.loading || this.currentItem.dateSubmitted}" 
                                                        value="${i18n.t('show-requests.save-button-text')}" 
                                                        @click="${(event) => { this.saveRequest(event, this.currentItem); }}" 
                                                        title="${i18n.t('show-requests.save-button-text')}"
                                    >
                                        ${i18n.t('show-requests.save-button-text')}
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
                                </div>` : ``
                    }
                    
                    ${ this.currentItem ? html`
                        <div class="request-item details">
                            <div class="details header">
                                <div>
                                    <div class="section-titles">${i18n.t('create-request.request-subject')}</div>
                                    <div>${this.subject}</div>
                                    <div class="no-subject ${classMap({hidden: !this.isLoggedIn() || this.subject.length !== 0})}">${i18n.t('show-requests.empty-subject-text')}</div>
                                </div>
                            </div>
                            
                            <div class="details sender ${classMap({hidden: !this.hasSubject})}">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.sender')}</div>
                                    ${!this.currentItem.dateSubmitted && this.hasSender ? html`
                                        <dbp-icon-button id="edit-btn"
                                                     ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                     @click="${(event) => {
                                                         console.log("on edit sender clicked");
                                                         MicroModal.show(this._('#edit-sender-modal'), {
                                                             disableScroll: true,
                                                             onClose: (modal) => {
                                                                 this.loading = false;
                                                             },
                                                         });
                                                     }}"
                                                     title="${i18n.t('show-requests.edit-sender-button-text')}"
                                                     icon-name="pencil"></dbp-icon-button>` : ``}
                                </div>
                                <div class="sender-data">
                                    ${this.organization ? html`${this.organizationId} ${this.organization}` : html`
                                        ${this.currentItem.senderFamilyName ? html`${this.currentItem.senderFamilyName}` : ``}
                                        ${this.currentItem.senderFamilyName && this.currentItem.senderGivenName
                                                ? html` ${this.currentItem.senderGivenName}` :
                                                html`${this.currentItem.senderGivenName ? html`${this.currentItem.senderGivenName}` : ``}
                                        `}
                                    `}
                                    ${this.currentItem.senderStreetAddress ? html`<br>${this.currentItem.senderStreetAddress}` : ``}
                                    ${this.currentItem.senderBuildingNumber ? html` ${this.currentItem.senderBuildingNumber}` : ``}
                                    ${this.currentItem.senderPostalCode ? html`<br>${this.currentItem.senderPostalCode}` : ``}
                                    ${this.currentItem.senderAddressLocality ? html` ${this.currentItem.senderAddressLocality}` : ``}
                                    ${this.currentItem.senderAddressCountry ? html`<br>${dispatchHelper.getCountryMapping()[this.currentItem.senderAddressCountry]}` : ``}
                                </div>

                                <div class="no-sender ${classMap({hidden: !this.isLoggedIn() || this.currentItem.senderFamilyName || this.organization !== ''})}">${i18n.t('show-requests.empty-sender-text')}</div>

                            </div>
                            
                            <div class="details files ${classMap({hidden: !this.hasSender || !this.hasSubject})}">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.files')} <span class="section-title-counts">
                                            ${this.currentItem.files.length !== 0 ? `(` + this.currentItem.files.length + `)` : ``}</span>
                                    </div>
                                    ${!this.currentItem.dateSubmitted ? html`
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
                                        </dbp-loading-button>` : ``
                                    }
                                </div>
                                <div class="files-data">
                                    ${this.currentItem.files.map(file => html`
                                        <div class="file card">
                                            <div class="left-side">
                                                <div>${file.name}</div>
                                                <div>${humanFileSize(file.contentSize)}</div>
                                                <div>${file.fileFormat}</div>
                                                <div>${this.convertToReadableDate(file.dateCreated)}</div>
                                            </div>
                                            <div class="right-side">
                                                <dbp-icon-button id="show-file-btn"
                                                    @click="${(event) => {
                                                        console.log("on show file clicked");
                                                        //TODO show file viewer with pdf
                                                    }}"
                                                    title="${i18n.t('show-requests.show-file-button-text')}"
                                                    icon-name="keyword-research"></dbp-icon-button>
                                                ${!this.currentItem.dateSubmitted ? html`
                                                   <dbp-icon-button id="delete-file-btn"
                                                                ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                                @click="${(event) => {
                                                                    console.log("on delete file clicked");
                                                                    this.deleteFile(file);
                                                                }}"
                                                                title="${i18n.t('show-requests.delete-file-button-text')}" 
                                                                icon-name="trash"></dbp-icon-button>` : ``
                                                }
                                            </div>
                                        </div>
                                    `)}
                                    <div class="no-files ${classMap({hidden: !this.isLoggedIn() || this.currentItem.files.length !== 0})}">${i18n.t('show-requests.empty-files-text')}</div>
                                   
                                </div>
                            </div>

                            <div class="details recipients ${classMap({hidden: !this.hasSender || !this.hasSubject})}">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.recipients')} <span class="section-title-counts">
                                            ${this.currentItem.recipients.length !== 0 ? `(` + this.currentItem.recipients.length + `)` : ``}</span>
                                    </div>
                                    ${!this.currentItem.dateSubmitted ? html`
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
                                                        title="${i18n.t('show-requests.add-recipient-button-text')}">
                                            ${i18n.t('show-requests.add-recipient-button-text')}
                                        </dbp-loading-button>` : ``
                                    }
                                </div>
                            </div>
                            
                            <div class="recipients-data ${classMap({hidden: !this.hasSender || !this.hasSubject})}">
                                ${this.currentItem.recipients.map(recipient => html`
                                    <div class="recipient card">
                                        <div class="left-side">
                                            <div>${recipient.familyName} ${recipient.givenName}</div>
                                            <div>${recipient.streetAddress} ${recipient.buildingNumber}</div>
                                            <div>${recipient.postalCode} ${recipient.addressLocality}</div>
                                            <div>${recipient.addressCountry}</div>
                                        </div>
                                        <div class="right-side">
                                            <dbp-icon-button id="show-recipient-btn"
                                                             @click="${(event) => {
                                                                 console.log("on show recipient clicked");
                                                                 this.currentRecipient = recipient;

                                                                 MicroModal.show(this._('#show-recipient-modal'), {
                                                                     disableScroll: true,
                                                                     onClose: (modal) => {
                                                                         this.loading = false;
                                                                         this.currentRecipient = null;
                                                                     },
                                                                 });
                                                             }}"
                                                             title="${i18n.t('show-requests.show-recipient-button-text')}"
                                                             icon-name="keyword-research"></dbp-icon></dbp-icon-button>
                                                ${!this.currentItem.dateSubmitted ? html`
                                                    <dbp-icon-button id="edit-recipient-btn"
                                                                 ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                                 @click="${(event) => {
                                                                     console.log("on edit recipients clicked");
                                                                     this.currentRecipient = recipient;
                                                                     MicroModal.show(this._('#edit-recipient-modal'), {
                                                                         disableScroll: true,
                                                                         onClose: (modal) => {
                                                                             this.loading = false;
                                                                             this.currentRecipient = null;
                                                                         },
                                                                     });
                                                                 }}"
                                                                 title="${i18n.t('show-requests.edit-recipients-button-text')}"
                                                                 icon-name="pencil"></dbp-icon-button>
                                                    <dbp-icon-button id="delete-recipient-btn"
                                                                 ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                                 @click="${(event) => {
                                                                     console.log("on delete recipient clicked");
                                                                     this.deleteRecipient(recipient);
                                                                 }}"
                                                                 title="${i18n.t('show-requests.delete-recipient-button-text')}"
                                                                 icon-name="trash"></dbp-icon-button>` : ``
                                                }
                                        </div>
                                    </div>
                                `)}
                                <div class="no-recipients ${classMap({hidden: !this.isLoggedIn() || !this.hasSender || !this.hasSubject || this.currentItem.recipients.length !== 0})}">${i18n.t('show-requests.no-recipients-text')}</div>
                              
                            </div>
                        </div>
                    ` : ``}
            </div>
            </div>
            
            ${this.addFilePicker()}

            ${this.addEditSenderModal()}

            ${this.addAddRecipientModal()}

            ${this.addEditRecipientModal()}

            ${this.addShowRecipientModal()}
                
            <div class="modal micromodal-slide" id="add-subject-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div
                            class="modal-container"
                            id="add-subject-modal-box"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="add-subject-modal-title">
                        <header class="modal-header">
                            <h3 id="add-subject-modal-title">
                                ${i18n.t('create-request.empty-subject')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#add-subject-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="add-subject-modal-content">
                            <div class="modal-content-item">
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-subject-fn-dialog"
                                            id="tf-add-subject-fn-dialog"
                                            value="${this.subject ? this.subject : ``}"
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
                                            this.confirmAddSubject().then(r => {
                                                MicroModal.close(this._('#add-subject-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.add-subject-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="add-subject-confirm-btn"
                                        @click="${() => {
                                            this.confirmAddSubject().then(r => {
                                                MicroModal.close(this._('#add-subject-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.add-subject-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
            
            <div class="modal micromodal-slide" id="add-sender-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div
                            class="modal-container"
                            id="add-sender-modal-box"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="add-sender-modal-title">
                        <header class="modal-header">
                            <h3 id="add-sender-modal-title">
                                ${i18n.t('show-requests.add-sender-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#add-sender-modal'));
                                        this.hasSender = true;
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="add-sender-modal-content">
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-organization-title')}
                                </div>
                                <div>
                                    <dbp-resource-select
                                        subscribe="lang:lang,entry-point-url:entry-point-url,auth:auth"
                                        resource-path="base/organizations"
                                        @change=${(event) => {
                                            this.processSelectedSender(event);
                                    }}></dbp-resource-select>
                                </div>
                            </div>

                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-or-title')}
                                </div>
                            </div>
                            
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-fn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-add-sender-fn-dialog"
                                            id="tf-add-sender-fn-dialog"
                                            value="${this.organizationId ? this.organizationId : this.currentItem.senderFamilyName}"
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
                                            name="tf-add-sender-gn-dialog"
                                            id="tf-add-sender-gn-dialog"
                                            value="${this.organization ? this.organization : this.currentItem.senderGivenName}"
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
                                            name="tf-add-sender-sa-dialog"
                                            id="tf-add-sender-sa-dialog"
                                            value="${this.currentItem.senderStreetAddress}"
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
                                            name="tf-add-sender-bn-dialog"
                                            id="tf-add-sender-bn-dialog"
                                            value="${this.currentItem.senderBuildingNumber}"
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
                                            name="tf-add-sender-pc-dialog"
                                            id="tf-add-sender-pc-dialog"
                                            value="${this.currentItem.senderPostalCode}"
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
                                            name="tf-add-sender-al-dialog"
                                            id="tf-add-sender-al-dialog"
                                            value="${this.currentItem.senderAddressLocality}"
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
                                    <select id="add-sender-country-select" class="country-select">
                                        ${dispatchHelper.getCountryList()}
                                    </select>
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
                                            MicroModal.close(this._('#add-sender-modal'));
                                            this.hasSender = true;
                                        }}">
                                    ${i18n.t('show-requests.edit-sender-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="add-sender-confirm-btn"
                                        @click="${() => {
                                            this.confirmAddSender().then(r => {
                                                MicroModal.close(this._('#add-sender-modal'));
                                                this.hasSender = true;
                                            });
                                        }}">
                                    ${i18n.t('show-requests.edit-sender-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }
}

commonUtils.defineCustomElement('dbp-create-request', CreateRequest);

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
        this.groupId = '';

        this.mayRead = false;
        this.mayWrite = false;
        this.organizationLoaded = false;

        this.showDetailsView = false;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

        this.requestCreated = false;

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
            groupId: {type: String, attribute: false},

            emptyFieldsGiven: {type: Boolean, attribute: false},
            showDetailsView: {type: Boolean, attribute: false},
            hasSender: {type: Boolean, attribute: false},
            hasRecipients: {type: Boolean, attribute: false},
            requestCreated: {type: Boolean, attribute: false},

            organization: {type: String, attribute: false},
            organizationId: {type: String, attribute: false},

            mayWrite: { type: Boolean, attribute: false },
            mayRead: { type: Boolean, attribute: false },
            organizationLoaded: { type: Boolean, attribute: false },

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
                send({
                    "summary": i18n.t('create-request.successfully-requested-title'),
                    "body": i18n.t('create-request.successfully-requested-text'),
                    "type": "success",
                    "timeout": 5,
                });
                this.currentItem = responseBody;
                // console.log(this.currentItem);
                this.requestCreated = true;
            } else if (response.status === 403) {
                send({
                    "summary": i18n.t('create-request.error-requested-title'),
                    "body": i18n.t('error-not-permitted'),
                    "type": "danger",
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
            this._('#create-btn').stop();
        }
    }

    _onCreateRequestButtonClicked(event) {
        this._('#create-btn').start();

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
        this.requestCreated = false;
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
            
            .choose-and-create-btns {
                display: flex;
                gap: 5px;
            }

            .choose-and-create-btns dbp-resource-select {
                width: 30em;
                margin-top: 1px;
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
                
                <div >
                    ${i18n.t('show-requests.organization-select-description')}
                    <div class="choose-and-create-btns">
                        <dbp-resource-select
                                    id="create-resource-select"
                                    subscribe="lang,entry-point-url,auth"
                                    lang="${this.lang}"
                                    resource-path="dispatch/groups?lang=${this.lang}"
                                    @change=${(event) => {
                                        this.processSelectedSender(event);
                                    }}
                        ></dbp-resource-select>
                        <dbp-loading-button id="create-btn" type="is-primary"
                                            value="${i18n.t('create-request.create-request-button-text')}"
                                            @click="${(event) => { this._onCreateRequestButtonClicked(event); }}"
                                            title="${i18n.t('create-request.create-request-button-text')}"
                                            ?disabled="${!this.mayWrite}"
                                            class="${classMap({hidden: this.showDetailsView})}"
                        ></dbp-loading-button>
                    </div>
                </div>

                <div class="no-access-notification">
                    <dbp-inline-notification class="${classMap({ hidden: !this.isLoggedIn() || this.isLoading() || this.mayWrite || this.requestCreated || !this.organizationLoaded })}"
                                             type="danger"
                                             body="${this.mayRead ? i18n.t('create-request.error-no-writes') : i18n.t('error-no-read')}">
                    </dbp-inline-notification>
                </div>

                <div class="back-container">
                    <span class="back-navigation ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView })}">
                        <a href="#" title="${i18n.t('create-request.back-to-create')}"
                           @click="${(e) => {
                               this.saveRequest(e, this.currentItem);
                           }}"
                        >
                            <dbp-icon name="chevron-left"></dbp-icon>
                            ${i18n.t('create-request.back-to-create')}
                        </a>
                    </span>
                </div>
                
                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView })}">
                    ${i18n.t('create-request.create-dispatch-order')}:
                </h3>

                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView })}">

                    ${ this.currentItem && !this.currentItem.dateSubmitted ? html`
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
                        <div class="request-item details ${classMap({hidden: !this.showDetailsView})}">
                            <div class="details header">
                                <div>
                                    <div class="header-btn">
                                        <div class="section-titles">
                                            ${i18n.t('create-request.request-subject')}
                                        ${!this.currentItem.dateSubmitted && this.hasSender ? html`
                                            <dbp-icon-button id="edit-subject-btn"
                                                         ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                         @click="${(event) => {
                                                                MicroModal.show(this._('#edit-subject-modal'), {
                                                                    disableScroll: true,
                                                                    onClose: (modal) => {
                                                                        this.loading = false;
                                                                    },
                                                                });
                                                            }}"
                                                         title="${i18n.t('show-requests.edit-subject-button-text')}"
                                                         icon-name="pencil"></dbp-icon-button>` : ``}
                                        </div>
                                    </div>
                                    <div>${this.currentItem.name}</div>
                                    <div class="no-subject ${classMap({hidden: !this.isLoggedIn() || this.subject.length !== 0})}">${i18n.t('show-requests.empty-subject-text')}</div>
                                </div>
                            </div>
                            
                            <div class="details sender ${classMap({hidden: !this.hasSubject})}">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.sender')}</div>
                                    ${!this.currentItem.dateSubmitted && this.hasSender ? html`
                                        <dbp-icon-button id="edit-sender-btn"
                                                     ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                     @click="${(event) => {
                                                         console.log("on edit sender clicked");
                                                         if (this.currentItem.senderAddressCountry !== '') {
                                                             this._('#edit-sender-country-select').value = this.currentItem.senderAddressCountry;
                                                         }
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
                                    ${this.currentItem.senderGivenName ? html`${this.currentItem.senderGivenName}` : ``}
                                    ${this.currentItem.senderFamilyName && this.currentItem.senderGivenName
                                            ? html` ${this.currentItem.senderFamilyName}` :
                                            html`${this.currentItem.senderFamilyName ? html`${this.currentItem.senderFamilyName}` : ``}
                                    `}
                                    ${this.currentItem.senderStreetAddress ? html`<br>${this.currentItem.senderStreetAddress}` : ``}
                                    ${this.currentItem.senderBuildingNumber ? html` ${this.currentItem.senderBuildingNumber}` : ``}
                                    ${this.currentItem.senderPostalCode ? html`<br>${this.currentItem.senderPostalCode}` : ``}
                                    ${this.currentItem.senderAddressLocality ? html` ${this.currentItem.senderAddressLocality}` : ``}
                                    ${this.currentItem.senderAddressCountry ? html`<br>${dispatchHelper.getCountryMapping()[this.currentItem.senderAddressCountry]}` : ``}
                                </div>

                                <div class="no-sender ${classMap({hidden: !this.isLoggedIn() || this.currentItem.senderFamilyName})}">${i18n.t('show-requests.empty-sender-text')}</div>

                            </div>
                            
                            <div class="details files ${classMap({hidden: !this.hasSender || !this.hasSubject})}">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.files')} <span class="section-title-counts">
                                            ${this.currentItem.files && this.currentItem.files.length !== 0 ? `(` + this.currentItem.files.length + `)` : ``}</span>
                                    </div>
                                    ${!this.currentItem.dateSubmitted ? html`
                                         <dbp-loading-button id="add-files-btn"
                                                        ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                        value="${i18n.t('show-requests.add-files-button-text')}" 
                                                        @click="${(event) => {
                                                            this.openFileSource();
                                                        }}" 
                                                        title="${i18n.t('show-requests.add-files-button-text')}"
                                        >
                                            ${i18n.t('show-requests.add-files-button-text')}
                                        </dbp-loading-button>` : ``
                                    }
                                </div>
                                <div class="files-data">
                                    ${this.currentItem.files && this.currentItem.files.map(file => html`
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
                                                    class="hidden" <!--TODO -->
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
                                    <div class="no-files ${classMap({hidden: !this.isLoggedIn() || (this.currentItem.files && this.currentItem.files.length !== 0)})}">${i18n.t('show-requests.empty-files-text')}</div>
                                   
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
                                                            this.preloadSelectedRecipient().then(() => {
                                                                MicroModal.show(this._('#add-recipient-modal'), { //TODO set focus to:  this._('#recipient-selector')
                                                                    disableScroll: true,
                                                                    disableFocus: false,
                                                                    onClose: (modal) => {
                                                                        this.loading = false;
                                                                        this._('#add-recipient-btn').stop();
                                                                    },
                                                                });
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
                                            <div>${recipient.givenName} ${recipient.familyName}</div>
                                            <div>${recipient.streetAddress} ${recipient.buildingNumber}</div>
                                            <div>${recipient.postalCode} ${recipient.addressLocality}</div>
                                            <div>${dispatchHelper.getCountryMapping()[recipient.addressCountry]}</div>
                                        </div>
                                        <div class="right-side">
                                            <dbp-icon-button id="show-recipient-btn"
                                                             @click="${(event) => {
                                                                 this.currentRecipient = recipient;
                                                                 this._('#show-recipient-btn').start();
                                                                 try {
                                                                     this.fetchDetailedRecipientInformation(recipient.identifier).then(() => {
                                                                         MicroModal.show(this._('#show-recipient-modal'), {
                                                                             disableScroll: true,
                                                                             onClose: (modal) => {
                                                                                 this.loading = false;
                                                                                 this.currentRecipient = {};
                                                                                 this._('#show-recipient-btn').stop();
                                                                             },
                                                                         });
                                                                     });
                                                                 } catch {
                                                                     this._('#show-recipient-btn').stop();
                                                                 }
                                                             }}"
                                                             title="${i18n.t('show-requests.show-recipient-button-text')}"
                                                             icon-name="keyword-research"></dbp-icon></dbp-icon-button>
                                            ${!this.currentItem.dateSubmitted ? html`
                                                <dbp-icon-button id="edit-recipient-btn"
                                                             ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                             @click="${(event) => {
                                                                 this._('#edit-recipient-btn').start();
                                                                 try {
                                                                     this.fetchDetailedRecipientInformation(recipient.identifier).then(() => {
                                                                         this._('#edit-recipient-country-select').value = this.currentRecipient.addressCountry;
                                                                         this._('#tf-edit-recipient-birthdate').value = this.currentRecipient.birthDate;
                                                                         MicroModal.show(this._('#edit-recipient-modal'), {
                                                                             disableScroll: true,
                                                                             onClose: (modal) => {
                                                                                 this.loading = false;
                                                                                 this.currentRecipient = {};
                                                                             },
                                                                         });
                                                                     });
                                                                 } catch {
                                                                     this._('#edit-recipient-btn').stop();
                                                                 }
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

            ${this.addEditSenderModal(this.currentItem)}

            ${this.addAddRecipientModal()}

            ${this.addEditRecipientModal()}

            ${this.addShowRecipientModal()}

            ${this.addEditSubjectModal()}
                
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
                            <div class="modal-content-item">
                                <div>
                                    ${i18n.t('show-requests.add-subject-description')}
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
                                            MicroModal.close(this._('#add-subject-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="add-subject-confirm-btn"
                                        @click="${() => {
                                            // this._('#add-subject-confirm-btn').disabled = true;
                                            MicroModal.close(this._('#add-subject-modal'));
                                            this.confirmAddSubject();
                                        }}">
                                    ${i18n.t('show-requests.add-subject-dialog-button-ok')}
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

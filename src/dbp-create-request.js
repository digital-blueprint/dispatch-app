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
import * as dispatchStyles from './styles';
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

        this.currentItem.senderGivenName = "";
        this.currentItem.senderFamilyName = "";
        this.currentItem.senderAddressCountry = "";
        this.currentItem.senderPostalCode = "";
        this.currentItem.senderAddressLocality = "";
        this.currentItem.senderStreetAddress = "";
        this.currentItem.senderBuildingNumber = "";

        this.currentItem.files = [];
        this.currentItem.recipients = [];

        this.senderGivenName = "";
        this.senderFamilyName = "";
        this.senderAddressCountry = "";
        this.senderPostalCode = "";
        this.senderAddressLocality = "";
        this.senderStreetAddress = "";
        this.senderBuildingNumber = "";

        this.subject = '';

        this.showDetailsView = false;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

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

            currentItem: { type: Object, attribute: false },

            senderGivenName: {type: String, attribute: false},
            senderFamilyName: {type: String, attribute: false},
            senderAddressCountry: {type: String, attribute: false},
            senderPostalCode: {type: String, attribute: false},
            senderAddressLocality: {type: String, attribute: false},
            senderStreetAddress: {type: String, attribute: false},
            senderBuildingNumber: {type: String, attribute: false},

            emptyFieldsGiven: {type: Boolean, attribute: false},
            showDetailsView: {type: Boolean, attribute: false},
            hasSender: {type: Boolean, attribute: false},
            hasRecipients: {type: Boolean, attribute: false},

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

    async _onSubmitRequstClicked(event, item) {

        this.submitRequest(event, item);

        this.showDetailsView = false;
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
                                </div>
                            </div>
                            
                            <div class="details sender ${classMap({hidden: !this.hasSubject})}">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.sender')}</div>
                                    ${!this.currentItem.dateSubmitted && this.hasSender ? html`
                                        <dbp-button id="edit-btn"
                                                    class="button is-icon"
                                                    ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                    value=""
                                                    @click="${(event) => {
                                                        console.log("on edit sender clicked");
                                                        MicroModal.show(this._('#edit-sender-modal'), {
                                                            disableScroll: true,
                                                            onClose: (modal) => {
                                                                this.loading = false;
                                                            },
                                                        });
                                                    }}"
                                                    title="${i18n.t('show-requests.edit-sender-button-text')}">
                                            <dbp-icon name="pencil"></dbp-icon>
                                        </dbp-button>` : ``}
                                </div>
                                <div class="sender-data">
                                    ${this.currentItem.senderFamilyName ? html`${this.currentItem.senderFamilyName}` : ``}
                                    ${this.currentItem.senderGivenName ? html` ${this.currentItem.senderGivenName}` : ``}
                                    ${this.currentItem.senderStreetAddress ? html`<br>${this.currentItem.senderStreetAddress}` : ``}
                                    ${this.currentItem.senderBuildingNumber ? html` ${this.currentItem.senderBuildingNumber}` : ``}
                                    ${this.currentItem.senderPostalCode ? html`<br>${this.currentItem.senderPostalCode}` : ``}
                                    ${this.currentItem.senderAddressLocality ? html` ${this.currentItem.senderAddressLocality}` : ``}
                                    ${this.currentItem.senderAddressCountry ? html`<br>${this.currentItem.senderAddressCountry}` : ``}
                                </div>
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
                                                <dbp-button id="show-file-btn"
                                                            class="button is-icon"
                                                            value=""
                                                            @click="${(event) => {
            console.log("on show file clicked");
            //TODO show file viewer with pdf
        }}"
                                                            title="${i18n.t('show-requests.show-file-button-text')}">
                                                    <dbp-icon name="keyword-research"></dbp-icon>
                                                </dbp-button>
                                                ${!this.currentItem.dateSubmitted ? html`
                                                    <dbp-button id="delete-file-btn"
                                                                class="button is-icon"
                                                                ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                                value=""
                                                                @click="${(event) => {
            console.log("on delete file clicked");
            this.deleteFile(file);
        }}"
                                                                title="${i18n.t('show-requests.delete-file-button-text')}">
                                                        <dbp-icon name="trash"></dbp-icon>
                                                    </dbp-button>` : ``
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
                                                <dbp-button id="show-recipient-btn"
                                                            class="button is-icon"
                                                            value=""
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
                                                            title="${i18n.t('show-requests.show-recipient-button-text')}">
                                                    <dbp-icon name="keyword-research"></dbp-icon>
                                                </dbp-button>
                                                ${!this.currentItem.dateSubmitted ? html`
                                                    <dbp-button id="edit-recipient-btn"
                                                                class="button is-icon"
                                                                 ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                                 value=""
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
                                                                 title="${i18n.t('show-requests.edit-recipients-button-text')}">
                                                         <dbp-icon name="pencil"></dbp-icon>
                                                     </dbp-button>
                                                    <dbp-button id="delete-recipient-btn"
                                                                class="button is-icon"
                                                                ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                                value=""
                                                                @click="${(event) => {
            console.log("on delete recipient clicked");
            this.deleteRecipient(recipient);
        }}"
                                                                title="${i18n.t('show-requests.delete-recipient-button-text')}">
                                                        <dbp-icon name="trash"></dbp-icon>
                                                    </dbp-button>` : ``
        }
                                        </div>
                                    </div>
                                `)}
                                <div class="no-recipients ${classMap({hidden: !this.isLoggedIn() || this.currentItem.recipients.length !== 0})}">${i18n.t('show-requests.no-recipients-text')}</div>
                              
                            </div>
                        </div>
                    ` : ``}
            </div>
                
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
                  button-label="${i18n.t('show-requests.filepicker-button-title')}"
                  number-of-files="1"
                  @dbp-file-source-file-selected="${this.onFileSelected}">
            </dbp-file-source>
                
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
                                            MicroModal.close(this._('#add-subject-modal'));
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
                                            MicroModal.close(this._('#add-sender-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-sender-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="add-sender-confirm-btn"
                                        @click="${() => {
                                            this.confirmAddSender().then(r => {
                                                MicroModal.close(this._('#add-sender-modal'));
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
            
            <div class="modal micromodal-slide" id="show-recipient-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div class="modal-container"
                         id="show-recipient-modal-box"
                         role="dialog"
                         aria-modal="true"
                         aria-labelledby="show-recipient-modal-title">
                        <header class="modal-header">
                            <h3 id="show-recipient-modal-title">
                                ${i18n.t('show-requests.show-recipient-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
            MicroModal.close(this._('#show-recipient-modal'));
        }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="show-recipient-modal-content">
                            <div class="detailed-recipient-modal-content-wrapper">
                                <div class="element-left first">
                                    ${i18n.t('show-requests.edit-recipient-fn-dialog-label')}:
                                </div>
                                <div class="element-right first">
                                    ${this.currentRecipient && this.currentRecipient.familyName ? this.currentRecipient.familyName : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-gn-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.givenName ? this.currentRecipient.givenName : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-ac-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.addressCountry ? this.currentRecipient.addressCountry : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-pc-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.postalCode ? this.currentRecipient.postalCode : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-al-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.addressLocality ? this.currentRecipient.addressLocality : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-sa-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.streetAddress ? this.currentRecipient.streetAddress : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-bn-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.buildingNumber ? this.currentRecipient.buildingNumber : ``}
                                </div>
                            </div>
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn"></div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }
}

commonUtils.defineCustomElement('dbp-create-request', CreateRequest);

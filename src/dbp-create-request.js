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
import {name as pkgName} from './../package.json';
import {TabulatorFull as Tabulator} from 'tabulator-tables';


class CreateRequest extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.activity = new Activity(metadata);
        this.entryPointUrl = '';

        this.requestList = [];

        this.currentItem = {};

        this.currentItem.files = [];
        this.currentItem.recipients = [];

        this.currentRecipient = {};

        this.currentItem.senderOrganizationName = "";
        this.currentItem.senderFullName = "";
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
        this.showListView = false;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

        this.requestCreated = false;
        this.singleFileProcessing = false;
        this.createRequestsLoading = false;
        this.fileList = [];
        this.createdRequestsIds = [];
        this.createdRequestsList = [];
        this.totalNumberOfCreatedRequestItems = 0;
        this.filesAdded = false;
        this.expanded = false;

        this.fileHandlingEnabledTargets = "local";
        this.nextcloudWebAppPasswordURL = "";
        this.nextcloudWebDavURL = "";
        this.nextcloudName = "";
        this.nextcloudFileURL = "";
        this.nextcloudAuthInfo = "";

        this.dispatchRequestsTable = null;
        this.totalNumberOfItems = 0;
        this.rowsSelected = false;

        this.boundSelectHandler = this.selectAllFiles.bind(this);
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

            totalNumberOfCreatedRequestItems: {type: Number, attribute: false},
            filesAdded: {type: Boolean, attribute: false},
            createRequestsLoading: {type: Boolean, attribute: false},
            expanded: { type: Boolean, attribute: false },

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
                    if (this.dispatchRequestsTable) {
                        this.dispatchRequestsTable.setLocale(this.lang);
                    }
                    break;
            }
        });

        super.update(changedProperties);
    }

    disconnectedCallback() {
        this.dispatchRequestsTable.off("rowClick");
        this.dispatchRequestsTable.off("dataLoaded");
        this.dispatchRequestsTable.off("pageLoaded");

        super.disconnectedCallback();
    }

    connectedCallback() {
        super.connectedCallback();
        this._loginStatus = '';
        this._loginState = [];
        this._loginCalled = false;

        this.updateComplete.then(() => {
            let paginationElement = this._('.tabulator-paginator');

            const i18n = this._i18n;
            const that = this;

            // see: http://tabulator.info/docs/5.1
            this.dispatchRequestsTable = new Tabulator(this._('#dispatch-requests-table'), {
                layout: 'fitColumns',
                placeholder: i18n.t('show-requests.no-table-data'),
                selectable: true,
                selectablePersistence: false, // disable persistent selections
                responsiveLayout: 'collapse',
                responsiveLayoutCollapseStartOpen: false,
                pagination: 'local',
                paginationSize: 10,
                paginationSizeSelector: true,
                paginationElement: paginationElement,
                columnHeaderVertAlign: 'bottom', // align header contents to bottom of cell
                columnDefaults: {
                    vertAlign: 'middle',
                    hozAlign: 'left',
                    resizable: false,
                },
                columns: [
                    {
                        title:
                            '<label id="select_all_wrapper" class="button-container select-all-icon">' +
                            '<input type="checkbox" id="select_all" name="select_all" value="select_all">' +
                            '<span class="checkmark" id="select_all_checkmark"></span>' +
                            '</label>',

                        field: 'type',
                        hozAlign: 'center',
                        width: 40,
                        headerSort: false,
                        responsive: 0,
                        widthGrow: 1,
                        headerClick: (e) => {
                            let allSelected = that.checkAllSelected();

                            if (allSelected) {
                                // that.dispatchRequestsTable.deselectRow("visible"));
                                this.dispatchRequestsTable.deselectRow();
                                this._('#select_all').checked = false;
                                this.rowsSelected = false;
                            } else {
                                that.dispatchRequestsTable.selectRow("visible");
                                this._('#select_all').checked = true;
                                this.rowsSelected = true;
                            }
                            e.preventDefault();
                        },
                    },
                    {
                        title: i18n.t('show-requests.table-header-details'),
                        field: 'details',
                        hozAlign: 'center',
                        width: 60,
                        headerSort: false,
                        responsive: 0,
                        widthGrow: 1,
                        formatter: 'responsiveCollapse'
                    },
                    {
                        title: i18n.t('show-requests.table-header-date-created'),
                        field: 'dateCreated',
                        responsive: 3,
                        widthGrow: 1,
                        minWidth: 160,
                        sorter: (a, b) => {
                            const a_timestamp = Date.parse(a);
                            const b_timestamp = Date.parse(b);
                            return a_timestamp - b_timestamp;
                        },
                        formatter: function (cell) {
                            const d = Date.parse(cell.getValue());
                            const timestamp = new Date(d);
                            const year = timestamp.getFullYear();
                            const month = ('0' + (timestamp.getMonth() + 1)).slice(-2);
                            const date = ('0' + timestamp.getDate()).slice(-2);
                            const hours = ('0' + timestamp.getHours()).slice(-2);
                            const minutes = ('0' + timestamp.getMinutes()).slice(-2);
                            return date + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
                        },
                    },
                    {
                        title: i18n.t('show-requests.table-header-subject'),
                        field: 'subject',
                        responsive: 1,
                        widthGrow: 3,
                        minWidth: 150,
                        formatter: 'html'
                    },
                    {
                        title: 'Status',
                        field: 'status',
                        responsive: 2,
                        widthGrow: 1,
                        minWidth: 120,
                    },
                    {
                        title: i18n.t('show-requests.table-header-files'),
                        field: 'files',
                        // visible: false,
                        responsive: 8,
                        minWidth: 800,
                        formatter: function(cell) {
                            let value = cell.getValue();
                            return value;
                        }
                    },
                    {
                        title: i18n.t('show-requests.table-header-recipients'),
                        field: 'recipients',
                        // visible: false,
                        responsive: 8,
                        minWidth: 800,
                        formatter: function(cell) {
                            let value = cell.getValue();
                            return value;
                        }
                    },
                    {
                        title: i18n.t('show-requests.table-header-id'),
                        field: 'requestId',
                        responsive: 8,
                        minWidth: 150,
                        formatter: function(cell) {
                            let value = cell.getValue();
                            return value;
                        }
                    },
                    {
                        title: '',
                        field: 'controls',
                        // hozAlign: 'center',
                        minWidth: 140,
                        widthGrow: 1,
                        headerSort: false,
                        responsive: 0,
                        formatter: (cell) => {
                            let value = cell.getValue();
                            return value;
                        },
                    },
                ],
                langs: {
                    'en': {
                        'columns': {
                            'dateCreated': 'Date created',
                            'subject': 'Subject',
                            'files': 'Files',
                            'recipients': 'Recipients',
                            'requestId': 'Request-ID'
                        },
                        'pagination': {
                            'page_size': 'Page size',
                            'page_size_title': 'Page size',
                            'first': '<span class="mobile-hidden">First</span>',
                            'first_title': 'First Page',
                            'last': '<span class="mobile-hidden">Last</span>',
                            'last_title': 'Last Page',
                            'prev': '<span class="mobile-hidden">Prev</span>',
                            'prev_title': 'Prev Page',
                            'next': '<span class="mobile-hidden">Next</span>',
                            'next_title': 'Next Page'
                        }
                    },
                    'de': {
                        'columns': {
                            'dateCreated': 'Erstelldatum',
                            'subject': 'Betreff',
                            'files': 'Angehängte Dateien',
                            'recipients': 'Empfänger',
                            'requestId': 'Auftrags-ID'
                        },
                        'pagination': {
                            'page_size': 'Einträge pro Seite',
                            'page_size_title': 'Einträge pro Seite',
                            'first': '<span class="mobile-hidden">Erste</span>',
                            'first_title': 'Erste Seite',
                            'last': '<span class="mobile-hidden">Letzte</span>',
                            'last_title': 'Letzte Seite',
                            'prev': '<span class="mobile-hidden">Vorherige</span>',
                            'prev_title': 'Vorherige Seite',
                            'next': '<span class="mobile-hidden">Nächste</span>',
                            'next_title': 'Nächste Seite'
                        }
                    }
                },
                initialSort: [
                    { column: 'dateCreated', dir: 'desc' },
                    // { column: 'status', dir: 'desc' },
                ],
            });

            this.dispatchRequestsTable.on("rowClick", this.rowClickFunction.bind(this));
            this.dispatchRequestsTable.on("dataLoaded", this.dataLoadedFunction.bind(this));
            this.dispatchRequestsTable.on("pageLoaded", this.pageLoadedFunction.bind(this));
        });
    }

    async processCreateDispatchRequest() {
        this._('#create-btn').start();

        // const i18n = this._i18n;
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
                this.requestCreated = true;
                // console.log(this.currentItem);

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

    async _onCreateRequestButtonClicked(event) {
        this.openFileSource();
    }

    getCurrentTime() {
        let date = new Date();
        let currentHours = ('0' + (date.getHours() + 1)).slice(-2);
        let currentMinutes = ('0' + date.getMinutes()).slice(-2);

        return currentHours + ':' + currentMinutes;
    }

    saveRequest() {
        this.clearAll();

        this.getCreatedDispatchRequests();
        this.showListView = true;
        this.showDetailsView = false;
        this.currentItem = {};
        this.currentItem.files = [];
        this.currentItem.recipients = [];
        this.currentRecipient = {};
        this.currentItem.senderOrganizationName = "";
        this.currentItem.senderFullName = "";
        this.currentItem.senderAddressCountry = "";
        this.currentItem.senderPostalCode = "";
        this.currentItem.senderAddressLocality = "";
        this.currentItem.senderStreetAddress = "";
        this.currentItem.senderBuildingNumber = "";

        //TODO
        this.requestCreated = false;
    }

    checkMultipleRequestsCheckmark() {
        this.singleFileProcessing = !(this._('#multiple-requests-button') && this._('#multiple-requests-button').checked);
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
            ${commonStyles.getTabulatorStyles()}
            ${commonStyles.getRadioAndCheckboxCss()}
            ${dispatchStyles.getDispatchRequestTableStyles()}
            ${dispatchStyles.getDispatchRequestStyles()}

            h2:first-child {
                margin-top: 0;
            }

            h2 {
                margin-bottom: 10px;
            }

            #multiple-requests-checkbox {
                margin-top: 1rem;
                margin-bottom: 1.5rem;
            }

            .multiple-requests {
                height: 18px;
                width: 18px;
                top: 0;
                left: 0;
            }

            .button-container input[type='checkbox']:checked ~ .multiple-requests::after {
                top: 1px;
                left: 6px;
            }
            
            .choose-and-create-btns {
                display: flex;
                gap: 5px;
            }

            .choose-and-create-btns dbp-resource-select {
                width: 30em;
                margin-top: 1px;
            }

            .control.table {
                padding-top: 1.5rem;
                font-size: 1.5rem;
                text-align: center;
            }

            .muted {
                color: var(--dbp-muted);
            }

            .table-wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
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

            .sender-data {
                /*margin: 0.5em 0 0.5em 16px;*/
                margin: 0 0 0.5em 1px;
                line-height: 1.5;
            }

            #search-button dbp-icon {
                top: -4px;
            }

            #open-settings-btn dbp-icon,
            .card .button.is-icon dbp-icon,
            .header-btn .button.is-icon dbp-icon {
                font-size: 1.3em;
            }

            .table-wrapper {
                display: block;
            }
            
            .selected-buttons {
                flex-direction: row-reverse;
            }

            #select_all_checkmark {
                top: 7px;
            }
            
            @media only screen and (orientation: portrait) and (max-width: 768px) {
                .multiple-requests {
                    top: 10%;
                }
            }
        `;
    }

    render() {
        const i18n = this._i18n;
        const tabulatorCss = commonUtils.getAssetURL(
            pkgName,
            'tabulator-tables/css/tabulator.min.css'
        );

        if (this.isLoggedIn() && !this.isLoading() && !this._initialFetchDone && !this.createRequestsLoading && this.filesAdded) {
            this.getCreatedDispatchRequests();
        }

        return html`
            <link rel="stylesheet" href="${tabulatorCss}"/>
            
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
                
                <div class="${classMap({hidden: this.showDetailsView || this.requestCreated})}">
                    ${i18n.t('show-requests.organization-select-description')}
                    <div class="choose-and-create-btns">
                        <dbp-resource-select
                                    id="create-resource-select"
                                    subscribe="lang,entry-point-url,auth"
                                    lang="${this.lang}"
                                    resource-path="dispatch/groups?lang=${this.lang}"
                                    value="${this.groupValue}"
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
                    <label id="multiple-requests-checkbox" class="button-container">
                        ${i18n.t('create-request.multiple-requests-text')}
                        <input
                                type="checkbox"
                                id="multiple-requests-button"
                                name="multiple-requests-button"
                                value="multiple-requests-button"
                                @click="${this.checkMultipleRequestsCheckmark}" 
                                checked />
                        <span class="multiple-requests checkmark" id="multiple-requests-button-checkmark"></span>
                    </label>
                </div>

                <div class="no-access-notification">
                    <dbp-inline-notification class="${classMap({ hidden: !this.isLoggedIn() || this.isLoading() || this.mayWrite || this.requestCreated || !this.organizationLoaded })}"
                                             type="danger"
                                             body="${this.mayRead ? i18n.t('create-request.error-no-writes') : i18n.t('error-no-read')}">
                    </dbp-inline-notification>
                </div>

                <div class="back-container">
                    <span class="back-navigation ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || !this.requestCreated })}">
                        <a href="#" title="${i18n.t('create-request.back-to-create')}"
                           @click="${(e) => {
                               this.saveRequest(e, this.currentItem);
                               this.showListView = false;
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

                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView || !this.showListView })}">
                    <div class="table-wrapper">
                        <div class="selected-buttons">
                            <div class="edit-selection-buttons ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}">
                                
                                <dbp-loading-button id="expand-all-btn"
                                                         class="${classMap({ hidden: this.expanded })}"
                                                         ?disabled="${this.loading}"
                                                         value="${i18n.t('show-requests.expand-all')}"
                                                         @click="${(event) => { this.expandAll(event); }}"
                                                         title="${i18n.t('show-requests.expand-all')}"
                                >${i18n.t('show-requests.expand-all')}</dbp-loading-button>
                                
                                <dbp-loading-button id="collapse-all-btn"
                                                        class="${classMap({ hidden: !this.expanded })}"
                                                        ?disabled="${this.loading}"
                                                        value="${i18n.t('show-requests.collapse-all')}"
                                                        @click="${(event) => { this.collapseAll(event); }}"
                                                        title="${i18n.t('show-requests.collapse-all')}"
                                >${i18n.t('show-requests.collapse-all')}</dbp-loading-button>
                                
                                
                                ${ this.mayWrite ? html`
                                    
                                    <dbp-loading-button id="delete-all-btn"
                                                        ?disabled="${this.loading || !this.rowsSelected}"
                                                        value="${i18n.t('show-requests.delete-button-text')}"
                                                        @click="${(event) => { this.deleteSelected(event); }}"
                                                        title="${i18n.t('show-requests.delete-button-text')}"
                                    >${i18n.t('show-requests.delete-button-text')}</dbp-loading-button>
                                    
                                    <dbp-loading-button id="submit-all-btn"
                                                        type="is-primary"
                                                        ?disabled="${this.loading || !this.rowsSelected}"
                                                        value="${i18n.t('show-requests.submit-button-text')}"
                                                        @click="${(event) => { this.submitSelected(event); }}"
                                                        title="${i18n.t('show-requests.submit-button-text')}"
                                    >${i18n.t('show-requests.submit-button-text')}</dbp-loading-button>
                                    
                                ` : `` }    
                            </div>
                        </div>

                        <div class="control table ${classMap({hidden: !this.createRequestsLoading})}">
                            <span class="loading">
                                <dbp-mini-spinner text=${i18n.t('show-requests.loading-table-message')}></dbp-mini-spinner>
                            </span>
                        </div>

                        <div class="dispatch-table ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView || !this.showListView || this.createRequestsLoading })}">
                            <div id="dispatch-requests-table" class=""></div>
                            <div class='tabulator' id='custom-pagination'>
                                <div class='tabulator-footer'>
                                    <div class='tabulator-footer-contents'>
                                        <span class='tabulator-paginator'></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                    <div>${this.currentItem.name}</div>
                                    <div class="no-subject ${classMap({hidden: !this.isLoggedIn() || this.subject.length !== 0})}">${i18n.t('show-requests.empty-subject-text')}</div>
                                </div>

                                <div class="line"></div>
                                <div>
                                    <div class="section-titles">${i18n.t('show-requests.submit-status')}</div>
                                    <div>${this.currentItem.dateSubmitted ? html`<span class="status-green">●</span> ${i18n.t('show-requests.status-completed-date', {date: this.convertToReadableDate(this.currentItem.dateSubmitted)})}` : html`<span class="status-orange">●</span> ${i18n.t('show-requests.empty-date-submitted')}`}</div>
                                </div>
                                
                                <div class="line"></div>
                                <div>
                                    <div class="section-titles">
                                        ${i18n.t('show-requests.reference-number')}
                                        ${!this.currentItem.dateSubmitted ? html`
                                                <dbp-icon-button id="edit-reference-number-btn"
                                                                 ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                                                 @click="${(event) => {
                                                                    MicroModal.show(this._('#edit-reference-number-modal'), {
                                                                        disableScroll: true,
                                                                        onClose: (modal) => {
                                                                            this.loading = false;
                                                                        },
                                                                    });
                                                                 }}"
                                                                 title="${i18n.t('show-requests.edit-reference-number-button-text')}"
                                                                 icon-name="pencil"></dbp-icon-button>` : ``}
                                    </div>
                                    <div>${this.currentItem.referenceNumber && this.currentItem.referenceNumber !== '-' ? html`${this.currentItem.referenceNumber}` : html`${i18n.t('show-requests.no-reference-number-found')}`}</div>
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
                                                                MicroModal.show(this._('#add-recipient-modal'), {
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
                                <div class="recipients-data ${classMap({hidden: !this.hasSender || !this.hasSubject})}">
                                    ${this.currentItem.recipients.map(recipient => html`
                                    <div class="recipient card">

                                        ${this.addRecipientCardLeftSideContent(recipient)}
                                        
                                        <div class="right-side">
                                            <dbp-icon-button id="show-recipient-btn"
                                                             @click="${(event) => {
                                                                 let button = event.target;
                                                                 button.start();
                                                                 this.currentRecipient = recipient;
                                                                 try {
                                                                     this.fetchDetailedRecipientInformation(recipient.identifier).then(() => {
                                                                            MicroModal.show(this._('#show-recipient-modal'), {
                                                                                disableScroll: true,
                                                                                onShow: modal => { this.button = button; },
                                                                                onClose: (modal) => {
                                                                                    this.loading = false;
                                                                                    this.currentRecipient = {};
                                                                                    button.stop();
                                                                                },
                                                                            });
                                                                        });
                                                                 } catch {
                                                                     button.stop();
                                                                 }
                                                             }}"
                                                             title="${i18n.t('show-requests.show-recipient-button-text')}"
                                                             icon-name="keyword-research"></dbp-icon></dbp-icon-button>
                                            ${!this.currentItem.dateSubmitted ? html`
                                                <dbp-icon-button id="edit-recipient-btn"
                                                             ?disabled="${this.loading || this.currentItem.dateSubmitted || (recipient.personIdentifier && recipient.electronicallyDeliverable)}"
                                                             @click="${(event) => {
                                                                 let button = event.target;
                                                                 button.start();
                                                                 this.currentRecipient = recipient;
                                                                try {
                                                                    this.fetchDetailedRecipientInformation(recipient.identifier).then(() => {
                                                                        this._('#edit-recipient-country-select').value = this.currentRecipient.addressCountry;
                                                                        this._('#tf-edit-recipient-birthdate-day').value = this.currentRecipient.birthDateDay;
                                                                        this._('#tf-edit-recipient-birthdate-month').value = this.currentRecipient.birthDateMonth;
                                                                        this._('#tf-edit-recipient-birthdate-year').value = this.currentRecipient.birthDateYear;
                                                                        this._('#tf-edit-recipient-gn-dialog').value = this.currentRecipient.givenName;
                                                                        this._('#tf-edit-recipient-fn-dialog').value = this.currentRecipient.familyName;
                                                                        this._('#tf-edit-recipient-pc-dialog').value = this.currentRecipient.postalCode;
                                                                        this._('#tf-edit-recipient-al-dialog').value = this.currentRecipient.addressLocality;
                                                                        this._('#tf-edit-recipient-sa-dialog').value = this.currentRecipient.streetAddress;
                                                                        
                                                                        MicroModal.show(this._('#edit-recipient-modal'), {
                                                                            disableScroll: true,
                                                                            onShow: modal => { this.button = button; },
                                                                            onClose: (modal) => {
                                                                                this.loading = false;
                                                                                this.currentRecipient = {};
                                                                            },
                                                                        });
                                                                    });
                                                                } catch {
                                                                    button.stop();
                                                                }
                                                             }}"
                                                             title="${i18n.t('show-requests.edit-recipients-button-text')}"
                                                             icon-name="pencil"></dbp-icon-button>
                                                <dbp-icon-button id="delete-recipient-btn"
                                                             ?disabled="${this.loading || this.currentItem.dateSubmitted}"
                                                             @click="${(event) => {
                                                                 this.deleteRecipient(event, recipient);
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
                            
                            ${this.addDetailedFilesView()}
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

            ${this.addEditReferenceNumberModal()}

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

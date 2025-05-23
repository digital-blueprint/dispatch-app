import {createInstance, setOverridesByGlobalCache} from './i18n.js';
import {css, html} from 'lit';
import {ScopedElementsMixin} from '@dbp-toolkit/common';
import DBPDispatchLitElement from './dbp-dispatch-lit-element';
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {
    LoadingButton,
    IconButton,
    Icon,
    MiniSpinner,
    InlineNotification,
} from '@dbp-toolkit/common';
import {CustomPersonSelect} from './person-select';
import {ResourceSelect} from '@dbp-toolkit/resource-select';
import {classMap} from 'lit/directives/class-map.js';
import {Activity} from './activity.js';
import metadata from './dbp-create-request.metadata.json';
import * as dispatchStyles from './styles';
import {FileSource, FileSink} from '@dbp-toolkit/file-handling';
import MicroModal from './micromodal.es';
import {TabulatorTable} from '@dbp-toolkit/tabulator-table';
import {PdfViewer} from '@dbp-toolkit/pdf-viewer';

class CreateRequest extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.activity = new Activity(metadata);
        this.entryPointUrl = '';

        this.newRequests = [];

        this.currentItem = {};
        this.currentItemTabulator = {};

        this.currentItem.files = [];
        this.currentItem.recipients = [];

        this.currentRecipient = {};

        this.currentItem.senderOrganizationName = '';
        this.currentItem.senderFullName = '';
        this.currentItem.senderAddressCountry = '';
        this.currentItem.senderPostalCode = '';
        this.currentItem.senderAddressLocality = '';
        this.currentItem.senderStreetAddress = '';
        this.currentItem.senderBuildingNumber = '';

        this.currentTable = {};

        this.subject = '';
        this.groupId = '';

        this.mayRead = false;
        this.mayWrite = false;
        this.mayReadMetadata = false;
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
        this.addFileViaButton = false;
        this.errorCreatingRequest = false;

        this.fileHandlingEnabledTargets = 'local';
        this.nextcloudWebAppPasswordURL = '';
        this.nextcloudWebDavURL = '';
        this.nextcloudName = '';
        this.nextcloudFileURL = '';
        this.nextcloudAuthInfo = '';

        this.totalNumberOfItems = 0;
        this.rowsSelected = false;

        this.fileUploadFinished = true;
        this.uploadedNumberOfFiles = 0;

        this.langDir = undefined;
        this.loadingTranslations = false;
        this.tableLoading = false;
        this.allSelected = false;

        this.selectedRow = this.rowClick.bind(this);
    }

    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-mini-spinner': MiniSpinner,
            'dbp-loading-button': LoadingButton,
            'dbp-icon-button': IconButton,
            'dbp-inline-notification': InlineNotification,
            'dbp-file-source': FileSource,
            'dbp-file-sink': FileSink,
            'dbp-person-select': CustomPersonSelect,
            'dbp-resource-select': ResourceSelect,
            'dbp-pdf-viewer': PdfViewer,
            'dbp-tabulator-table': TabulatorTable,
        };
    }

    static get properties() {
        return {
            ...super.properties,
            lang: {type: String},
            entryPointUrl: {type: String, attribute: 'entry-point-url'},

            newRequests: {type: Array, attribute: false},

            currentItem: {type: Object, attribute: false},
            currentTable: {type: Object, attribute: false},
            currentItemTabulator: {type: Object, attribute: false},
            currentRecipient: {type: Object, attribute: false},

            subject: {type: String, attribute: false},
            groupId: {type: String, attribute: false},

            emptyFieldsGiven: {type: Boolean, attribute: false},
            showDetailsView: {type: Boolean, attribute: false},
            hasSender: {type: Boolean, attribute: false},
            hasRecipients: {type: Boolean, attribute: false},
            requestCreated: {type: Boolean, attribute: false},

            organization: {type: String, attribute: false},
            organizationId: {type: String, attribute: false},

            mayWrite: {type: Boolean, attribute: false},
            mayRead: {type: Boolean, attribute: false},
            mayReadMetadata: {type: Boolean, attribute: false},

            organizationLoaded: {type: Boolean, attribute: false},
            rowsSelected: {type: Boolean, attribute: false},

            totalNumberOfCreatedRequestItems: {type: Number, attribute: false},
            filesAdded: {type: Boolean, attribute: false},
            createRequestsLoading: {type: Boolean, attribute: false},
            createdRequestsList: {type: Array, attribute: false},
            expanded: {type: Boolean, attribute: false},
            allSelected: {type: Boolean, attribute: false},

            fileUploadFinished: {type: Boolean, attribute: false},
            uploadedNumberOfFiles: {type: Number, attribute: false},

            fileHandlingEnabledTargets: {type: String, attribute: 'file-handling-enabled-targets'},
            nextcloudWebAppPasswordURL: {type: String, attribute: 'nextcloud-web-app-password-url'},
            nextcloudWebDavURL: {type: String, attribute: 'nextcloud-webdav-url'},
            nextcloudName: {type: String, attribute: 'nextcloud-name'},
            nextcloudFileURL: {type: String, attribute: 'nextcloud-file-url'},
            nextcloudAuthInfo: {type: String, attribute: 'nextcloud-auth-info'},

            langDir: {type: String, attribute: 'lang-dir'},
            tableLoading: {type: Boolean, attribute: false},
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

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    connectedCallback() {
        super.connectedCallback();
        this._loginStatus = '';
        this._loginState = [];
        this._loginCalled = false;

        if (this.langDir) {
            this.loadingTranslations = true;
            const that = this;
            setOverridesByGlobalCache(that._i18n, that).then(() => {
                that.loadingTranslations = false;
                that.requestUpdate();
            });
        } else {
            this.loadingTranslations = false;
        }

        this.updateComplete.then(() => {
            this._a('.tabulator-table').forEach((table) => {
                const tabulatorTable = /** @type {TabulatorTable} */ (table);
                tabulatorTable.buildTable();
                if (tabulatorTable.id == 'tabulator-table-created-requests')
                    tabulatorTable.addEventListener('click', this.selectedRow);
            });
        });
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

    checkMultipleRequestsCheckmark() {
        this.singleFileProcessing = !(
            this._('#multiple-requests-button') &&
            /** @type {HTMLInputElement} */ (this._('#multiple-requests-button')).checked
        );
    }

    setTabulatorData(createdRequests) {
        const i18n = this._i18n;
        let data = [];
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-created-requests'));

        createdRequests.forEach((item, index) => {
            let recipientStatus = item['dateSubmitted']
                ? this.checkRecipientStatus(item.recipients)[1]
                : i18n.t('show-requests.empty-date-submitted');

            let controls_div = this.createScopedElement('div');
            controls_div.classList.add('tabulator-icon-buttons');
            let btn_edit = this.createScopedElement('dbp-icon-button');
            btn_edit.setAttribute('icon-name', 'pencil');
            btn_edit.setAttribute('aria-label', i18n.t('show-requests.edit-request-button-text'));
            btn_edit.setAttribute('title', i18n.t('show-requests.edit-request-button-text'));
            btn_edit.addEventListener('click', async (event) => {
                this.currentTable = table;
                this.currentRowIndex = index;
                this.editRequest(event, item);
                event.stopPropagation();
            });
            controls_div.appendChild(btn_edit);

            let btn_delete = this.createScopedElement('dbp-icon-button');
            btn_delete.setAttribute('icon-name', 'trash');
            btn_delete.setAttribute(
                'aria-label',
                i18n.t('show-requests.delete-request-button-text'),
            );
            btn_delete.setAttribute('title', i18n.t('show-requests.delete-request-button-text'));
            btn_delete.addEventListener('click', async (event) => {
                this.deleteRequest(table, event, item, index);
                event.stopPropagation();
            });
            controls_div.appendChild(btn_delete);

            let btn_submit = this.createScopedElement('dbp-icon-button');
            btn_submit.setAttribute('icon-name', 'send-diagonal');
            btn_submit.setAttribute('aria-label', i18n.t('show-requests.send-request-button-text'));
            btn_submit.setAttribute('title', i18n.t('show-requests.send-request-button-text'));
            btn_submit.addEventListener('click', async (event) => {
                this.currentItem = item;
                this.submitRequest(table, event, item, index);
                event.stopPropagation();
            });
            controls_div.appendChild(btn_submit);

            let order = {
                dateCreated: this.convertToReadableDate(item['dateCreated']),
                gz: item['referenceNumber']
                    ? item['referenceNumber']
                    : i18n.t('show-requests.empty-reference-number'),
                subject: item['name'],
                status: recipientStatus,
                files: this.createFormattedFilesList(item['files']),
                recipients: this.createFormattedRecipientsList(item['recipients']),
                dateSubmitted: item['dateSubmitted']
                    ? this.convertToReadableDate(item['dateSubmitted'])
                    : i18n.t('show-requests.date-submitted-not-submitted'),
                requestId: item['identifier'],
                controls: controls_div,
            };
            data.push(order);
        });

        table.setData(data);
    }

    expandAll() {
        this.expanded = true;
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-created-requests'));
        table.expandAll();
    }

    collapseAll() {
        this.expanded = false;
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-created-requests'));
        table.collapseAll();
    }

    rowClick() {
        this.selected = true;
        let deleteButton = /** @type {HTMLButtonElement} */ (this._('#delete-all-btn'));
        let submitButton = /** @type {HTMLButtonElement} */ (this._('#submit-all-btn'));
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-created-requests'));
        this.currentTable = table;
        if (table.getSelectedRows().length !== 0) {
            deleteButton.disabled = false;
            submitButton.disabled = false;
        } else {
            deleteButton.disabled = true;
            submitButton.disabled = true;
        }
    }

    _onLoginClicked(e) {
        this.sendSetPropertyEvent('requested-login-status', 'logged-in');
        e.preventDefault();
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
            /* tabulatorStyles.getTabulatorStyles() */
            ${commonStyles.getRadioAndCheckboxCss()}
            /* dispatchStyles.getDispatchRequestTableStyles() */
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
                color: var(--dbp-override-muted);
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

                .choose-and-create-btns {
                    display: flex;
                    flex-direction: column;
                }

                .choose-and-create-btns dbp-resource-select {
                    width: unset;
                }

                .selected-buttons {
                    flex-direction: column;
                }

                .edit-selection-buttons {
                    gap: 5px;
                }

                #expand-all-btn,
                #collapse-all-btn {
                    padding: 0;
                }

                .table-wrapper {
                    padding-top: 1em;
                }

                .tabulator-header {
                    padding-top: 0;
                }
            }
        `;
    }

    render() {
        const i18n = this._i18n;
        // const tabulatorCss = commonUtils.getAssetURL(
        //     pkgName,
        //     'tabulator-tables/css/tabulator.min.css',
        // );

        let langs = {
            en: {
                columns: {
                    details: i18n.t('show-requests.table-header-details', {lng: 'en'}),
                    dateCreated: i18n.t('show-requests.table-header-date-created', {lng: 'en'}),
                    gz: i18n.t('show-requests.table-header-gz', {lng: 'en'}),
                    subject: i18n.t('show-requests.table-header-subject', {lng: 'en'}),
                    status: i18n.t('show-requests.table-header-status', {lng: 'en'}),
                    files: i18n.t('show-requests.table-header-files', {lng: 'en'}),
                    recipients: i18n.t('show-requests.table-header-recipients', {lng: 'en'}),
                    dateSubmitted: i18n.t('show-requests.date-submitted', {lng: 'en'}),
                    requestId: i18n.t('show-requests.table-header-id', {lng: 'en'}),
                },
            },
            de: {
                columns: {
                    details: i18n.t('show-requests.table-header-details', {lng: 'de'}),
                    dateCreated: i18n.t('show-requests.table-header-date-created', {lng: 'de'}),
                    gz: i18n.t('show-requests.table-header-gz', {lng: 'de'}),
                    subject: i18n.t('show-requests.table-header-subject', {lng: 'de'}),
                    status: i18n.t('show-requests.table-header-status', {lng: 'de'}),
                    files: i18n.t('show-requests.table-header-files', {lng: 'de'}),
                    recipients: i18n.t('show-requests.table-header-recipients', {lng: 'de'}),
                    dateSubmitted: i18n.t('show-requests.date-submitted', {lng: 'de'}),
                    requestId: i18n.t('show-requests.table-header-id', {lng: 'de'}),
                },
            },
        };

        let options = {
            langs: langs,
            layout: 'fitColumns',
            responsiveLayout: 'collapse',
            responsiveLayoutCollapseStartOpen: false,
            columns: [
                {
                    title: 'details',
                    field: 'details',
                    hozAlign: 'center',
                    width: 65,
                    formatter: 'responsiveCollapse',
                    headerHozAlign: 'center',
                    sorter: 'string',
                    headerSort: false,
                    responsive: 0,
                },
                {
                    title: 'dateCreated',
                    field: 'dateCreated',
                    minWidth: 140,
                    hozAlign: 'left',
                    widthGrow: 1,
                    responsive: 0,
                    sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
                        //a, b - the two values being compared
                        //aRow, bRow - the row components for the values being compared (useful if you need to access additional fields in the row data for the sort)
                        //column - the column component for the column being sorted
                        //dir - the direction of the sort ("asc" or "desc")
                        //sorterParams - sorterParams object from column definition array
                        const timeStampA = this.dateToTimestamp(a);
                        const timeStampB = this.dateToTimestamp(b);

                        return timeStampA - timeStampB;
                    },
                },
                {
                    title: 'gz',
                    field: 'gz',
                    responsive: 2,
                    widthGrow: 3,
                    minWidth: 100,
                    formatter: 'html',
                },
                {
                    title: 'subject',
                    field: 'subject',
                    minWidth: 140,
                    responsive: 3,
                    widthGrow: 3,
                    formatter: 'html',
                },
                {
                    title: 'status',
                    field: 'status',
                    minWidth: 120,
                    responsive: 2,
                    widthGrow: 1,
                    hozAlign: 'center',
                    formatter: 'html',
                },

                {title: 'files', field: 'files', minWidth: 800, formatter: 'html', responsive: 8},
                {
                    title: 'recipients',
                    field: 'recipients',
                    minWidth: 800,
                    formatter: 'html',
                    responsive: 8,
                },
                {title: 'dateSubmitted', field: 'dateSubmitted', minWidth: 150, responsive: 8},
                {title: 'requestId', field: 'requestId', minWidth: 150, responsive: 8},

                {
                    title: '',
                    field: 'controls',
                    minWidth: 140,
                    formatter: 'html',
                    hozAlign: 'right',
                    widthGrow: 1,
                    headerSort: false,
                    responsive: 0,
                },
            ],
            columnDefaults: {
                vertAlign: 'middle',
                hozAlign: 'left',
                resizable: false,
            },
            initialSort: [{column: 'dateCreated', dir: 'desc'}],
        };

        return html`
            <div
                class="control ${classMap({
                    hidden: this.isLoggedIn() || !this.isLoading() || !this.loadingTranslations,
                })}">
                <span class="loading">
                    <dbp-mini-spinner text=${i18n.t('loading-message')}></dbp-mini-spinner>
                </span>
            </div>

            <div
                class="notification is-warning ${classMap({
                    hidden: this.isLoggedIn() || this.isLoading(),
                })}">
                ${i18n.t('error-login-message')}
                <a href="#" @click="${this._onLoginClicked}">${i18n.t('error-login-link')}</a>
            </div>

            <div
                class="${classMap({
                    hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations,
                })}">
                <h2>${this.activity.getName(this.lang)}</h2>
                <p class="subheadline">
                    <slot name="description">${this.activity.getDescription(this.lang)}</slot>
                </p>

                <slot name="activity-description">
                    <p>${i18n.t('create-request.description-text')}</p>
                </slot>

                <dbp-inline-notification
                    class="${classMap({hidden: !this.hasEmptyFields})}"
                    type="warning"
                    body="${i18n.t('create-request.empty-fields-given')}"></dbp-inline-notification>

                <div class="${classMap({hidden: this.showDetailsView || this.requestCreated})}">
                    ${i18n.t('show-requests.organization-select-description')}
                    <div class="choose-and-create-btns">
                        <dbp-resource-select
                            id="create-resource-select"
                            subscribe="lang,entry-point-url,auth"
                            lang="${this.lang}"
                            resource-path="dispatch/groups"
                            value="${this.groupValue}"
                            @change=${(event) => {
                                this.processSelectedSender(event);
                            }}></dbp-resource-select>
                        <dbp-loading-button
                            id="create-btn"
                            type="is-primary"
                            value="${i18n.t('create-request.create-request-button-text')}"
                            @click="${(event) => {
                                this._onCreateRequestButtonClicked(event);
                            }}"
                            title="${i18n.t('create-request.create-request-button-text')}"
                            ?disabled="${!this.mayWrite}"
                            class="${classMap({
                                hidden: this.showDetailsView,
                            })}"></dbp-loading-button>
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
                        <span
                            class="multiple-requests checkmark"
                            id="multiple-requests-button-checkmark"></span>
                    </label>
                </div>

                <div class="no-access-notification">
                    <dbp-inline-notification
                        class="${classMap({
                            hidden:
                                !this.isLoggedIn() ||
                                this.isLoading() ||
                                this.mayWrite ||
                                this.requestCreated ||
                                !this.organizationLoaded,
                        })}"
                        type="danger"
                        body="${this.mayRead || this.mayReadMetadata
                            ? i18n.t('create-request.error-no-writes')
                            : i18n.t('error-no-read')}"></dbp-inline-notification>
                </div>

                <div class="back-container">
                    <span
                        class="back-navigation ${classMap({
                            hidden:
                                !this.isLoggedIn() ||
                                this.isLoading() ||
                                !this.requestCreated ||
                                (!this.singleFileProcessing && this.showDetailsView),
                        })}">
                        <a
                            href="#"
                            title="${i18n.t('create-request.back-to-create')}"
                            @click="${(e) => {
                                this.currentItem = {};
                                this.currentItem.senderOrganizationName = '';
                                this.currentItem.senderFullName = '';
                                this.currentItem.senderAddressCountry = '';
                                this.currentItem.senderPostalCode = '';
                                this.currentItem.senderAddressLocality = '';
                                this.currentItem.senderStreetAddress = '';
                                this.currentItem.senderBuildingNumber = '';
                                this.currentItem.files = [];
                                this.currentItem.recipients = [];
                                this.currentRecipient = {};

                                this.subject = '';

                                this.hasEmptyFields = false;
                                this.hasSender = false;
                                this.hasRecipients = false;

                                this.expanded = false;

                                this.showListView = false;
                                this.showDetailsView = false;
                                this.requestCreated = false;

                                this.addFileViaButton = false;
                            }}">
                            <dbp-icon name="chevron-left"></dbp-icon>
                            ${i18n.t('create-request.back-to-create')}
                        </a>
                    </span>
                    <span
                        class="back-navigation ${classMap({
                            hidden:
                                !this.isLoggedIn() ||
                                this.isLoading() ||
                                !this.requestCreated ||
                                this.singleFileProcessing ||
                                this.showListView,
                        })}">
                        <a
                            href="#"
                            title="${i18n.t('show-requests.back-to-list')}"
                            @click="${async (e) => {
                                let updatedRequests = await this.getCreatedDispatchRequests();
                                // Update requests in tabulator table
                                this.setTabulatorData(updatedRequests);
                                this.showDetailsView = false;
                                this.showListView = true;
                                this.subject = '';
                            }}">
                            <dbp-icon name="chevron-left"></dbp-icon>
                            ${i18n.t('show-requests.back-to-list')}
                        </a>
                    </span>
                </div>

                <h3
                    class="${classMap({
                        hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView,
                    })}">
                    ${i18n.t('create-request.create-dispatch-order')}:
                </h3>

                <div
                    class="${classMap({
                        hidden:
                            !this.isLoggedIn() ||
                            this.isLoading() ||
                            this.showDetailsView ||
                            !this.showListView,
                    })}">
                    <div class="table-wrapper">
                        <div class="selected-buttons">
                            <div
                                class="edit-selection-buttons ${classMap({
                                    hidden:
                                        !this.isLoggedIn() ||
                                        this.isLoading() ||
                                        this.showDetailsView,
                                })}">
                                <dbp-loading-button
                                    id="select-all-btn"
                                    class="${classMap({hidden: this.allSelected})}"
                                    value="${i18n.t('show-requests.select-all')}"
                                    @click="${() => {
                                        this.allSelected = true;
                                        const table = /** @type {TabulatorTable} */ (
                                            this._('#tabulator-table-created-requests')
                                        );
                                        table.selectAllVisibleRows();
                                        this.toggleDeleteAndSubmitButtons(
                                            '#tabulator-table-created-requests',
                                        );
                                    }}"
                                    title="${i18n.t('show-requests.select-all')}">
                                    ${i18n.t('show-requests.select-all')}
                                </dbp-loading-button>

                                <dbp-loading-button
                                    id="deselect-all-btn"
                                    class="${classMap({hidden: !this.allSelected})}"
                                    value="${i18n.t('show-requests.deselect-all')}"
                                    @click="${() => {
                                        this.allSelected = false;
                                        const table = /** @type {TabulatorTable} */ (
                                            this._('#tabulator-table-created-requests')
                                        );
                                        table.deselectAllRows();
                                        this.toggleDeleteAndSubmitButtons(
                                            '#tabulator-table-created-requests',
                                        );
                                    }}"
                                    title="${i18n.t('show-requests.deselect-all')}">
                                    ${i18n.t('show-requests.deselect-all')}
                                </dbp-loading-button>
                                <dbp-loading-button
                                    id="expand-all-btn"
                                    class="${classMap({hidden: this.expanded})}"
                                    ?disabled="${this.loading}"
                                    value="${i18n.t('show-requests.expand-all')}"
                                    @click="${(event) => {
                                        this.expandAll();
                                    }}"
                                    title="${i18n.t('show-requests.expand-all')}">
                                    ${i18n.t('show-requests.expand-all')}
                                </dbp-loading-button>

                                <dbp-loading-button
                                    id="collapse-all-btn"
                                    class="${classMap({hidden: !this.expanded})}"
                                    ?disabled="${this.loading}"
                                    value="${i18n.t('show-requests.collapse-all')}"
                                    @click="${() => {
                                        this.collapseAll();
                                    }}"
                                    title="${i18n.t('show-requests.collapse-all')}">
                                    ${i18n.t('show-requests.collapse-all')}
                                </dbp-loading-button>

                                ${this.mayWrite
                                    ? html`
                                          <dbp-loading-button
                                              id="delete-all-btn"
                                              disabled
                                              value="${i18n.t('show-requests.delete-button-text')}"
                                              @click="${async () => {
                                                  await this.deleteSelected();
                                                  this.toggleDeleteAndSubmitButtons(
                                                      '#tabulator-table-created-requests',
                                                  );
                                              }}"
                                              title="${i18n.t('show-requests.delete-button-text')}">
                                              ${i18n.t('show-requests.delete-button-text')}
                                          </dbp-loading-button>

                                          <dbp-loading-button
                                              id="submit-all-btn"
                                              type="is-primary"
                                              ?disabled="${this.loading || !this.rowsSelected}"
                                              value="${i18n.t('show-requests.submit-button-text')}"
                                              @click="${async (event) => {
                                                  await this.submitSelected();
                                                  this.toggleDeleteAndSubmitButtons(
                                                      '#tabulator-table-created-requests',
                                                  );
                                              }}"
                                              title="${i18n.t('show-requests.submit-button-text')}">
                                              ${i18n.t('show-requests.submit-button-text')}
                                          </dbp-loading-button>
                                      `
                                    : ``}
                            </div>
                        </div>

                        <div
                            class="control table ${classMap({
                                hidden:
                                    !this.createRequestsLoading &&
                                    this.fileUploadFinished &&
                                    !this.tableLoading,
                            })}">
                            <span class="loading">
                                <dbp-mini-spinner
                                    text=${i18n.t(
                                        'show-requests.loading-table-message',
                                    )}></dbp-mini-spinner>
                            </span>
                        </div>

                        <div
                            class="dispatch-table ${classMap({
                                hidden:
                                    !this.isLoggedIn() ||
                                    this.isLoading() ||
                                    this.showDetailsView ||
                                    !this.showListView ||
                                    this.createRequestsLoading ||
                                    this.tableLoading,
                            })}">
                            <div class="container">
                                <dbp-tabulator-table
                                    lang="${this.lang}"
                                    class="tabulator-table"
                                    id="tabulator-table-created-requests"
                                    identifier="create-requests-table"
                                    collapse-enabled
                                    pagination-size="10"
                                    pagination-enabled
                                    select-rows-enabled
                                    .options=${options}></dbp-tabulator-table>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="${classMap({
                        hidden: !this.isLoggedIn() || this.isLoading() || !this.showDetailsView,
                    })}">
                    ${this.currentItem && !this.currentItem.dateSubmitted
                        ? html`
                              <div class="request-buttons">
                                  <div class="edit-buttons">
                                      <dbp-loading-button
                                          id="delete-btn"
                                          ?disabled="${this.loading ||
                                          this.currentItem.dateSubmitted}"
                                          value="${i18n.t('show-requests.delete-button-text')}"
                                          @click="${(event) => {
                                              let table = this._(
                                                  '#tabulator-table-created-requests',
                                              );
                                              this.deleteRequest(table, event, this.currentItem);
                                          }}"
                                          title="${i18n.t('show-requests.delete-button-text')}">
                                          ${i18n.t('show-requests.delete-button-text')}
                                      </dbp-loading-button>
                                  </div>
                                  <div class="submit-button">
                                      <dbp-loading-button
                                          type="is-primary"
                                          id="submit-btn"
                                          ?disabled="${this.loading ||
                                          this.currentItem.dateSubmitted}"
                                          value="${i18n.t('show-requests.submit-button-text')}"
                                          @click="${(event) => {
                                              this.submitRequest(
                                                  this.currentTable,
                                                  event,
                                                  this.currentItem,
                                              );
                                          }}"
                                          title="${i18n.t('show-requests.submit-button-text')}">
                                          ${i18n.t('show-requests.submit-button-text')}
                                      </dbp-loading-button>
                                  </div>
                              </div>
                          `
                        : ``}
                    ${this.currentItem
                        ? html`
                              <div
                                  class="request-item details ${classMap({
                                      hidden: !this.showDetailsView,
                                  })}">
                                  <div class="details header">
                                      <div>
                                          <div class="section-titles">
                                              ${i18n.t('create-request.request-subject')}
                                              ${!this.currentItem.dateSubmitted && this.hasSender
                                                  ? html`
                                                        <dbp-icon-button
                                                            id="edit-subject-btn"
                                                            ?disabled="${this.loading ||
                                                            this.currentItem.dateSubmitted}"
                                                            @click="${(event) => {
                                                                this.subject = this.currentItem.name
                                                                    ? this.currentItem.name
                                                                    : '';
                                                                /** @type {HTMLInputElement} */ (
                                                                    this._(
                                                                        '#tf-edit-subject-fn-dialog',
                                                                    )
                                                                ).value = this.currentItem.name
                                                                    ? this.currentItem.name
                                                                    : ``;
                                                                MicroModal.show(
                                                                    // @ts-ignore
                                                                    this._('#edit-subject-modal'),
                                                                    {
                                                                        disableScroll: true,
                                                                        onClose: (modal) => {
                                                                            this.loading = false;
                                                                        },
                                                                    },
                                                                );
                                                            }}"
                                                            aria-label="${i18n.t(
                                                                'show-requests.edit-subject-button-text',
                                                            )}"
                                                            title="${i18n.t(
                                                                'show-requests.edit-subject-button-text',
                                                            )}"
                                                            icon-name="pencil"></dbp-icon-button>
                                                    `
                                                  : ``}
                                          </div>
                                          <div>${this.currentItem.name}</div>
                                          <div
                                              class="no-subject ${classMap({
                                                  hidden:
                                                      !this.isLoggedIn() ||
                                                      this.currentItem.name ||
                                                      this.currentItem.name !== '',
                                              })}">
                                              ${i18n.t('show-requests.empty-subject-text')}
                                          </div>
                                      </div>

                                      <div class="line"></div>
                                      <div>
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.submit-status')}
                                          </div>
                                          <div>
                                              ${this.currentItem.dateSubmitted
                                                  ? html`
                                                        <span class="status-green">●</span>
                                                        ${i18n.t(
                                                            'show-requests.status-completed-date',
                                                            {
                                                                date: this.convertToReadableDate(
                                                                    this.currentItem.dateSubmitted,
                                                                ),
                                                            },
                                                        )}
                                                    `
                                                  : html`
                                                        <span class="status-orange">●</span>
                                                        ${i18n.t(
                                                            'show-requests.empty-date-submitted',
                                                        )}
                                                    `}
                                          </div>
                                      </div>

                                      <div class="line"></div>
                                      <div>
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.reference-number')}
                                              ${!this.currentItem.dateSubmitted
                                                  ? html`
                                                        <dbp-icon-button
                                                            id="edit-reference-number-btn"
                                                            ?disabled="${this.loading ||
                                                            this.currentItem.dateSubmitted ||
                                                            !this.mayWrite}"
                                                            @click="${(event) => {
                                                                /** @type {HTMLInputElement} */ (
                                                                    this._(
                                                                        '#tf-edit-reference-number-fn-dialog',
                                                                    )
                                                                ).value =
                                                                    this.currentItem
                                                                        .referenceNumber ?? ``;
                                                                MicroModal.show(
                                                                    // @ts-ignore
                                                                    this._(
                                                                        '#edit-reference-number-modal',
                                                                    ),
                                                                    {
                                                                        disableScroll: true,
                                                                        onClose: (modal) => {
                                                                            this.loading = false;
                                                                        },
                                                                    },
                                                                );
                                                            }}"
                                                            aria-label="${i18n.t(
                                                                'show-requests.edit-reference-number-button-text',
                                                            )}"
                                                            title="${i18n.t(
                                                                'show-requests.edit-reference-number-button-text',
                                                            )}"
                                                            icon-name="pencil"></dbp-icon-button>
                                                    `
                                                  : ``}
                                          </div>
                                          <div>
                                              ${this.currentItem.referenceNumber
                                                  ? html`
                                                        ${this.currentItem.referenceNumber}
                                                    `
                                                  : html`
                                                        ${i18n.t(
                                                            'show-requests.empty-reference-number',
                                                        )}
                                                    `}
                                          </div>
                                      </div>
                                  </div>

                                  ${this.addSenderDetails()}

                                  <div
                                      class="details recipients ${classMap({
                                          hidden: !this.hasSender || !this.hasSubject,
                                      })}">
                                      <div class="header-btn">
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.recipients')}
                                              <span class="section-title-counts">
                                                  ${this.currentItem.recipients.length !== 0
                                                      ? `(` +
                                                        this.currentItem.recipients.length +
                                                        `)`
                                                      : ``}
                                              </span>
                                          </div>
                                          ${!this.currentItem.dateSubmitted
                                              ? html`
                                                    <dbp-loading-button
                                                        id="add-recipient-btn"
                                                        ?disabled="${this.loading ||
                                                        this.currentItem.dateSubmitted}"
                                                        value="${i18n.t(
                                                            'show-requests.add-recipient-button-text',
                                                        )}"
                                                        @click="${(event) => {
                                                            this.preloadSelectedRecipient().then(
                                                                () => {
                                                                    MicroModal.show(
                                                                        // @ts-ignore
                                                                        this._(
                                                                            '#add-recipient-modal',
                                                                        ),
                                                                        {
                                                                            disableScroll: true,
                                                                            disableFocus: false,
                                                                            onClose: (modal) => {
                                                                                this.loading = false;
                                                                                /** @type {LoadingButton} */ (
                                                                                    this._(
                                                                                        '#add-recipient-btn',
                                                                                    )
                                                                                ).stop();
                                                                            },
                                                                        },
                                                                    );
                                                                },
                                                            );
                                                        }}"
                                                        title="${i18n.t(
                                                            'show-requests.add-recipient-button-text',
                                                        )}">
                                                        ${i18n.t(
                                                            'show-requests.add-recipient-button-text',
                                                        )}
                                                    </dbp-loading-button>
                                                `
                                              : ``}
                                      </div>
                                      <div
                                          class="recipients-data ${classMap({
                                              hidden: !this.hasSender || !this.hasSubject,
                                          })}">
                                          ${this.sortRecipients(this.currentItem.recipients).map(
                                              (recipient) => html`
                                    <div class="recipient card">

                                        ${this.addRecipientCardLeftSideContent(recipient)}

                                        <div class="right-side">
                                            <dbp-icon-button id="show-recipient-btn"
                                                             @click="${(event) => {
                                                                 let button = event.target;
                                                                 button.start();
                                                                 this.currentRecipient = recipient;
                                                                 try {
                                                                     this.fetchDetailedRecipientInformation(
                                                                         recipient.identifier,
                                                                     ).then(() => {
                                                                         MicroModal.show(
                                                                             // @ts-ignore
                                                                             this._(
                                                                                 '#show-recipient-modal',
                                                                             ),
                                                                             {
                                                                                 disableScroll: true,
                                                                                 onShow: (
                                                                                     modal,
                                                                                 ) => {
                                                                                     this.button =
                                                                                         button;
                                                                                 },
                                                                                 onClose: (
                                                                                     modal,
                                                                                 ) => {
                                                                                     this.loading = false;
                                                                                     this.currentRecipient =
                                                                                         {};
                                                                                     button.stop();
                                                                                 },
                                                                             },
                                                                         );
                                                                     });
                                                                 } catch {
                                                                     button.stop();
                                                                 }
                                                             }}"
                                                            title="${i18n.t('show-requests.show-recipient-button-text')}"
                                                            aria-label="${i18n.t(
                                                                'show-requests.show-recipient-button-text',
                                                            )}"
                                                             icon-name="keyword-research"></dbp-icon></dbp-icon-button>
                                            ${
                                                !this.currentItem.dateSubmitted
                                                    ? html`
                                                          <dbp-icon-button
                                                              id="edit-recipient-btn"
                                                              ?disabled="${this.loading ||
                                                              this.currentItem.dateSubmitted ||
                                                              (recipient.personIdentifier &&
                                                                  (recipient.electronicallyDeliverable ||
                                                                      recipient.postalDeliverable))}"
                                                              @click="${(event) => {
                                                                  let button = event.target;
                                                                  button.start();
                                                                  this.currentRecipient = recipient;
                                                                  try {
                                                                      this.fetchDetailedRecipientInformation(
                                                                          recipient.identifier,
                                                                      ).then(() => {
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#edit-recipient-country-select',
                                                                              )
                                                                          ).value =
                                                                              this.currentRecipient.addressCountry;
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-birthdate-day',
                                                                              )
                                                                          ).value =
                                                                              this.currentRecipient.birthDateDay;
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-birthdate-month',
                                                                              )
                                                                          ).value =
                                                                              this.currentRecipient.birthDateMonth;
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-birthdate-year',
                                                                              )
                                                                          ).value =
                                                                              this.currentRecipient.birthDateYear;
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-gn-dialog',
                                                                              )
                                                                          ).value =
                                                                              this.currentRecipient.givenName;
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-fn-dialog',
                                                                              )
                                                                          ).value =
                                                                              this.currentRecipient.familyName;
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-pc-dialog',
                                                                              )
                                                                          ).value = this
                                                                              .currentRecipient
                                                                              .postalCode
                                                                              ? this
                                                                                    .currentRecipient
                                                                                    .postalCode
                                                                              : '';
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-al-dialog',
                                                                              )
                                                                          ).value = this
                                                                              .currentRecipient
                                                                              .addressLocality
                                                                              ? this
                                                                                    .currentRecipient
                                                                                    .addressLocality
                                                                              : '';
                                                                          /** @type {HTMLInputElement} */ (
                                                                              this._(
                                                                                  '#tf-edit-recipient-sa-dialog',
                                                                              )
                                                                          ).value = this
                                                                              .currentRecipient
                                                                              .streetAddress
                                                                              ? this
                                                                                    .currentRecipient
                                                                                    .streetAddress
                                                                              : '';

                                                                          MicroModal.show(
                                                                              // @ts-ignore
                                                                              this._(
                                                                                  '#edit-recipient-modal',
                                                                              ),
                                                                              {
                                                                                  disableScroll: true,
                                                                                  onShow: (
                                                                                      modal,
                                                                                  ) => {
                                                                                      this.button =
                                                                                          button;
                                                                                  },
                                                                                  onClose: (
                                                                                      modal,
                                                                                  ) => {
                                                                                      this.loading = false;
                                                                                      this.currentRecipient =
                                                                                          {};
                                                                                  },
                                                                              },
                                                                          );
                                                                      });
                                                                  } catch {
                                                                      button.stop();
                                                                  }
                                                              }}"
                                                              title="${i18n.t(
                                                                  'show-requests.edit-recipients-button-text',
                                                              )}"
                                                              aria-label="${i18n.t(
                                                                  'show-requests.show-recipient-button-text',
                                                              )}"
                                                              icon-name="pencil"></dbp-icon-button>
                                                          <dbp-icon-button
                                                              id="delete-recipient-btn"
                                                              ?disabled="${this.loading ||
                                                              this.currentItem.dateSubmitted}"
                                                              @click="${(event) => {
                                                                  this.deleteRecipient(
                                                                      event,
                                                                      recipient,
                                                                  );
                                                              }}"
                                                              aria-label="${i18n.t(
                                                                  'show-requests.delete-recipient-button-text',
                                                              )}"
                                                              title="${i18n.t(
                                                                  'show-requests.delete-recipient-button-text',
                                                              )}"
                                                              icon-name="trash"></dbp-icon-button>
                                                      `
                                                    : ``
                                            }
                                        </div>
                                    </div>
                                `,
                                          )}
                                          <div
                                              class="no-recipients ${classMap({
                                                  hidden:
                                                      !this.isLoggedIn() ||
                                                      !this.hasSender ||
                                                      !this.hasSubject ||
                                                      this.currentItem.recipients.length !== 0,
                                              })}">
                                              ${i18n.t('show-requests.no-recipients-text')}
                                          </div>
                                      </div>
                                  </div>

                                  ${this.addDetailedFilesView()}
                              </div>
                          `
                        : ``}
                </div>
            </div>

            ${this.addFilePicker()} ${this.addEditSenderModal()} ${this.addAddRecipientModal()}
            ${this.addEditRecipientModal()} ${this.addShowRecipientModal()}
            ${this.addEditSubjectModal()} ${this.addEditReferenceNumberModal()}
            ${this.addFileViewerModal()}

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
                                aria-label="${i18n.t('show-requests.modal-close')}"
                                @click="${() => {
                                    // @ts-ignore
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
                                        }}" />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div>${i18n.t('show-requests.add-subject-description')}</div>
                            </div>
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn">
                                <button
                                    class="button"
                                    data-micromodal-close
                                    aria-label="Close this dialog window"
                                    @click="${() => {
                                        // @ts-ignore
                                        MicroModal.close(this._('#add-subject-modal'));
                                    }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                    class="button select-button is-primary"
                                    id="add-subject-confirm-btn"
                                    @click="${() => {
                                        /** @type {HTMLButtonElement} */ (
                                            this._('#add-subject-confirm-btn')
                                        ).disabled = true;
                                        // @ts-ignore
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

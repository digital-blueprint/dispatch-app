import {createInstance, setOverridesByGlobalCache} from './i18n';
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
import {classMap} from 'lit/directives/class-map.js';
import {Activity} from './activity.js';
import metadata from './dbp-show-requests.metadata.json';
import MicroModal from './micromodal.es';
import {FileSource, FileSink} from '@dbp-toolkit/file-handling';
import {TabulatorTable} from '@dbp-toolkit/tabulator-table';
import * as dispatchStyles from './styles';
import {ResourceSelect} from '@dbp-toolkit/resource-select';
import {InfoTooltip, TooltipElement} from '@dbp-toolkit/tooltip';
import {CustomPersonSelect} from './person-select.js';

// NOTE: pdf-viewer is loading the pdfjs worker also for getBusinessNumberFromPDF!
import {PdfViewer} from '@dbp-toolkit/pdf-viewer';

class ShowRequests extends ScopedElementsMixin(DBPDispatchLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.activity = new Activity(metadata);
        this.lang = this._i18n.language;
        this.entryPointUrl = '';
        this.loading = false;
        this._initialFetchDone = false;
        this.requestList = [];

        this.showListView = true;
        this.showDetailsView = false;

        this.currentItem = {};

        this.currentItem.files = [];
        this.currentItem.recipients = [];

        this.currentRecipient = {};
        this.subject = '';
        this.mayWrite = false;
        this.mayRead = false;
        this.mayReadAddress = false;
        this.mayReadMetadata = false;
        this.organizationSet = false;
        this.addFileViaButton = false;

        this.currentItem.senderOrganizationName = '';
        this.currentItem.senderFullName = '';
        this.currentItem.senderAddressCountry = '';
        this.currentItem.senderPostalCode = '';
        this.currentItem.senderAddressLocality = '';
        this.currentItem.senderStreetAddress = '';
        this.currentItem.senderBuildingNumber = '';

        this.currentRowIndex = '';
        this.currentTable = {};

        this.lastModifiedName = '';
        this.expanded = false;

        this.fileHandlingEnabledTargets = 'local';
        this.nextcloudWebAppPasswordURL = '';
        this.nextcloudWebDavURL = '';
        this.nextcloudName = '';
        this.nextcloudFileURL = '';
        this.nextcloudAuthInfo = '';

        this.selectedRow = this.rowClick.bind(this);

        this.initateOpenAdditionalMenu = false;
        this.initateOpenAdditionalSearchMenu = false;
        this.boundCloseAdditionalSearchMenuHandler = this.hideAdditionalSearchMenu.bind(this);
        this.boundCloseAdditionalSearchMenuHandlerInner =
            this.hideAdditionalSearchMenuInner.bind(this);
        this.boundPressEnterAndSubmitSearchHandler = this.pressEnterAndSubmitSearch.bind(this);

        this.langDir = undefined;
        this.loadingTranslations = false;
        this.tableLoading = false;
        this.expandedTabulator = false;
        this.allSelected = false;
    }

    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-mini-spinner': MiniSpinner,
            'dbp-loading-button': LoadingButton,
            'dbp-icon-button': IconButton,
            'dbp-inline-notification': InlineNotification,
            'dbp-file-sink': FileSink,
            'dbp-file-source': FileSource,
            'dbp-person-select': CustomPersonSelect,
            'dbp-resource-select': ResourceSelect,
            'dbp-info-tooltip': InfoTooltip,
            'dbp-tooltip': TooltipElement,
            'dbp-pdf-viewer': PdfViewer,
            'dbp-tabulator-table': TabulatorTable,
        };
    }

    static get properties() {
        return {
            ...super.properties,
            lang: {type: String},
            entryPointUrl: {type: String, attribute: 'entry-point-url'},
            loading: {type: Boolean, attribute: false},
            initialRequestsLoading: {type: Boolean, attribute: false},
            tableLoading: {type: Boolean, attribute: false},
            requestList: {type: Array, attribute: false},

            showListView: {type: Boolean, attribute: false},
            showDetailsView: {type: Boolean, attribute: false},
            currentItem: {type: Object, attribute: false},
            currentRow: {type: Object, attribute: false},
            currentRowIndex: {type: String, attribute: false},
            currentTable: {type: Object, attribute: false},
            currentRecipient: {type: Object, attribute: false},
            subject: {type: String, attribute: false},
            organizationSet: {type: Boolean, attribute: false},
            mayWrite: {type: Boolean, attribute: false},
            mayRead: {type: Boolean, attribute: false},
            mayReadMetadata: {type: Boolean, attribute: false},
            lastModifiedName: {type: String, attribute: false},
            expanded: {type: Boolean, attribute: false},
            allSelected: {type: Boolean, attribute: false},

            fileHandlingEnabledTargets: {type: String, attribute: 'file-handling-enabled-targets'},
            nextcloudWebAppPasswordURL: {type: String, attribute: 'nextcloud-web-app-password-url'},
            nextcloudWebDavURL: {type: String, attribute: 'nextcloud-webdav-url'},
            nextcloudName: {type: String, attribute: 'nextcloud-name'},
            nextcloudFileURL: {type: String, attribute: 'nextcloud-file-url'},
            nextcloudAuthInfo: {type: String, attribute: 'nextcloud-auth-info'},
            langDir: {type: String, attribute: 'lang-dir'},
            expandedTabulator: {type: Boolean},
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
        document.removeEventListener('keyup', this.boundPressEnterAndSubmitSearchHandler);
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
            setOverridesByGlobalCache(this._i18n, this).then(() => {
                that.loadingTranslations = false;
                that.requestUpdate();
            });
        } else {
            this.loadingTranslations = false;
        }

        this.updateComplete.then(() => {
            // see: http://tabulator.info/docs/5.1
            this._a('.tabulator-table').forEach((table) => {
                const tabulatorTable = /** @type {TabulatorTable} */ (table);
                tabulatorTable.buildTable();
                document.addEventListener('keyup', this.boundPressEnterAndSubmitSearchHandler);
                if (tabulatorTable.id == 'tabulator-table-orders')
                    tabulatorTable.addEventListener('click', this.selectedRow);
            });

            document.addEventListener('keyup', this.boundPressEnterAndSubmitSearchHandler);
        });
    }

    /**
     * Keydown Event function if enter pressed, then start filtering the table
     * @param event
     */
    pressEnterAndSubmitSearch(event) {
        if (event.keyCode === 13) {
            const activeElement = this.shadowRoot.activeElement;
            if (activeElement && activeElement.id === 'searchbar') {
                event.preventDefault();
                this.filterTable();
                this.hideAdditionalSearchMenu(event);
            }
        }
    }

    /*
     * Clear Filer
     */
    clearFilter() {
        let filter = /** @type {HTMLInputElement } */ (this._('#searchbar'));
        let search = /** @type {HTMLSelectElement} */ (this._('#search-select'));
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));

        if (!filter || !search || !table) return;

        filter.value = '';
        search.value = 'all';
        table.clearFilter();
    }

    /**
     * Function for filtering table
     *
     */
    filterTable() {
        let filter = /** @type {HTMLInputElement } */ (this._('#searchbar'));
        let search = /** @type {HTMLSelectElement} */ (this._('#search-select'));
        let operator = /** @type {HTMLSelectElement} */ (this._('#search-operator'));
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));

        if (!filter || !operator || !search || !table) return;

        if (filter.value === '') {
            table.clearFilter();
            return;
        }
        const filterValue = filter.value;
        const searchValue = search.value;
        const operatorValue = operator.value;

        if (searchValue !== 'all') {
            let filter_object = {field: searchValue, type: operatorValue, value: filterValue};
            table.setFilter([filter_object]);
            return;
        } else {
            const columns = table.getColumnsFields();
            let listOfFilters = [];

            for (let col of columns) {
                let filter_object = {field: col, type: operatorValue, value: filterValue};
                listOfFilters.push(filter_object);
            }
            table.setFilter([listOfFilters]);
        }
    }

    /**
     * Toggle additional functionalities menu on mobile
     *
     */
    toggleMoreMenu() {
        const menu = this.shadowRoot.querySelector('ul.extended-menu');
        const menuStart = this.shadowRoot.querySelector('a.extended-menu-link');

        if (menu === null || menuStart === null) {
            return;
        }

        menu.classList.toggle('hidden');

        if (!menu.classList.contains('hidden')) {
            // add event listener for clicking outside of menu
            document.addEventListener('click', this.boundCloseAdditionalSearchMenuHandler);
            this.initateOpenAdditionalMenu = true;
        } else {
            document.removeEventListener('click', this.boundCloseAdditionalSearchMenuHandler);
        }
    }

    /**
     * Hide additional functionalities menu
     * This function is used as bounded event function,
     * if clicked outside then we can close the menu
     *
     */
    hideAdditionalMenu() {
        if (this.initateOpenAdditionalMenu) {
            this.initateOpenAdditionalMenu = false;
            return;
        }
        const menu = this.shadowRoot.querySelector('ul.extended-menu');
        if (menu && !menu.classList.contains('hidden')) {
            this.toggleMoreMenu();
        }
    }

    /**
     * Toggle search menu
     *
     */
    toggleSearchMenu() {
        const menu = this._('#extendable-searchbar .extended-menu');
        const searchBarMenu = this._('#searchbar-menu');

        if (menu === null) {
            return;
        }

        menu.classList.remove('hidden');

        if (!menu.classList.contains('hidden')) {
            // add event listener for clicking outside of menu
            document.addEventListener('click', this.boundCloseAdditionalSearchMenuHandler);
            // add event listener for clicking *inside* of menu
            searchBarMenu.addEventListener(
                'click',
                this.boundCloseAdditionalSearchMenuHandlerInner,
            );
            this.initateOpenAdditionalSearchMenu = true;
        }
    }

    hideAdditionalSearchMenuInner(event) {
        const searchBarMenu = this._('#searchbar-menu');
        // Don't close the search widget if clicking inside
        if (searchBarMenu.contains(event.target)) {
            event.stopPropagation();
            this.initateOpenAdditionalSearchMenu = false;
            return;
        }
    }

    /**
     * hide search menu
     * @param e
     */
    hideAdditionalSearchMenu(e) {
        if (this.initateOpenAdditionalSearchMenu) {
            this.initateOpenAdditionalSearchMenu = false;
            return;
        }

        const menu = this._('#extendable-searchbar .extended-menu');
        const searchBarMenu = this._('#searchbar-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', this.boundCloseAdditionalSearchMenuHandler);
            searchBarMenu.removeEventListener(
                'click',
                this.boundCloseAdditionalSearchMenuHandlerInner,
            );
        }
    }

    /**
     * Creates options for a select box of the
     * this.submissionColumns Array (all possible cols of active table)
     * @returns {Array<html>} options
     */
    getTableHeaderOptions() {
        const i18n = this._i18n;
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));
        if (!table) return [];

        let options = [];
        options[0] = html`
            <option value="all">${i18n.t('show-requests.all-columns')}</option>
        `;
        let lang = table.getLang().columns;
        Object.entries(lang).forEach(([key, value], counter) => {
            if (key !== 'actions') {
                options[counter + 1] = html`
                    <option value="${key}">${value}</option>
                `;
            }
        });

        return options;
    }

    rowClick(event) {
        this.selected = true;
        let deleteButton = /** @type {HTMLButtonElement} */ (this._('#delete-all-btn'));
        let submitButton = /** @type {HTMLButtonElement} */ (this._('#submit-all-btn'));
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));
        if (table.getSelectedRows().length !== 0) {
            deleteButton.disabled = false;
            submitButton.disabled = false;
        } else {
            deleteButton.disabled = true;
            submitButton.disabled = true;
        }
    }

    async processSelectedOrganization(event) {
        const i18n = this._i18n;
        this.storeGroupValue(event.detail.value);
        this.groupId = event.target.valueObject.identifier;

        if (event.target.valueObject.accessRights) {
            this.mayReadAddress = event.target.valueObject.accessRights.includes('wra');
            this.mayReadMetadata = event.target.valueObject.accessRights.includes('rm');
            this.mayRead = event.target.valueObject.accessRights.includes('rc');
            this.mayWrite = event.target.valueObject.accessRights.includes('w');
        }
        this.organizationSet = true;

        this.getListOfRequests().then(() => {
            let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));
            this.currentTable = table;
            let data = [];
            this.requestList.forEach((item, index) => {
                let recipientStatus = item['dateSubmitted']
                    ? this.checkRecipientStatus(item.recipients)[1]
                    : i18n.t('show-requests.empty-date-submitted');
                let controls_div = this.createScopedElement('div');
                controls_div.classList.add('tabulator-icon-buttons');
                if (recipientStatus === i18n.t('show-requests.empty-date-submitted')) {
                    let btn_edit = this.createScopedElement('dbp-icon-button');
                    btn_edit.setAttribute('icon-name', 'pencil');
                    btn_edit.setAttribute(
                        'aria-label',
                        i18n.t('show-requests.edit-request-button-text'),
                    );
                    btn_edit.setAttribute(
                        'title',
                        i18n.t('show-requests.edit-request-button-text'),
                    );
                    btn_edit.addEventListener('click', async (event) => {
                        this.currentRowIndex = index.toString();
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
                    btn_delete.setAttribute(
                        'title',
                        i18n.t('show-requests.delete-request-button-text'),
                    );
                    btn_delete.addEventListener('click', async (event) => {
                        this.deleteRequest(table, event, item, index);
                        event.stopPropagation();
                    });
                    controls_div.appendChild(btn_delete);

                    let btn_submit = this.createScopedElement('dbp-icon-button');
                    btn_submit.setAttribute('icon-name', 'send-diagonal');
                    btn_submit.setAttribute(
                        'aria-label',
                        i18n.t('show-requests.send-request-button-text'),
                    );
                    btn_submit.setAttribute(
                        'title',
                        i18n.t('show-requests.send-request-button-text'),
                    );
                    btn_submit.addEventListener('click', async (event) => {
                        this.currentItem = item;
                        this.submitRequest(table, event, item, index);
                        event.stopPropagation();
                    });
                    controls_div.appendChild(btn_submit);
                } else {
                    let btn_research = this.createScopedElement('dbp-icon-button');
                    btn_research.setAttribute('icon-name', 'keyword-research');
                    btn_research.setAttribute(
                        'aria-label',
                        i18n.t('show-requests.show-detailed-dispatch-order'),
                    );
                    btn_research.setAttribute(
                        'title',
                        i18n.t('show-requests.show-detailed-dispatch-order'),
                    );
                    btn_research.addEventListener('click', async (event) => {
                        this.editRequest(event, item);
                        event.stopPropagation();
                    });
                    controls_div.appendChild(btn_research);
                }
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
                    actions: controls_div,
                };
                data.push(order);
            });
            table.setData(data);
        });
    }

    deleteSelectedRows() {
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));
        table.deleteSelectedRows();
    }

    setTabulatorData() {}

    expandAll() {
        this.expanded = true;
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));
        table.expandAll();
    }

    collapseAll() {
        this.expanded = false;
        let table = /** @type {TabulatorTable} */ (this._('#tabulator-table-orders'));
        table.collapseAll();
    }

    _onLoginClicked(e) {
        this.sendSetPropertyEvent('requested-login-status', 'logged-in');
        e.preventDefault();
    }

    static get styles() {
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getLinkCss()}
            ${commonStyles.getNotificationCSS()}
            ${commonStyles.getActivityCSS()}
            ${commonStyles.getModalDialogCSS()}
            ${commonStyles.getButtonCSS()}
            ${dispatchStyles.getDispatchRequestStyles()}

            .control.table {
                padding-top: 1.5rem;
                font-size: 1.5rem;
                text-align: center;
            }

            .muted {
                color: var(--dbp-muted);
            }

            #search-operator,
            #search-select,
            .dropdown-menu {
                background-color: var(--dbp-secondary-surface);
                color: var(--dbp-on-secondary-surface);
                border-color: var(--dbp-secondary-surface-border-color);
                background-size: auto 45%;
                padding-bottom: calc(0.375em - 1px);
                padding-left: 0.75em;
                padding-right: 1.5rem;
                padding-top: calc(0.375em - 1px);
                cursor: pointer;
                background-position-x: calc(100% - 0.4rem);
                box-sizing: content-box;
            }

            #search-select,
            #search-operator {
                margin-bottom: 10px;
                box-sizing: border-box;
                text-align: left;
            }

            .extended-menu.hidden {
                display: none !important;
            }

            #extendable-searchbar .extended-menu {
                list-style: none;
                border: var(--dbp-border);
                background-color: var(--dbp-background);
                z-index: 1000;
                border-radius: var(--dbp-border-radius);
                width: 100%;
                position: absolute;
                right: 0px;
                background-color: var(--dbp-background);
                padding: 10px;
                box-sizing: border-box;
                top: 33px;
                margin: 0px;
                border-top: unset;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .search-wrapper {
                display: flex;
                justify-content: center;
                min-width: 300px;
            }

            .table-wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            #extendable-searchbar {
                display: flex;
                flex-grow: 1;
                position: relative;
                width: 320px;
            }

            #searchbar {
                width: 100%;
                box-sizing: border-box;
                border: var(--dbp-border);
                padding: calc(0.375em - 1px) 10px;
                border-radius: var(--dbp-border-radius);
                min-height: 33px;
                background-color: var(--dbp-background);
                color: var(--dbp-content);
            }

            #search-button {
                margin-left: -40px;
                font-size: 1rem;
            }

            .edit-selection-buttons {
                display: flex;
                gap: 1em;
                margin-left: 1em;
            }

            .edit-items {
                font-size: 1.6rem;
            }

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

            .sender-data {
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

            @media only screen and (max-width: 1150px) {
                .table-wrapper {
                    flex-direction: column;
                    gap: 1em;
                }

                .selected-buttons,
                .filter-buttons {
                    width: 100%;
                }

                #extendable-searchbar {
                    width: 100%;
                }

                .edit-selection-buttons {
                    margin-left: 0;
                    width: 100%;
                }

                .edit-selection-buttons dbp-loading-button {
                    flex-grow: 1;
                    flex-shrink: 1;
                    /* flex-basis: 25%; */
                }
            }

            @media only screen and (max-width: 800px) {
                .edit-selection-buttons {
                    gap: 6px;
                }
            }

            @media only screen and (orientation: portrait) and (max-width: 768px) {
                .edit-selection-buttons {
                    display: flex;
                    gap: 1em;
                    width: 100%;
                }

                #searchbar {
                    width: 100%;
                    height: 40px;
                }

                #extendable-searchbar {
                    width: calc(-30px + 100vw);
                }

                #search-button {
                    position: absolute;
                    right: 0px;
                    top: 0px;
                    height: 40px;
                    box-sizing: border-box;
                }

                #search-button dbp-icon {
                    top: 0px;
                }

                #open-settings-btn {
                    margin-top: 0;
                }

                .table-wrapper {
                    flex-direction: column;
                    gap: 1em;
                }

                .filter-buttons {
                    width: calc(100% - 45px);
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

        if (
            this.isLoggedIn() &&
            !this.isLoading() &&
            !this._initialFetchDone &&
            !this.initialRequestsLoading &&
            this.organizationSet
        ) {
            this.getListOfRequests();
        }
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
                    actions: i18n.t('show-requests.actions', {lng: 'en'}),
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
                    actions: i18n.t('show-requests.actions', {lng: 'de'}),
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
                    formatter: function (cell, formatterParams, onRendered) {
                        onRendered(function () {
                            var element = cell.getElement();

                            if (element.scrollWidth > element.clientWidth) {
                                element.style.whiteSpace = 'wrap';
                            }
                        });

                        return cell.getValue();
                    },
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
                    title: 'actions',
                    field: 'actions',
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
            <div class="control ${classMap({hidden: this.isLoggedIn() || !this.isLoading() || !this.loadingTranslations})}">
                <span class="loading">
                    <dbp-mini-spinner text=${i18n.t('loading-message')}></dbp-mini-spinner>
                </span>
            </div>

            <div
                    class="notification is-warning ${classMap({
                        hidden: this.isLoggedIn() || this.isLoading(),
                    })}">
                ${i18n.t('error-login-message')} <a href="#" @click="${this._onLoginClicked}">${i18n.t('error-login-link')}</a>
            </div>

            <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations})}">

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
                                   }),
                               );
                               e.preventDefault();
                           }}"
                        >
                            <span>${i18n.t('show-requests.create-new-request')}.</span>
                        </a>
                    </p>
                </slot>

                 <div class="${classMap({hidden: this.showDetailsView})}">
                    ${i18n.t('show-requests.organization-select-description')}
                    <div class="choose-and-create-btns">
                        <dbp-resource-select
                                    id="show-resource-select"
                                    subscribe="lang,entry-point-url,auth"
                                    lang="${this.lang}"
                                    resource-path="dispatch/groups"
                                    value="${this.groupValue}"
                                    @change=${(event) => {
                                        if (this.isLoggedIn() && !this.isLoading()) {
                                            this.processSelectedOrganization(event).then(() => {});
                                        }
                                    }}
                        ></dbp-resource-select>
                    </div>
                </div>

                <div class="no-access-notification">
                    <dbp-inline-notification class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations || this.mayWrite || !this.organizationSet})}"
                                             type="${this.mayRead || this.mayReadMetadata ? 'warning' : 'danger'}"
                                             body="${this.mayRead || this.mayReadMetadata ? i18n.t('error-no-writes') : i18n.t('error-no-read')}">
                    </dbp-inline-notification>
                </div>

                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView || !this.organizationSet || this.loadingTranslations})}">
                    ${i18n.t('show-requests.dispatch-orders')}
                </h3>




                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations || this.showDetailsView || !this.organizationSet || (!this.mayRead && !this.mayReadMetadata)})}">
                    <div class="table-wrapper">
                        <div class="selected-buttons">
                                <div class="filter-buttons ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations || this.showDetailsView || !this.organizationSet})}"
                                    <div class="search-wrapper ">
                                        <div id="extendable-searchbar">
                                            <input type="text" id="searchbar" placeholder="${i18n.t('show-requests.search-box-text')}" @click='${() => {
                                                this.toggleSearchMenu();
                                            }}'>
                                            <dbp-icon-button id="search-button"
                                                title="${i18n.t('show-requests.search-box-text')}"
                                                icon-name="search"
                                                aria-label="${i18n.t(
                                                    'show-requests.search-box-text',
                                                )}"
                                                @click='${() => {
                                                    this.filterTable();
                                                }}'></dbp-icon-button>
                                            <ul class='extended-menu hidden' id='searchbar-menu'>
                                                <label for='search-select'>${i18n.t('show-requests.search-in')}:</label>
                                                <select id='search-select' class='button dropdown-menu'
                                                        title='${i18n.t('show-requests.search-in-column')}:'>
                                                    ${this.getTableHeaderOptions()}
                                                </select>

                                                <label for='search-operator'>${i18n.t('show-requests.search-operator')}
                                                    :</label>
                                                <select id='search-operator' class='button dropdown-menu'>
                                                    <option value='like'>${i18n.t('show-requests.search-operator-like')}
                                                    </option>
                                                    <option value='='>${i18n.t('show-requests.search-operator-equal')}</option>
                                                    <option value='!='>${i18n.t('show-requests.search-operator-notequal')}
                                                    </option>
                                                    <option value='starts'>${i18n.t('show-requests.search-operator-starts')}
                                                    </option>
                                                    <option value='ends'>${i18n.t('show-requests.search-operator-ends')}
                                                    </option>
                                                    <option value='<'>${i18n.t('show-requests.search-operator-less')}</option>
                                                    <option value='<='>
                                                        ${i18n.t('show-requests.search-operator-lessthanorequal')}
                                                    </option>
                                                    <option value='>'>${i18n.t('show-requests.search-operator-greater')}
                                                    </option>
                                                    <option value='>='>
                                                        ${i18n.t('show-requests.search-operator-greaterorequal')}
                                                    </option>
                                                    <option value='regex'>${i18n.t('show-requests.search-operator-regex')}
                                                    </option>
                                                    <option value='keywords'>
                                                        ${i18n.t('show-requests.search-operator-keywords')}
                                                    </option>
                                                </select>
                                            </ul>
                                        </div>
                                    </div>

                                    <dbp-icon-button class="hidden ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations || this.showDetailsView})}" id="open-settings-btn"
                                        ?disabled="${this.loading}"
                                        @click="${() => {}}"
                                        title="TODO"
                                        icon-name="iconoir_settings"></dbp-icon-button>
                                </div>
                                <div class="edit-selection-buttons ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.loadingTranslations || this.showDetailsView})}">
                                ${
                                    this.mayWrite
                                        ? html`
                                              <dbp-loading-button
                                                  id="select-all-btn"
                                                  class="${classMap({hidden: this.allSelected})}"
                                                  value="${i18n.t('show-requests.select-all')}"
                                                  @click="${() => {
                                                      this.allSelected = true;
                                                      const table = /** @type {TabulatorTable} */ (
                                                          this._('#tabulator-table-orders')
                                                      );
                                                      table.selectAllVisibleRows();
                                                      this.toggleDeleteAndSubmitButtons(
                                                          '#tabulator-table-orders',
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
                                                          this._('#tabulator-table-orders')
                                                      );
                                                      table.deselectAllRows();
                                                      this.toggleDeleteAndSubmitButtons(
                                                          '#tabulator-table-orders',
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
                                                  @click="${() => {
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
                                              <dbp-loading-button
                                                  id="delete-all-btn"
                                                  disabled
                                                  value="${i18n.t(
                                                      'show-requests.delete-button-text',
                                                  )}"
                                                  @click="${async (event) => {
                                                      await this.deleteSelected();
                                                      this.toggleDeleteAndSubmitButtons(
                                                          '#tabulator-table-orders',
                                                      );
                                                  }}"
                                                  title="${i18n.t(
                                                      'show-requests.delete-button-text',
                                                  )}">
                                                  ${i18n.t('show-requests.delete-button-text')}
                                              </dbp-loading-button>
                                              <dbp-loading-button
                                                  id="submit-all-btn"
                                                  disabled
                                                  type="is-primary"
                                                  value="${i18n.t(
                                                      'show-requests.submit-button-text',
                                                  )}"
                                                  @click="${async (event) => {
                                                      await this.submitSelected();
                                                      this.toggleDeleteAndSubmitButtons(
                                                          '#tabulator-table-orders',
                                                      );
                                                  }}"
                                                  title="${i18n.t(
                                                      'show-requests.submit-button-text',
                                                  )}">
                                                  ${i18n.t('show-requests.submit-button-text')}
                                              </dbp-loading-button>
                                          `
                                        : ``
                                }

                            </div>
                        </div>

                    <div class="container">
                        <dbp-tabulator-table
                                lang="${this.lang}"
                                class="tabulator-table"
                                id="tabulator-table-orders"
                                identifier="orders-table"
                                collapse-enabled
                                pagination-size="10"
                                pagination-enabled
                                select-rows-enabled
                                sticky-header
                                .options=${options}>
                        </dbp-tabulator-table>

                        </div>
                            <div class="control table ${classMap({hidden: !this.initialRequestsLoading && !this.tableLoading})}">
                                <span class="loading">
                                    <dbp-mini-spinner text=${i18n.t('show-requests.loading-table-message')}></dbp-mini-spinner>
                                </span>
                            </div>

                        </div>
                    </div>
                ${
                    this.mayRead || this.mayReadMetadata
                        ? html`
                              <div class="back-container">
                                  <span
                                      class="back-navigation ${classMap({
                                          hidden:
                                              !this.isLoggedIn() ||
                                              this.isLoading() ||
                                              this.loadingTranslations ||
                                              this.showListView ||
                                              !this.organizationSet,
                                      })}">
                                      <a
                                          href="#"
                                          title="${i18n.t('show-requests.back-to-list')}"
                                          @click="${() => {
                                              let table = /** @type {TabulatorTable} */ (
                                                  this._('#tabulator-table-orders')
                                              );
                                              let currentPage = table ? table.getPage() : 1;
                                              this.getListOfRequests().then(() => {
                                                  table ? table.setPage(currentPage) : null;
                                              });
                                              this.showListView = true;
                                              this.showDetailsView = false;
                                              this.currentItem = {};
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
                                          }}">
                                          <dbp-icon name="chevron-left"></dbp-icon>
                                          ${i18n.t('show-requests.back-to-list')}
                                      </a>
                                  </span>
                              </div>

                              <h3
                                  class="${classMap({
                                      hidden:
                                          !this.isLoggedIn() ||
                                          this.isLoading() ||
                                          this.loadingTranslations ||
                                          this.showListView ||
                                          !this.organizationSet,
                                  })}">
                                  ${(this.currentItem && this.currentItem.dateSubmitted) ||
                                  !this.mayWrite
                                      ? i18n.t('show-requests.show-detailed-dispatch-order', {
                                            id: this.currentItem.identifier,
                                        })
                                      : i18n.t('show-requests.detailed-dispatch-order', {
                                            id: this.currentItem.identifier,
                                        })}:
                              </h3>

                              <div
                                  class="${classMap({
                                      hidden:
                                          !this.isLoggedIn() ||
                                          this.isLoading() ||
                                          this.loadingTranslations ||
                                          this.showListView ||
                                          !this.organizationSet,
                                  })}">
                                  ${this.currentItem && !this.currentItem.dateSubmitted
                                      ? html`
                                            <div class="request-buttons">
                                                <div class="edit-buttons">
                                                    <dbp-loading-button
                                                        id="delete-btn"
                                                        ?disabled="${this.loading ||
                                                        this.currentItem.dateSubmitted ||
                                                        !this.mayWrite}"
                                                        value="${i18n.t(
                                                            'show-requests.delete-button-text',
                                                        )}"
                                                        @click="${(event) => {
                                                            this.deleteRequest(
                                                                this.currentTable,
                                                                event,
                                                                this.currentItem,
                                                            );
                                                        }}"
                                                        title="${i18n.t(
                                                            'show-requests.delete-button-text',
                                                        )}">
                                                        ${i18n.t(
                                                            'show-requests.delete-button-text',
                                                        )}
                                                    </dbp-loading-button>
                                                </div>
                                                <div class="submit-button">
                                                    <dbp-loading-button
                                                        type="is-primary"
                                                        id="submit-btn"
                                                        ?disabled="${this.loading ||
                                                        this.currentItem.dateSubmitted ||
                                                        !this.mayWrite}"
                                                        value="${i18n.t(
                                                            'show-requests.submit-button-text',
                                                        )}"
                                                        @click="${(event) => {
                                                            this.submitRequest(
                                                                this.currentTable,
                                                                event,
                                                                this.currentItem,
                                                            );
                                                        }}"
                                                        title="${i18n.t(
                                                            'show-requests.submit-button-text',
                                                        )}">
                                                        ${i18n.t(
                                                            'show-requests.submit-button-text',
                                                        )}
                                                    </dbp-loading-button>
                                                </div>
                                            </div>
                                        `
                                      : ``}
                                  ${this.currentItem
                                      ? html`
                                            <div class="request-item details">
                                                <div class="details header">
                                                    <div>
                                                        <div class="section-titles">
                                                            ${i18n.t('show-requests.id')}
                                                            ${!this.currentItem.dateSubmitted
                                                                ? html`
                                                                      <dbp-icon-button
                                                                          id="edit-subject-btn"
                                                                          ?disabled="${this
                                                                              .loading ||
                                                                          this.currentItem
                                                                              .dateSubmitted ||
                                                                          !this.mayWrite}"
                                                                          @click="${(event) => {
                                                                              this.subject = this
                                                                                  .currentItem.name
                                                                                  ? this.currentItem
                                                                                        .name
                                                                                  : '';
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-subject-fn-dialog',
                                                                                  )
                                                                              ).value = this
                                                                                  .currentItem.name
                                                                                  ? this.currentItem
                                                                                        .name
                                                                                  : ``;
                                                                              // @ts-ignore
                                                                              MicroModal.show(
                                                                                  this._(
                                                                                      '#edit-subject-modal',
                                                                                  ),
                                                                                  {
                                                                                      disableScroll: true,
                                                                                      onClose: (
                                                                                          modal,
                                                                                      ) => {
                                                                                          //this.loading = false;
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
                                                        <div>
                                                            ${this.currentItem.name
                                                                ? html`
                                                                      ${this.currentItem.name}
                                                                  `
                                                                : html`
                                                                      ${this.mayReadMetadata &&
                                                                      !this.mayRead &&
                                                                      !this.mayWrite
                                                                          ? i18n.t(
                                                                                'show-requests.metadata-subject-text',
                                                                            )
                                                                          : i18n.t(
                                                                                'show-requests.no-subject-found',
                                                                            )}
                                                                  `}
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
                                                                      ${this.checkRecipientStatus(
                                                                          this.currentItem
                                                                              .recipients,
                                                                      )[0]}
                                                                  `
                                                                : html`
                                                                      <span class="status-orange">
                                                                          ●
                                                                      </span>
                                                                      ${i18n.t(
                                                                          'show-requests.empty-date-submitted',
                                                                      )}
                                                                  `}
                                                        </div>
                                                    </div>
                                                    <div class="line"></div>
                                                    <div>
                                                        <div class="section-titles">
                                                            ${i18n.t(
                                                                'show-requests.reference-number',
                                                            )}
                                                            ${!this.currentItem.dateSubmitted
                                                                ? html`
                                                                      <dbp-icon-button
                                                                          id="edit-reference-number-btn"
                                                                          ?disabled="${this
                                                                              .loading ||
                                                                          this.currentItem
                                                                              .dateSubmitted ||
                                                                          !this.mayWrite}"
                                                                          @click="${(event) => {
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-reference-number-fn-dialog',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentItem
                                                                                      .referenceNumber ??
                                                                                  ``;
                                                                              // @ts-ignore
                                                                              MicroModal.show(
                                                                                  this._(
                                                                                      '#edit-reference-number-modal',
                                                                                  ),
                                                                                  {
                                                                                      disableScroll: true,
                                                                                      onClose: (
                                                                                          modal,
                                                                                      ) => {
                                                                                          //this.loading = false;
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
                                                                      ${this.currentItem
                                                                          .referenceNumber}
                                                                  `
                                                                : html`
                                                                      ${i18n.t(
                                                                          'show-requests.empty-reference-number',
                                                                      )}
                                                                  `}
                                                        </div>
                                                    </div>
                                                </div>

                                                ${this.addSubHeader()} ${this.addSenderDetails()}

                                                <div class="details recipients">
                                                    <div class="header-btn">
                                                        <div class="section-titles">
                                                            ${i18n.t('show-requests.recipients')}
                                                            <span class="section-title-counts">
                                                                ${this.currentItem.recipients
                                                                    .length !== 0
                                                                    ? `(` +
                                                                      this.currentItem.recipients
                                                                          .length +
                                                                      `)`
                                                                    : ``}
                                                            </span>
                                                        </div>
                                                        ${!this.currentItem.dateSubmitted
                                                            ? html`
                                                                  <dbp-loading-button
                                                                      id="add-recipient-btn"
                                                                      ?disabled="${this.loading ||
                                                                      this.currentItem
                                                                          .dateSubmitted ||
                                                                      !this.mayWrite}"
                                                                      value="${i18n.t(
                                                                          'show-requests.add-recipient-button-text',
                                                                      )}"
                                                                      @click="${(event) => {
                                                                          this.currentRecipient =
                                                                              {};
                                                                          // @ts-ignore
                                                                          MicroModal.show(
                                                                              this._(
                                                                                  '#add-recipient-modal',
                                                                              ),
                                                                              {
                                                                                  disableScroll: true,
                                                                                  onClose: (
                                                                                      modal,
                                                                                  ) => {
                                                                                      //this.loading = false;
                                                                                  },
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

                                                    <div class="recipients-data">
                                                        ${this.sortRecipients(
                                                            this.currentItem.recipients,
                                                        ).map(
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
                                                                // @ts-ignore
                                                                MicroModal.show(
                                                                    this._('#show-recipient-modal'),
                                                                    {
                                                                        disableScroll: true,
                                                                        onShow: (modal) => {
                                                                            this.button = button;
                                                                        },
                                                                        onClose: (modal) => {
                                                                            //this.loading = false;
                                                                            this.currentRecipient =
                                                                                {};
                                                                            button.stop();
                                                                        },
                                                                    },
                                                                );
                                                            });
                                                        } catch {
                                                            button.stop();
                                                        } finally {
                                                            button.stop();
                                                        }
                                                    }}"
                                                    aria-label="${i18n.t('show-requests.show-recipient-button-text')}"
                                                    title="${i18n.t('show-requests.show-recipient-button-text')}"
                                                    icon-name="keyword-research"></dbp-icon></dbp-icon-button>
                                                ${
                                                    !this.currentItem.dateSubmitted
                                                        ? html`
                                                              <dbp-icon-button
                                                                  id="edit-recipient-btn"
                                                                  ?disabled="${this.loading ||
                                                                  this.currentItem.dateSubmitted ||
                                                                  !this.mayWrite ||
                                                                  (recipient.personIdentifier &&
                                                                      (recipient.electronicallyDeliverable ||
                                                                          recipient.postalDeliverable))}"
                                                                  @click="${(event) => {
                                                                      let button = event.target;
                                                                      button.start();
                                                                      this.currentRecipient =
                                                                          recipient;
                                                                      try {
                                                                          this.fetchDetailedRecipientInformation(
                                                                              recipient.identifier,
                                                                          ).then(() => {
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#edit-recipient-country-select',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentRecipient.addressCountry;
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-recipient-birthdate-day',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentRecipient.birthDateDay;
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-recipient-birthdate-month',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentRecipient.birthDateMonth;
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-recipient-birthdate-year',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentRecipient.birthDateYear;

                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-recipient-gn-dialog',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentRecipient.givenName;
                                                                              /** @type {HTMLInputElement } */ (
                                                                                  this._(
                                                                                      '#tf-edit-recipient-fn-dialog',
                                                                                  )
                                                                              ).value =
                                                                                  this.currentRecipient.familyName;
                                                                              /** @type {HTMLInputElement } */ (
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
                                                                              /** @type {HTMLInputElement } */ (
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
                                                                              /** @type {HTMLInputElement } */ (
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
                                                                              // @ts-ignore
                                                                              MicroModal.show(
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
                                                                                          //this.loading = false;
                                                                                          this.currentRecipient =
                                                                                              {};
                                                                                      },
                                                                                  },
                                                                              );
                                                                          });
                                                                      } finally {
                                                                          button.stop();
                                                                      }
                                                                  }}"
                                                                  aria-label="${i18n.t(
                                                                      'show-requests.edit-recipients-button-text',
                                                                  )}"
                                                                  title="${i18n.t(
                                                                      'show-requests.edit-recipients-button-text',
                                                                  )}"
                                                                  icon-name="pencil"></dbp-icon-button>
                                                              <dbp-icon-button
                                                                  id="delete-recipient-btn"
                                                                  ?disabled="${this.loading ||
                                                                  this.currentItem.dateSubmitted ||
                                                                  !this.mayWrite}"
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
                                        </div>`,
                                                        )}
                                                        <div
                                                            class="no-recipients ${classMap({
                                                                hidden:
                                                                    !this.isLoggedIn() ||
                                                                    this.currentItem.recipients
                                                                        .length !== 0,
                                                            })}">
                                                            ${i18n.t(
                                                                'show-requests.no-recipients-text',
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                ${this.addDetailedFilesView()}
                                            </div>
                                        `
                                      : ``}
                              </div>
                          `
                        : ``
                }
                </div>
            </div>

            ${this.addFilePicker()}

            ${this.addEditSenderModal()}

            ${this.addAddRecipientModal()}

            ${this.addEditRecipientModal()}

            ${this.addShowRecipientModal()}

            ${this.addEditSubjectModal()}

            ${this.addEditReferenceNumberModal()}

            ${this.addFileViewerModal()}
        `;
    }
}

commonUtils.defineCustomElement('dbp-show-requests', ShowRequests);

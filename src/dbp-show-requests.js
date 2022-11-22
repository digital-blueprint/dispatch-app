import {createInstance} from './i18n.js';
import {css, unsafeCSS, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import DBPDispatchLitElement from "./dbp-dispatch-lit-element";
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {LoadingButton, IconButton, Icon, MiniSpinner, InlineNotification, getIconSVGURL} from "@dbp-toolkit/common";
import {classMap} from "lit/directives/class-map.js";
import {Activity} from './activity.js';
import metadata from './dbp-show-requests.metadata.json';
import MicroModal from './micromodal.es';
import {FileSource} from '@dbp-toolkit/file-handling';
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import * as dispatchStyles from './styles';
import {name as pkgName} from './../package.json';
import {humanFileSize} from '@dbp-toolkit/common/i18next';
import * as dispatchHelper from "./utils";
import {PersonSelect} from "@dbp-toolkit/person-select";
import {ResourceSelect} from "@dbp-toolkit/resource-select";

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
        this.currentItem = null;
        this.currentRecipient = null;

        this.fileHandlingEnabledTargets = "local";
        this.nextcloudWebAppPasswordURL = "";
        this.nextcloudWebDavURL = "";
        this.nextcloudName = "";
        this.nextcloudFileURL = "";
        this.nextcloudAuthInfo = "";

        this.dispatchRequestsTable = null;

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
            loading: { type: Boolean, attribute: false },
            initialRequestsLoading: { type: Boolean, attribute: false },
            requestList: { type: Array, attribute: false },
            showListView: { type: Boolean, attribute: false },
            showDetailsView: { type: Boolean, attribute: false },
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
                            } else {
                                that.dispatchRequestsTable.selectRow("visible");
                                this._('#select_all').checked = true;
                            }
                            e.preventDefault();
                        },
                    },
                    {
                        title: 'Details',
                        field: 'details',
                        hozAlign: 'center',
                        width: 60,
                        headerSort: false,
                        responsive: 0,
                        widthGrow: 1,
                        formatter: 'responsiveCollapse'
                    },
                    {
                        title: 'Erstelldatum',
                        field: 'dateCreated',
                        responsive: 3,
                        widthGrow: 1,
                        minWidth: 160,
                        sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
                            const a_timestamp = Date.parse(a);
                            const b_timestamp = Date.parse(b);
                            return a_timestamp - b_timestamp;
                        },
                        formatter: function (cell, formatterParams, onRendered) {
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
                        title: 'Betreff',
                        field: 'subject',
                        responsive: 1,
                        widthGrow: 3,
                        minWidth: 150,
                    },
                    {
                        title: 'Status',
                        field: 'status',
                        responsive: 2,
                        widthGrow: 1,
                        minWidth: 120,
                    },
                    {
                        title: 'Absender',
                        field: 'sender',
                        // visible: false,
                        responsive: 8,
                        minWidth: 800,
                        formatter: function(cell, formatterParams, onRendered) {
                            let value = cell.getValue();
                            return value;
                        }
                    },
                    {
                        title: 'Angehängte Dateien',
                        field: 'files',
                        // visible: false,
                        responsive: 8,
                        minWidth: 800,
                        formatter: function(cell, formatterParams, onRendered) {
                            let value = cell.getValue();
                            return value;
                        }
                    },
                    {
                        title: 'Empfänger',
                        field: 'recipients',
                        // visible: false,
                        responsive: 8,
                        minWidth: 800,
                        formatter: function(cell, formatterParams, onRendered) {
                            let value = cell.getValue();
                            return value;
                        }
                    },
                    {
                        title: 'ID',
                        field: 'requestId',
                        responsive: 8,
                        minWidth: 150,
                        formatter: function(cell, formatterParams, onRendered) {
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
                        formatter: (cell, formatterParams, onRendered) => {
                            let value = cell.getValue();
                            return value;
                        },
                    },
                ],
                langs: {
                    'en': {
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
                    { column: 'status', dir: 'desc' },
                ],
            });

            this.dispatchRequestsTable.on("rowClick", this.rowClickFunction.bind(this));
            //this.dispatchRequestsTable.on("rowAdded", this.rowAddedFunction.bind(this));
            this.dispatchRequestsTable.on("dataLoaded", this.dataLoadedFunction.bind(this));
            this.dispatchRequestsTable.on("pageLoaded", this.pageLoadedFunction.bind(this));
        });
    }

    pageLoadedFunction(currentPageNumber) {
        this._('#select_all').checked = false;
    }

    dataLoadedFunction(data) {
        if (this.dispatchRequestsTable !== null) {
            const that = this;
            setTimeout(function () {
                if (that._('.tabulator-responsive-collapse-toggle-open')) {
                    that._a('.tabulator-responsive-collapse-toggle-open').forEach(
                        (element) =>
                            element.addEventListener('click', that.toggleCollapse.bind(that))
                    );
                }

                if (that._('.tabulator-responsive-collapse-toggle-close')) {
                    that._a('.tabulator-responsive-collapse-toggle-close').forEach(
                        (element) =>
                            element.addEventListener('click', that.toggleCollapse.bind(that))
                    );
                }
            }, 0);
        }
    }

    toggleCollapse(e) {
        const table = this.dispatchRequestsTable;
        // give a chance to draw the table
        // this is for getting more height in tabulator table, when toggle is called

        console.log(e);

        // const that = this;

        setTimeout(function () {
            // table.toggleColumn('sender');
            // table.toggleColumn('files');
            // table.toggleColumn('recipients');

            // if (table && that._('.tabulator-responsive-collapse-toggle')) {
            //     that._a('.tabulator-responsive-collapse-toggle').forEach((element) => {
            //         element.classList.toggle('dbp-open');
            //         console.log(e);
            //     });
            // }

            table.redraw();
        }, 0);
    }

    rowClickFunction(e, row) {
        if (
            this.dispatchRequestsTable !== null &&
            this.dispatchRequestsTable.getSelectedRows().length ===
            this.dispatchRequestsTable.getRows("visible").length) {
                this._('#select_all').checked = true;
        } else {
                this._('#select_all').checked = false;
        }
    }

    /**
     * Select or deselect all files from tabulator table
     *
     */
    selectAllFiles() {
        let allSelected = this.checkAllSelected();

        if (allSelected) {
            this.dispatchRequestsTable.getSelectedRows().forEach((row) => row.deselect());
        } else {
            this.dispatchRequestsTable.getRows().forEach((row) => row.select());
            // this.dispatchRequestsTable.selectRow();
        }
    }

    checkAllSelected() {
        if (this.dispatchRequestsTable) {
            let maxSelected = this.dispatchRequestsTable.getRows("visible").length;
            let selected = this.dispatchRequestsTable.getSelectedRows().length;
            // console.log('currently visible: ', this.dispatchRequestsTable.getRows("visible").length);
            // console.log('currently selected: ', this.dispatchRequestsTable.getSelectedRows().length);

            if (selected === maxSelected) {
                return true;
            }
        }
        return false;
    }

    createFormattedFilesList(list) {
        let output = "";
        list.forEach((file) => {
            output += file.name + "<br>";
        });
        if (output != "") {
            return output;
        } else {
            return '(Noch) keine Dateien angehängt';
        }
    }

    createFormattedRecipientsList(list) {
        let output = "";
        list.forEach((recipient) => {
            output += recipient.familyName + ", " + recipient.givenName + "<br>";
        });
        if (output != "") {
            return output;
        } else {
            return '(Noch) keine Empfänger';
        }
    }

    setControlsHtml(item) {
        let div = this.createScopedElement('div');
        div.classList.add('tabulator-icon-buttons');

        if (item.dateSubmitted) {
            let btn = this.createScopedElement('dbp-icon-button');
            btn.addEventListener('click', async event => {
                this.editRequest(event, item);
                event.stopPropagation();
            });
            btn.setAttribute('icon-name', 'keyword-research');
            div.appendChild(btn);
        } else {
            let btn_edit = this.createScopedElement('dbp-icon-button');
            btn_edit.addEventListener('click', async event => {
                this.editRequest(event, item);
                event.stopPropagation();
            });
            btn_edit.setAttribute('icon-name', 'pencil');
            div.appendChild(btn_edit);

            let btn_delete = this.createScopedElement('dbp-icon-button');
            btn_delete.addEventListener('click', async event => {
                this.deleteRequest(event, item);
                event.stopPropagation();
            });
            btn_delete.setAttribute('icon-name', 'trash');

            div.appendChild(btn_delete);

            let btn_submit = this.createScopedElement('dbp-icon-button');
            btn_submit.addEventListener('click', async event => {
                this.submitRequest(event, item);
                event.stopPropagation();
            });
            btn_submit.setAttribute('icon-name', 'send-diagonal');

            div.appendChild(btn_submit);
        }

        return div;
    }

    createTableObject(list) {
        const i18n = this._i18n;
        let tableObject = [];

        console.log(list);

        list.forEach((item) => {
            let content = {
                requestId: item.identifier,
                subject: item.name ? item.name : i18n.t('show-requests.no-subject-found'),
                status: item.dateSubmitted ? 'Abgeschlossen' : 'In Bearbeitung',
                dateCreated: item.dateCreated,
                details: "Details",
                sender: item.senderFamilyName + " " + item.senderGivenName + "<br>"
                        + item.senderStreetAddress + " " + item.senderBuildingNumber + "<br>"
                        + item.senderPostalCode + " " + item.senderAddressLocality + "<br>"
                        + item.senderAddressCountry,
                files: this.createFormattedFilesList(item.files),
                recipients: this.createFormattedRecipientsList(item.recipients),
                controls: this.setControlsHtml(item),
            };
            tableObject.push(content);
        });

        console.log(tableObject);
        return tableObject;
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
            /*${commonStyles.getRadioAndCheckboxCss()}*/
            ${dispatchStyles.getShowDispatchRequestsCss()}

            select:not(.select) {
                background-size: 13px;
                background-position-x: calc(100% - 0.4rem);
                padding-right: 1.3rem;
                height: 33px;
            }
            
            .tabulator-icon-buttons {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
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

            .tabulator-responsive-collapse table tr td:first-child {
                width: 4em;
            }
            
            #extendable-searchbar {
                display: flex;
                flex-grow: 1;
                position: relative;
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

            .edit-items {
                font-size: 1.6rem;
            }
            
            .tabulator-row, .tabulator-row.tabulator-row-even, .tabulator-row.tabulator-row-odd {
                margin-bottom: 1rem;
                border: 1px solid var(--dbp-override-muted);
                min-height: 65px;
            }
            
            .tabulator-cell {
                height: 65px;
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
                /*margin: 0.5em 0 0.5em 16px;*/
                margin: 0 0 0.5em 1px;
                line-height: 1.5;
            }

            .request-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 3px;
                margin-top: -1.5em;
                padding-bottom: 1.5em;
            }
            
            
            .request-item.details .recipients-data,
            .request-item.details .files-data {
                display: grid;
                gap: 1.5em;
                grid-template-columns: 1fr 1fr 1fr;
            }

            .request-item.details .recipients-data {
                padding-bottom: 2em;
            }
            
            .request-item.details .request-buttons {
                padding-top: 1.5em;
                border-top: 1px solid var(--dbp-override-muted);
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
                font-size: 0.9em;
                padding-right: 7px;
            }
            
            .edit-recipient-btn {
                margin-left: -1.5em;
                padding-bottom: 1em;
            }
            
            .recipient-entry .border,
            .file-entry .border {
                margin-left: -1.5em;
                margin-bottom: 1em;
            }
            
            .file-entry {
                display: flex;
                justify-content: space-between;
            }
            
            #add-file-2-btn {
                margin-top: 1em;
            }

            .delete-file-btn {
                margin-top: 0.5em;
            }
            
            .rec-2-btns {
                display: flex;
                flex-direction: row-reverse;
            }
            
            .selected-buttons {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 0.5rem;
                justify-content: space-between;
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
                max-height: 630px;
                min-height: 630px;
                min-width: 320px;
                max-width: 400px;
            }

            #show-recipient-modal-box {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 15px 20px 20px;
                height: auto;
                min-height: fit-content;
                min-width: 320px;
                max-width: 400px;
            }

            #edit-sender-modal-box header.modal-header,
            #add-recipient-modal-box header.modal-header,
            #edit-recipient-modal-box header.modal-header,
            #show-recipient-modal-box header.modal-header {
                padding: 0px;
                display: flex;
                justify-content: space-between;
            }

            #show-recipient-modal-box header.modal-header {
                padding: 0 10px 20px 0;
            }

            #edit-sender-modal-box footer.modal-footer .modal-footer-btn,
            #add-recipient-modal-box footer.modal-footer .modal-footer-btn,
            #edit-recipient-modal-box footer.modal-footer .modal-footer-btn,
            #show-recipient-modal-box footer.modal-footer .modal-footer-btn {
                padding: 0px;
                display: flex;
                justify-content: space-between;
            }
            
             #show-recipient-modal-box footer.modal-footer .modal-footer-btn {
                padding: 0 10px 10px 0;
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
            #edit-recipient-modal-content .nf-label{
                padding-bottom: 2px;
            }
            
            #edit-sender-modal-title,
            #add-recipient-modal-title,
            #edit-recipient-modal-title,
            #show-recipient-modal-title {
                margin: 0;
                padding: 0.25em 0 0 0;
            }
            
            .line {
                border-right: 1px solid var(--dbp-override-muted);
            }
            
            .details.header {
                display: grid;
                grid-template-columns: 1fr 1px 1fr 1px 1fr;
                padding-bottom: 1.5em;
                border-bottom: 1px solid var(--dbp-override-muted);
                text-align: center;
            }
            
            .details.sender, .details.files {
                padding-top: 1.5em;
                padding-bottom: 1.5em;
                border-bottom: 1px solid var(--dbp-override-muted);
            }
            
            .details.recipients {
                padding-top: 1.5em;
            }
            
            .section-titles {
                font-size: 1.3em;
                color: var(--dbp-override-muted);
                text-transform: uppercase;
                padding-bottom: 0.5em;
            }
            
            .header-btn {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
            
            .card {
                display: grid;
                grid-template-columns: 4fr min-content;
                border: 1px solid var(--dbp-override-muted);
                min-width: 320px;
            }
            
            .left-side {
                margin: 18px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .left-side div {
                word-break: break-all;
            }
            
            .file.card .left-side {
                padding-bottom: 1.4em;
            }

            .file.card .left-side div:first-child {
                padding-bottom: 0.2em;
                font-weight: 400;
            }
            
            .right-side {
                padding: 10px;
                color: #FFFFFF;
                background-color: #245b78;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 10px;
            }
            
            .right-side dbp-icon {
                color: #FFFFFF;
            }
            
            .recipients-data, .files-data {
               margin-top: 0.5em;
            }
            
            .status-green {
                color: var(--dbp-override-success);
            }
            
            .status-orange {
                color: var(--dbp-override-warning-surface);
            }
            
            .back-container {
                padding-top: 1em;
                /*padding-bottom: 0.5em;*/
            }
            
            .section-title-counts {
                font-style: italic;
            }

            .element-left {
                background-color: var(--dbp-primary-surface);
                color: var(--dbp-on-primary-surface);
                padding: 0px 20px 12px 40px;
                text-align: right;
            }
            
            .element-left.first, .element-right.first {
                padding-top: 12px;
            }
            
            .element-right {
                text-align: left;
                margin-left: 12px;
                padding: 0px 0px 12px;
            }

            .detailed-recipient-modal-content-wrapper {
                display: grid;
                grid-template-columns: min-content auto;
                grid-template-rows: auto;
                max-height: calc(100vh - 149px);
                overflow-y: auto;
                width: 100%;
            }
            
            /*
            #show-recipient-modal-content .modal-content-item {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 10px;
            }
             */

            .tabulator .tabulator-footer .tabulator-paginator .tabulator-page[disabled] {
                opacity: 0.4;
            }
            
            .tabulator .tabulator-footer .tabulator-page {
                display: inline-block;
                margin: 0 2px;
                padding: 2px 5px;
                border: 1px solid #aaa;
                border-radius: 3px;
                background: hsla(0,0%,100%,.2);
            }

            .tabulator-cell[tabulator-field=controls] {
                justify-content: flex-end!important;
            }
            
            .tabulator .tabulator-header .tabulator-col.tabulator-sortable .tabulator-col-content .tabulator-col-sorter {
                position: unset;
            }
            
            .tabulator .tabulator-header .tabulator-col.tabulator-sortable .tabulator-col-content .tabulator-col-title-holder {
                display: inline-flex;
            }
            
            #search-button dbp-icon {
                top: -4px;
            }
            
            #open-settings-btn dbp-icon,
            .card .button.is-icon dbp-icon,
            .header-btn .button.is-icon dbp-icon {
                font-size: 1.3em;
            }
            
            @media only screen and (orientation: portrait) and (max-width: 768px) {
                
                #searchbar {
                    width: 100%;
                    height: 40px;
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
                
                .edit-selection-buttons {
                    display: flex;
                    flex-direction: column-reverse;
                    gap: 1em;
                }
                
                .filter-buttons {
                    width: calc(100% - 45px);
                }

                #show-recipient-modal-box {
                    height: 100%;
                }
                
                #show-recipient-modal-box header.modal-header {
                    padding: 0;
                }

                #show-recipient-modal-box .detailed-recipient-modal-content-wrapper {
                    grid-template-columns: unset;
                    max-height: calc(100vh - 70px);
                }

                .mobile-hidden {
                    display: none;
                }
                
                button[data-page="prev"], button[data-page="next"], button[data-page="first"], button[data-page="last"] {
                    display: block;
                    white-space: nowrap !important;
                    overflow: hidden;
                    line-height: 0;
                }

                button[data-page="prev"]:after, button[data-page="next"]:after, button[data-page="first"]:after, button[data-page="last"]:after {
                    content: '\\00a0\\00a0\\00a0\\00a0';
                    background-color: var(--dbp-content);
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center center;
                    mask-position: center center;
                    padding: 0 0 0.25% 0;
                    -webkit-mask-size: 1.5rem !important;
                    mask-size: 1.4rem !important;
                }

                .tabulator .tabulator-footer .tabulator-paginator .tabulator-page {
                    border: none;
                }
                
                button[data-page="prev"]:after {
                    -webkit-mask-image: url("${unsafeCSS(getIconSVGURL('chevron-left'))}");
                    mask-image: url("${unsafeCSS(getIconSVGURL('chevron-left'))}");
                }

                button[data-page="next"]:after {
                    -webkit-mask-image: url("${unsafeCSS(getIconSVGURL('chevron-right'))}");
                    mask-image: url("${unsafeCSS(getIconSVGURL('chevron-right'))}");
                }

                button[data-page="first"]:after {
                    content: '\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0';
                    -webkit-mask-image: url("${unsafeCSS(getIconSVGURL('angle-double-left'))}");
                    mask-image: url("${unsafeCSS(getIconSVGURL('angle-double-left'))}");
                }

                button[data-page="last"]:after {
                    content: '\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0';
                    -webkit-mask-image: url("${unsafeCSS(getIconSVGURL('angle-double-right'))}");
                    mask-image: url("${unsafeCSS(getIconSVGURL('angle-double-right'))}");
                }

                .tabulator .tabulator-footer .tabulator-footer-contents .tabulator-paginator .tabulator-pages {
                    display: none;
                }
                
                .tabulator .tabulator-footer .tabulator-paginator {
                    text-align: center;
                }
                
                .tabulator .tabulator-footer .tabulator-paginator label {
                    display: none;
                }
                
                .tabulator .tabulator-footer .tabulator-paginator .tabulator-page {
                    border: none;
                }
                
                .tabulator .tabulator-footer .tabulator-paginator .tabulator-page-size {
                    padding-right: 1.5em;
                    background-size: auto 40%;
                }
                
                #custom-pagination {
                    position: sticky;
                    bottom: 0px;
                    z-index: 10;
                }
                
                .tabulator-footer {
                    position: sticky;
                    bottom: 0px;
                    z-index: 10;
                }
                                
                .tabulator {
                    overflow: visible;
                }

                .element-right {
                    margin-left: 12px;
                    padding: 0 0 12px 0;
                }

                .element-right.first {
                    padding-top: 0;
                }

                .element-left {
                    text-align: left;
                    padding: 10px 5px 10px 5px;
                    background-color: inherit;
                    color: inherit;
                    font-weight: 400;
                    border-top: 1px solid #3333;
                }

                .element-left.first {
                    margin-top: 10px;
                    border-top: 0;
                }

                .btn-row-left {
                    display: flex;
                    justify-content: space-between;
                    flex-direction: row;
                    gap: 4px;
                    height: 40px;
                }
            }

            @media only screen and (max-width: 859.9px) {
                .request-item.details .recipients-data,
                .request-item.details .files-data {
                    gap: 1.5em;
                    grid-template-columns: 1fr;
                }
                
                .details.header {
                    grid-template-columns: unset;
                    gap: 0.5em;
                    text-align: left;
                }
                
                .header-btn {
                    flex-direction: column;
                    padding-bottom: 1em;
                }
                
                .request-buttons {
                    flex-direction: column-reverse;
                    gap: 1em;
                }
                
                .request-buttons .submit-button,
                .request-buttons .edit-buttons {
                    display: flex;
                    flex-direction: column;
                }
                
                .details.sender .header-btn {
                    flex-direction: row;
                    padding-bottom: 0;
                }
                
                .sender-data {
                        margin-bottom: 0;
                }
            }
            
            @media only screen and (max-width: 369.9px) {
                .card {
                    min-width: 30px;
                    max-width: 320px;
                }
            } 

            @media only screen and (min-width: 370px) and (max-width: 859.9px) {
                .card {
                    min-width: 320px;
                    max-width: unset;
                }
            }

            @media only screen and (min-width: 860px) and (max-width: 949.9px) {
                .request-item.details .recipients-data,
                .request-item.details .files-data {
                    gap: 0.5em;
                    grid-template-columns: 1fr 1fr;
                }
            }

            @media only screen and (min-width: 950px) and (max-width: 1250px) {
                .request-item.details .recipients-data,
                .request-item.details .files-data {
                    gap: 1.5em;
                    grid-template-columns: 1fr 1fr;
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

        if (this.isLoggedIn() && !this.isLoading() && !this._initialFetchDone && !this.initialRequestsLoading) {
            this.getListOfRequests();
        }

        return html`
            <link rel="stylesheet" href="${tabulatorCss}"/>
            
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

                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}">
                    ${i18n.t('show-requests.dispatch-orders')}
                </h3>
                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}">
                    <div class="table-wrapper">
                        <div class="selected-buttons">
                            <div class="filter-buttons ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}"
                                <div class="search-wrapper ">
                                    <div id="extendable-searchbar">
                                        <input type="text" id="searchbar" placeholder="Suchen">
                                        <dbp-icon-button id="search-button" title="Suchen" icon-name="search"></dbp-icon-button>
                                    </div>
                                </div>
                                <dbp-icon-button class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}" id="open-settings-btn"
                                            ?disabled="${this.loading}"
                                            @click="${() => { console.log('open settings'); }}"
                                            title="TODO"
                                            icon-name="iconoir_settings"></dbp-icon-button>
                            </div>
                            <div class="edit-selection-buttons ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}">
                                <dbp-loading-button id="delete-all-btn"
                                                    ?disabled="${this.loading}"
                                                    value="${i18n.t('show-requests.delete-button-text')}"
                                                    @click="${(event) => { this.deleteSelected(event); }}"
                                                    title="${i18n.t('show-requests.delete-button-text')}"
                                >
                                    ${i18n.t('show-requests.delete-button-text')}
                                </dbp-loading-button>
                                <dbp-loading-button id="submit-all-btn"
                                                    type="is-primary"
                                                    ?disabled="${this.loading}"
                                                    value="${i18n.t('show-requests.submit-button-text')}"
                                                    @click="${(event) => { this.submitSelected(event); }}"
                                                    title="${i18n.t('show-requests.submit-button-text')}"
                                >
                                    ${i18n.t('show-requests.submit-button-text')}
                                </dbp-loading-button>
                            </div>
                        </div>
                        <div class="dispatch-table ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showDetailsView })}">
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
                
                <div class="back-container">
                    <span class="back-navigation ${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView })}">
                        <a href="#" title="${i18n.t('show-requests.back-to-list')}"
                           @click="${(e) => {
                               this.showListView = true;
                               this.showDetailsView = false;
                               this.currentItem = null;
                           }}"
                        >
                            <dbp-icon name="chevron-left"></dbp-icon>
                            ${i18n.t('show-requests.back-to-list')}
                        </a>
                    </span>
                </div>
                
                <h3 class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView})}">
                    ${this.currentItem && this.currentItem.dateSubmitted ? i18n.t('show-requests.show-detailed-dispatch-order') : i18n.t('show-requests.detailed-dispatch-order')}:
                </h3>

                <div class="${classMap({hidden: !this.isLoggedIn() || this.isLoading() || this.showListView })}">

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
                                    <div class="section-titles">${i18n.t('show-requests.id')}</div>
                                    <div>${this.currentItem.name ? html`${this.currentItem.name}` : html`${i18n.t('show-requests.no-subject-found')}`}</div>
                                </div>
                                <div class="line"></div>
                                <div>
                                    <div class="section-titles">${i18n.t('show-requests.submit-status')}</div>
                                    <div>${this.currentItem.dateSubmitted ? html`<span class="status-green">●</span> ${i18n.t('show-requests.status-completed')}` : html`<span class="status-orange">●</span> ${i18n.t('show-requests.empty-date-submitted')}`}</div>
                                </div>
                                <div class="line"></div>
                                <div>
                                    <div class="section-titles">${i18n.t('show-requests.date-created')}</div>
                                    <div>${this.convertToReadableDate(this.currentItem.dateCreated)}</div>
                                </div>
                            </div>
                            
                            <div class="details sender">
                                <div class="header-btn">
                                    <div class="section-titles">${i18n.t('show-requests.sender')}</div>
                                    ${!this.currentItem.dateSubmitted ? html`
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
                                    ${this.currentItem.senderFamilyName ? html`${this.currentItem.senderFamilyName}` : ``}
                                    ${this.currentItem.senderFamilyName && this.currentItem.senderGivenName 
                                        ? html` ${this.currentItem.senderGivenName}` :
                                            html`${this.currentItem.senderGivenName ? html`${this.currentItem.senderGivenName}` : ``}
                                    `}
                                    ${this.currentItem.senderStreetAddress ? html`<br>${this.currentItem.senderStreetAddress}` : ``}
                                    ${this.currentItem.senderBuildingNumber ? html` ${this.currentItem.senderBuildingNumber}` : ``}
                                    ${this.currentItem.senderPostalCode ? html`<br>${this.currentItem.senderPostalCode}` : ``}
                                    ${this.currentItem.senderAddressLocality ? html` ${this.currentItem.senderAddressLocality}` : ``}
                                    ${this.currentItem.senderAddressCountry ? html`<br>${dispatchHelper.getCountryMapping()[this.currentItem.senderAddressCountry]}` : ``}
                                </div>

                                <div class="no-sender ${classMap({hidden: !this.isLoggedIn() || this.currentItem.senderFamilyName})}">${i18n.t('show-requests.empty-sender-text')}</div>

                            </div>
                            
                            <div class="details files">
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

                            <div class="details recipients">
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
                            
                            <div class="recipients-data">
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
                                <div class="no-recipients ${classMap({hidden: !this.isLoggedIn() || this.currentItem.recipients.length !== 0})}">${i18n.t('show-requests.no-recipients-text')}</div>
                              
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
        `;
    }
}

commonUtils.defineCustomElement('dbp-show-requests', ShowRequests);

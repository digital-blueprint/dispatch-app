import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import {createInstance} from './i18n';
import {send} from '@dbp-toolkit/common/notification';
import {FileSource, FileSink} from '@dbp-toolkit/file-handling';
import {html} from 'lit';
import * as dispatchHelper from './utils';
import {ResourceSelect} from '@dbp-toolkit/resource-select';
import {IconButton, LoadingButton} from '@dbp-toolkit/common';
import {humanFileSize} from '@dbp-toolkit/common/i18next';
import {classMap} from 'lit/directives/class-map.js';
import {getReferenceNumberFromPDF} from './utils';
import {TabulatorTable} from '@dbp-toolkit/tabulator-table';

export default class DBPDispatchLitElement extends DBPLitElement {
    constructor() {
        super();
        this.isSessionRefreshed = false;
        this.auth = {};
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.entryPointUrl = '';

        this.fileHandlingEnabledTargets = 'local';
        this.nextcloudWebAppPasswordURL = '';
        this.nextcloudWebDavURL = '';
        this.nextcloudName = '';
        this.nextcloudFileURL = '';
        this.nextcloudAuthInfo = '';

        this.currentItem = {};
        this.currentItemTabulator = {};
        this.currentRecipient = {};
        this.subject = '';
        this.groupId = '';
        this.groupValue = this.loadGroupValue();
        this.personSelectorIsDisabled = false;
        this.singleFileProcessing = false;
        this.totalNumberOfCreatedRequestItems = 0;

        this.currentTable = {};
        this.currentRowIndex = '';

        this.createdRequestsList = [];

        this.tempItem = {};
        this.tempValue = {};
        this.tempChange = false;
    }

    static get scopedElements() {
        return {
            'dbp-file-source': FileSource,
            'dbp-file-sink': FileSink,
            'dbp-resource-select': ResourceSelect,
            'dbp-icon-button': IconButton,
        };
    }

    static get properties() {
        return {
            ...super.properties,
            auth: {type: Object},

            currentItem: {type: Object, attribute: false},
            currentItemTabulator: {type: Object, attribute: false},
            currentRecipient: {type: Object, attribute: false},
            personSelectorIsDisabled: {type: Boolean, attribute: false},
            subject: {type: String, attribute: false},
            groupId: {type: String, attribute: false},
            tempItem: {type: Object, attribute: false},
            tempValue: {type: Object, attribute: false},

            createdRequestsList: {type: Array, attribute: false},

            fileHandlingEnabledTargets: {type: String, attribute: 'file-handling-enabled-targets'},
            nextcloudWebAppPasswordURL: {type: String, attribute: 'nextcloud-web-app-password-url'},
            nextcloudWebDavURL: {type: String, attribute: 'nextcloud-webdav-url'},
            nextcloudName: {type: String, attribute: 'nextcloud-name'},
            nextcloudFileURL: {type: String, attribute: 'nextcloud-file-url'},
            nextcloudAuthInfo: {type: String, attribute: 'nextcloud-auth-info'},
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this._loginStatus = '';
        this._loginState = [];
    }

    /**
     *  Request a re-rendering every time isLoggedIn()/isLoading() changes
     */
    _updateAuth() {
        this._loginStatus = this.auth['login-status'];

        let newLoginState = [this.isLoggedIn(), this.isLoading()];
        if (this._loginState.toString() !== newLoginState.toString()) {
            this.requestUpdate();
        }
        this._loginState = newLoginState;
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'auth':
                    this._updateAuth();
                    break;
            }
        });

        super.update(changedProperties);
    }

    /**
     * Returns if a person is set in or not
     * @returns {boolean} true or false
     */
    isLoggedIn() {
        return this.auth.person !== undefined && this.auth.person !== null;
    }

    /**
     * Returns true if a person has successfully logged in
     * @returns {boolean} true or false
     */
    isLoading() {
        if (this._loginStatus === 'logged-out') return false;
        return !this.isLoggedIn() && this.auth.token !== undefined;
    }

    /**
     * Send a fetch to given url with given options
     * @param url
     * @param options
     * @returns {Promise<object>} response (error or result)
     */
    async httpGetAsync(url, options) {
        let response = await fetch(url, options)
            .then((result) => {
                if (!result.ok) throw result;
                return result;
            })
            .catch((error) => {
                return error;
            });

        return response;
    }

    /**
     * Gets the list of all dispatch requests of the current logged-in user
     * @param groupId
     * @returns {Promise<object>} response
     */
    async getListOfDispatchRequests(groupId) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };
        return await this.httpGetAsync(
            this.entryPointUrl +
                '/dispatch/requests?perPage=9999&groupId=' +
                encodeURIComponent(groupId),
            options,
        );
    }

    /**
     * Gets the dispatch request of the current logged-in user with the given identifier
     * @param identifier
     * @returns {Promise<object>} response
     */
    async getDispatchRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };
        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/requests/' + encodeURIComponent(identifier),
            options,
        );
    }

    /**
     * Gets the dispatch recipient of the given ID
     * @param identifier
     * @returns {Promise<object>} response
     */
    async getDispatchRecipient(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };
        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/request-recipients/' + encodeURIComponent(identifier),
            options,
        );
    }

    /**
     * @returns {string}
     */
    getDefaultReferenceNumber() {
        const i18n = this._i18n;
        return i18n.t('create-request.default-reference-number');
    }

    /**
     * Sends a dispatch post request
     * @returns {Promise<object>} response
     */
    async sendCreateDispatchRequest() {
        const i18n = this._i18n;
        let body = {
            name:
                this.subject && this.subject !== ''
                    ? this.subject
                    : i18n.t('create-request.default-subject'),
            senderOrganizationName: this.currentItem.senderOrganizationName,
            senderFullName: this.currentItem.senderFullName
                ? this.currentItem.senderFullName
                : i18n.t('create-request.sender-full-name')
                  ? i18n.t('create-request.sender-full-name')
                  : '',
            senderAddressCountry: this.currentItem.senderAddressCountry,
            senderPostalCode: this.currentItem.senderPostalCode,
            senderAddressLocality: this.currentItem.senderAddressLocality,
            senderStreetAddress: this.currentItem.senderStreetAddress,
            senderBuildingNumber: '', //this.currentItem.senderBuildingNumber,
            groupId: this.groupId,
            referenceNumber: this.getDefaultReferenceNumber(),
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests', options);
    }

    /**
     * Sends a delete dispatch request
     * @param identifier
     * @returns {Promise<object>} response
     */
    async sendDeleteDispatchRequest(identifier) {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/requests/' + encodeURIComponent(identifier),
            options,
        );
    }

    /**
     * Updates (PATCHes) a dispatch request
     * @param identifier
     * @param body
     * @returns {Promise<object>} response
     */
    async sendPatchDispatchRequest(identifier, body) {
        const options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/merge-patch+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/requests/' + encodeURIComponent(identifier),
            options,
        );
    }

    /**
     * Sends a put dispatch request
     * @param identifier
     * @param senderOrganizationName
     * @param senderFullName
     * @param senderAddressCountry
     * @param senderPostalCode
     * @param senderAddressLocality
     * @param senderStreetAddress
     * @param senderBuildingNumber
     * @param groupId
     * @returns {Promise<object>} response
     */
    async sendEditDispatchRequest(
        identifier,
        senderOrganizationName,
        senderFullName,
        senderAddressCountry,
        senderPostalCode,
        senderAddressLocality,
        senderStreetAddress,
        senderBuildingNumber,
        groupId,
    ) {
        let body = {
            senderOrganizationName: senderOrganizationName,
            senderFullName: senderFullName,
            senderAddressCountry: senderAddressCountry,
            senderPostalCode: senderPostalCode,
            senderAddressLocality: senderAddressLocality,
            senderStreetAddress: senderStreetAddress,
            senderBuildingNumber: senderBuildingNumber,
            groupId: groupId,
        };

        return await this.sendPatchDispatchRequest(identifier, body);
    }

    /**
     * Sends a submit dispatch request
     * @param identifier
     * @returns {Promise<object>} response
     */
    async sendSubmitDispatchRequest(identifier) {
        let body = {};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/requests/' + encodeURIComponent(identifier) + '/submit',
            options,
        );
    }

    /**
     * Sends a dispatch request-recipients post request
     * @param id
     * @param personIdentifier
     * @param givenName
     * @param familyName
     * @param birthDate
     * @param addressCountry
     * @param postalCode
     * @param addressLocality
     * @param streetAddress
     * @returns {Promise<object>} response
     */
    async sendAddRequestRecipientsRequest(
        id,
        personIdentifier,
        givenName,
        familyName,
        birthDate,
        addressCountry,
        postalCode,
        addressLocality,
        streetAddress,
    ) {
        let body;

        if (personIdentifier === null) {
            if (birthDate !== '') {
                body = {
                    dispatchRequestIdentifier: id,
                    givenName: givenName,
                    familyName: familyName,
                    addressCountry: addressCountry,
                    postalCode: postalCode,
                    addressLocality: addressLocality,
                    streetAddress: streetAddress,
                    buildingNumber: '',
                    birthDate: birthDate,
                };
            } else {
                body = {
                    dispatchRequestIdentifier: id,
                    givenName: givenName,
                    familyName: familyName,
                    addressCountry: addressCountry,
                    postalCode: postalCode,
                    addressLocality: addressLocality,
                    streetAddress: streetAddress,
                    buildingNumber: '',
                };
            }
        } else {
            body = {
                dispatchRequestIdentifier: id,
                personIdentifier: personIdentifier,
                buildingNumber: '',
            };
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/request-recipients',
            options,
        );
    }

    async sendDeleteRecipientRequest(id) {
        const options = {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/request-recipients/' + encodeURIComponent(id),
            options,
        );
    }

    async sendAddFileToRequest(id, file) {
        let formData = new FormData();
        formData.append('dispatchRequestIdentifier', id);
        formData.append('file', file);

        const options = {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: formData,
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-files', options);
    }

    async sendDeleteFileRequest(id) {
        const options = {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/request-files/' + encodeURIComponent(id),
            options,
        );
    }

    async sendGetPersonRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };
        return await this.httpGetAsync(
            this.entryPointUrl + '/base/people/' + encodeURIComponent(identifier),
            options,
        );
    }

    async sendChangeSubjectRequest(identifier, subject) {
        let body = {
            name: subject,
        };

        return await this.sendPatchDispatchRequest(identifier, body);
    }

    /**
     * Send a PATCH request to the API to change the reference number of a request
     * @param identifier The identifier of the dispatch request
     * @param referenceNumber The new reference number
     */
    async sendChangeReferenceNumberRequest(identifier, referenceNumber) {
        let body = {
            referenceNumber: referenceNumber,
        };

        return await this.sendPatchDispatchRequest(identifier, body);
    }

    async sendGetStatusChangeRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };
        return await this.httpGetAsync(
            this.entryPointUrl +
                '/dispatch/request-status-changes/' +
                encodeURIComponent(identifier),
            options,
        );
    }

    async sendGetFileRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };
        return await this.httpGetAsync(
            this.entryPointUrl + '/dispatch/request-files/' + encodeURIComponent(identifier),
            options,
        );
    }

    /*
     * Open file source
     *
     */
    openFileSource() {
        this.fileUploadFinished = false;
        const fileSource = /** @type {FileSource} */ (this._('#file-source'));
        if (fileSource) {
            fileSource.openDialog();
        }

        if (this.singleFileProcessing && !this.requestCreated) {
            this.processCreateDispatchRequest().then(() => {
                this.showDetailsView = true;
                this.hasSubject = true;
                this.hasSender = true;
            });
        }
        this.currentItemTabulator = this.currentItem;
    }

    onFileUploadFinished(event) {
        this.fileUploadFinished = true;
        this.uploadedNumberOfFiles = event.detail.count;
        this.currentFileIndex = 0;

        const i18n = this._i18n;
        if (!this.errorCreatingRequest && this.uploadedNumberOfFiles > 0) {
            send({
                summary: i18n.t('create-request.successfully-requested-title'),
                body: this.singleFileProcessing
                    ? i18n.t('create-request.successfully-requested-text')
                    : i18n.t('create-request.successfully-requested-text-multiple'),
                type: 'success',
                timeout: 5,
            });
        } else {
            send({
                summary: i18n.t('create-request.error-requested-title'),
                body: i18n.t('create-request.error-requested-text'),
                type: 'danger',
                timeout: 5,
            });
        }
        this.errorCreatingRequest = false;
    }

    async onFileSelected(event) {
        this.tableLoading = true;
        this.fileUploadFinished = false;
        if (!this.singleFileProcessing && !this.requestCreated) {
            this.processCreateDispatchRequest().then(async () => {
                this.showDetailsView = false;
                this.showListView = true;
                this.hasSubject = true;
                this.hasSender = true;

                this.createdRequestsIds.push(this.currentItem.identifier);
                this.totalNumberOfCreatedRequestItems++;
                await this.addFile(event.detail.file);
                this.filesAdded = true;
            });
        } else {
            await this.addFile(event.detail.file);
        }
    }

    async addFile(file) {
        const addFileButton = /** @type {LoadingButton} */ (this._('#add-files-btn'));
        addFileButton.start();

        try {
            let id = this.currentItem.identifier;
            await this.addFileToRequest(id, file);
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
            send({
                summary: 'Error!',
                body: 'There was an error.',
                type: 'danger',
                timeout: 5,
            });
        } finally {
            this.tableLoading = false;
            addFileButton.stop();
        }
    }

    async addFileToRequest(id, file) {
        const i18n = this._i18n;

        // Get the reference number from the PDF
        const referenceNumber = await getReferenceNumberFromPDF(file);

        // We override the existing reference number if it isn't set or is equal to the default one
        let shouldOverrideReferenceNumber = false;
        if (
            !this.currentItem.referenceNumber ||
            this.currentItem.referenceNumber === this.getDefaultReferenceNumber()
        ) {
            shouldOverrideReferenceNumber = true;
        }

        // Set the reference number if it is not set yet, and we have a valid one
        if (referenceNumber !== null && shouldOverrideReferenceNumber) {
            const response = await this.sendChangeReferenceNumberRequest(id, referenceNumber);
            if (response.status !== 200) {
                console.error('Could not set reference number!');

                send({
                    summary: i18n.t(
                        'show-requests.error-reference-number-auto-update-failed-title',
                    ),
                    body: i18n.t('show-requests.error-reference-number-auto-update-failed-text'),
                    type: 'danger',
                    timeout: 5,
                });
            } else {
                this.currentItem.referenceNumber = referenceNumber;

                send({
                    summary: i18n.t(
                        'show-requests.error-reference-number-auto-update-success-title',
                    ),
                    body: i18n.t('show-requests.error-reference-number-auto-update-success-text'),
                    type: 'info',
                    timeout: 5,
                });
            }
        }

        let response = await this.sendAddFileToRequest(id, file);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 201) {
            if (this.singleFileProcessing) {
                //TODO
                send({
                    summary: i18n.t('show-requests.successfully-added-file-title'),
                    body: i18n.t('show-requests.successfully-added-file-text'),
                    type: 'success',
                    timeout: 5,
                });
            }

            let resp = await this.getDispatchRequest(id);
            let responseBody = await resp.json();
            if (responseBody !== undefined && response.status !== 403) {
                this.currentItem = responseBody;
            }
            this.currentFileIndex++;

            //call this only when you create a request
            //update show requests tabulator
            if (this.uploadedNumberOfFiles === this.currentFileIndex && !this.addFileViaButton) {
                this.newRequests = await this.getCreatedDispatchRequests();
                if (this.newRequests !== null) {
                    this.setTabulatorData(this.newRequests);
                }
            } else if (this.addFileViaButton) {
                // If added via "Edit request" "add Files" button
                const row = this._getCurrentTableRow();
                if (row) {
                    this.currentTable.updateRow(row, {
                        files: this.createFormattedFilesList(this.currentItem.files),
                    });
                }
            }
        } else {
            // TODO error handling
            if (this.singleFileProcessing) {
                send({
                    summary: 'Error!',
                    body: 'File could not be added.',
                    type: 'danger',
                    timeout: 5,
                });
            }
        }
    }

    async deleteFile(event, file) {
        const i18n = this._i18n;
        let button = event.target;

        if (confirm(i18n.t('show-requests.delete-dialog-file'))) {
            button.start();

            try {
                let response = await this.sendDeleteFileRequest(file.identifier);
                if (response.status === 204) {
                    send({
                        summary: i18n.t('show-requests.successfully-deleted-file-title'),
                        body: i18n.t('show-requests.successfully-deleted-file-text'),
                        type: 'success',
                        timeout: 5,
                    });

                    let id = this.currentItem.identifier;
                    let resp = await this.getDispatchRequest(id);
                    let responseBody = await resp.json();
                    if (responseBody !== undefined && responseBody.status !== 403) {
                        this.currentItem = responseBody;
                        const row = this._getCurrentTableRow();
                        if (row) {
                            this.currentTable.updateRow(row, {
                                files: this.createFormattedFilesList(this.currentItem.files),
                            });
                        }
                    }
                } else {
                    // TODO error handling

                    send({
                        summary: 'Error!',
                        body: 'File could not be deleted.',
                        type: 'danger',
                        timeout: 5,
                    });
                }
            } finally {
                button.stop();
            }
        }
    }

    /**
     * Open Filesink for a single File
     * @param fileContentUrl
     * @param fileName
     */
    async downloadFileClickHandler(fileContentUrl, fileName) {
        let files = [];
        const arr = dispatchHelper.convertDataURIToBinary(fileContentUrl);
        const binaryFile = new File([arr], fileName, {
            type: dispatchHelper.getDataURIContentType(fileContentUrl),
        });
        files.push(binaryFile);
        // this.signedFilesToDownload = files.length;
        /** @type {FileSink} */ (this._('#file-sink')).files = [...files];
    }

    async _onDownloadFileClicked(event, statusRequestId) {
        const i18n = this._i18n;
        let button = event.target;
        button.start();

        try {
            let response = await this.sendGetStatusChangeRequest(statusRequestId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                let fileContentUrl = responseBody['fileContentUrl'];
                let fileName = 'DeliveryNotification';
                await this.downloadFileClickHandler(fileContentUrl, fileName);
            } else {
                send({
                    summary: 'Error',
                    body: i18n.t('show-requests.error-file-donwload'),
                    type: 'success',
                    timeout: 5,
                });
            }
        } finally {
            button.stop();
        }
    }

    parseListOfRequests(response) {
        let list = [];

        response['hydra:member'].forEach((item) => {
            list.push(item);
        });
        list.sort(this.compareListItems);
        return list;
    }

    async addRecipientToRequest(recipient) {
        this.currentRecipient = recipient;
        const addRecipientButton = /** @type {LoadingButton} */ (this._('#add-recipient-btn'));
        addRecipientButton.start();
        try {
            const i18n = this._i18n;
            let id = this.currentItem.identifier;
            let givenName = this.currentRecipient.givenName;
            let familyName = this.currentRecipient.familyName;
            let addressCountry = this.currentRecipient.addressCountry;
            let postalCode = this.currentRecipient.postalCode;
            let addressLocality = this.currentRecipient.addressLocality;
            let streetAddress = this.currentRecipient.streetAddress;
            let personIdentifier = this.currentRecipient.personIdentifier
                ? this.currentRecipient.personIdentifier
                : null;

            let birthDate = '';
            if (
                this.currentRecipient.birthDateDay &&
                this.currentRecipient.birthDateMonth &&
                this.currentRecipient.birthDateYear &&
                this.currentRecipient.birthDateDay !== '' &&
                this.currentRecipient.birthDateMonth !== '' &&
                this.currentRecipient.birthDateYear !== ''
            ) {
                birthDate =
                    this.currentRecipient.birthDateYear +
                    '-' +
                    this.currentRecipient.birthDateMonth +
                    '-' +
                    this.currentRecipient.birthDateDay;
            }

            let response = await this.sendAddRequestRecipientsRequest(
                id,
                personIdentifier,
                givenName,
                familyName,
                birthDate,
                addressCountry,
                postalCode,
                addressLocality,
                streetAddress,
            );

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 201) {
                send({
                    summary: i18n.t('show-requests.successfully-added-recipient-title'),
                    body: i18n.t('show-requests.successfully-added-recipient-text'),
                    type: 'success',
                    timeout: 5,
                });

                let resp = await this.getDispatchRequest(id);
                let responseBody = await resp.json();
                if (responseBody !== undefined && responseBody.status !== 403) {
                    this.currentItem = responseBody;
                    this.currentRecipient = {};
                    const row = this._getCurrentTableRow();
                    if (row) {
                        this.currentTable.updateRow(row, {
                            recipients: this.createFormattedRecipientsList(
                                this.currentItem.recipients,
                            ),
                        });
                    }
                }
                this.requestUpdate();
            } else {
                // TODO error handling

                send({
                    summary: 'Error!',
                    body: 'Could not add recipient. Response code: ' + response.status,
                    type: 'danger',
                    timeout: 5,
                });
            }
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
            send({
                summary: 'Error!',
                body: 'Could not add recipient.',
                type: 'danger',
                timeout: 5,
            });
        } finally {
            addRecipientButton.stop();
        }
    }

    async updateRecipient() {
        const i18n = this._i18n;
        let hasError = false;

        try {
            let id = this.currentItem.identifier;
            let givenName = this.currentRecipient.givenName;
            let familyName = this.currentRecipient.familyName;
            let addressCountry = this.currentRecipient.addressCountry;
            let postalCode = this.currentRecipient.postalCode;
            let addressLocality = this.currentRecipient.addressLocality;
            let streetAddress = this.currentRecipient.streetAddress;

            let birthDate = '';
            if (
                this.currentRecipient.birthDateDay &&
                this.currentRecipient.birthDateMonth &&
                this.currentRecipient.birthDateYear &&
                this.currentRecipient.birthDateDay !== '' &&
                this.currentRecipient.birthDateMonth !== '' &&
                this.currentRecipient.birthDateYear !== ''
            ) {
                birthDate =
                    this.currentRecipient.birthDateYear +
                    '-' +
                    this.currentRecipient.birthDateMonth +
                    '-' +
                    this.currentRecipient.birthDateDay;
            }

            let personIdentifier = null;
            // Only set personIdentifier if electronic of postal delivery is possible.
            // Otherwise, allow to add address to recipient trough the edit recipient modal.
            if (
                this.currentRecipient.electronicallyDeliverable ||
                this.currentRecipient.postalDeliverable
            ) {
                personIdentifier = this.currentRecipient.personIdentifier;
            }
            let recipientId = this.currentRecipient.identifier;

            // First, send a delete requests to remove the old recipient
            let response = await this.sendDeleteRecipientRequest(recipientId);
            if (response.status === 204) {
                // Then, send a new add request to add the updated recipient
                let innerResponse = await this.sendAddRequestRecipientsRequest(
                    id,
                    personIdentifier,
                    givenName,
                    familyName,
                    birthDate,
                    addressCountry,
                    postalCode,
                    addressLocality,
                    streetAddress,
                );

                let innerResponseBody = await innerResponse.json();
                if (innerResponseBody !== undefined && innerResponse.status === 201) {
                    send({
                        summary: i18n.t('show-requests.successfully-edited-recipient-title'),
                        body: i18n.t('show-requests.successfully-edited-recipient-text'),
                        type: 'success',
                        timeout: 5,
                    });
                    this.currentRecipient = innerResponseBody;

                    let resp = await this.getDispatchRequest(id);
                    let responseBody = await resp.json();
                    if (responseBody !== undefined && responseBody.status !== 403) {
                        this.currentItem = responseBody;
                        this.currentRecipient = {};
                        const row = this._getCurrentTableRow();
                        if (row) {
                            this.currentTable.updateRow(row, {
                                recipients: this.createFormattedRecipientsList(
                                    this.currentItem.recipients,
                                ),
                            });
                        }
                    }

                    this.currentRecipient = {};
                } else {
                    hasError = true;
                }
            } else {
                hasError = true;
            }
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
            send({
                summary: 'Error!',
                body: 'Could not add recipient.',
                type: 'danger',
                timeout: 5,
            });
        } finally {
            if (hasError) {
                send({
                    summary: 'Error!',
                    body: 'Could not add recipient.',
                    type: 'danger',
                    timeout: 5,
                });
            }
            this.requestUpdate();
        }
    }

    async deleteRecipient(event, recipient) {
        const i18n = this._i18n;
        let button = event.target;

        if (confirm(i18n.t('show-requests.delete-dialog-recipient'))) {
            button.start();

            try {
                let response = await this.sendDeleteRecipientRequest(recipient.identifier);
                if (response.status === 204) {
                    send({
                        summary: i18n.t('show-requests.successfully-deleted-recipient-title'),
                        body: i18n.t('show-requests.successfully-deleted-recipient-text'),
                        type: 'success',
                        timeout: 5,
                    });

                    let id = this.currentItem.identifier;
                    let resp = await this.getDispatchRequest(id);
                    let responseBody = await resp.json();
                    if (responseBody !== undefined && responseBody.status !== 403) {
                        this.currentItem = responseBody;
                        this.requestCreated = false;
                        const row = this._getCurrentTableRow();
                        if (row) {
                            this.currentTable.updateRow(row, {
                                recipients: this.createFormattedRecipientsList(
                                    this.currentItem.recipients,
                                ),
                            });
                        }
                    }
                } else {
                    send({
                        summary: 'Error!',
                        body: 'Could not delete recipient. Response code: ' + response.status,
                        type: 'danger',
                        timeout: 5,
                    });
                }
            } finally {
                button.stop();
            }
        }
    }

    async fetchStatusOfRecipient(recipient) {
        let response = await this.getDispatchRecipient(recipient.identifier);
        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            this.currentRecipient.statusType = responseBody['statusType'];
            this.currentRecipient.statusDescription = responseBody['description'];
        } else {
            // TODO error handling
        }
    }

    async editRequest(event, item, index = 0) {
        let button = event.target;
        button.start();

        try {
            let resp = await this.getDispatchRequest(item.identifier);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }

            this.currentItem.recipients.forEach((element) => {
                this.fetchDetailedRecipientInformation(element.identifier).then((result) => {
                    //TODO
                });
            });

            await this.loadLastModifiedName(this.currentItem.personIdentifier);

            this.showListView = false;
            this.showDetailsView = true;
            this.expanded = false;
        } finally {
            button.stop();
        }
    }

    async deleteRequest(table, event, item, index = 0) {
        const i18n = this._i18n;
        let button = event.target;

        if (item.dateSubmitted) {
            send({
                summary: i18n.t('show-requests.delete-not-allowed-title'),
                body: i18n.t('show-requests.delete-not-allowed-text'),
                type: 'danger',
                timeout: 5,
            });
            return;
        }

        if (confirm(i18n.t('show-requests.delete-dialog-text', {count: 1}))) {
            button.start();

            try {
                let response = await this.sendDeleteDispatchRequest(item.identifier);
                if (response.status === 204) {
                    send({
                        summary: i18n.t('show-requests.successfully-deleted-title'),
                        body: i18n.t('show-requests.successfully-deleted-text'),
                        type: 'success',
                        timeout: 5,
                    });
                    let rows = table.getRows();
                    table.deleteRow(rows[index]);
                    this.clearAll();
                } else {
                    send({
                        summary: 'Error!',
                        body: 'Could not delete request. Response code: ' + response.status,
                        type: 'danger',
                        timeout: 5,
                    });
                }
            } catch (e) {
                console.error(`${e.name}: ${e.message}`);
            } finally {
                button.stop();
            }
        }
    }

    /**
     * Returns if the request can be submitted or not. And if not, it shows a UI message.
     * @param {object} request
     * @returns {boolean} if the request can be submitted or not
     */
    checkCanSubmit(request) {
        const i18n = this._i18n;

        // No files attached
        if (!request.files || request.files.length === 0) {
            send({
                summary: i18n.t('show-requests.missing-files.title'),
                body: i18n.t('show-requests.missing-files.text'),
                type: 'danger',
                timeout: 5,
            });
            return false;
        }

        // No recipients
        // if (!recipients || recipients.length === 0 || recipients === i18n.t('show-requests.no-recipients-added')) {
        if (!request.recipients || request.recipients.length === 0) {
            send({
                summary: i18n.t('show-requests.missing-recipients.title'),
                body: i18n.t('show-requests.missing-recipients.text'),
                type: 'danger',
                timeout: 5,
            });
            return false;
        }

        // Missing or empty referenceNumber
        if (!request.referenceNumber || !request.referenceNumber.trim()) {
            send({
                summary: i18n.t('show-requests.missing-reference-number.title'),
                body: i18n.t('show-requests.missing-reference-number.text'),
                type: 'danger',
                timeout: 5,
            });
            return false;
        }

        // Missing or empty subject
        if (!request.name || !request.name.trim()) {
            send({
                summary: i18n.t('show-requests.missing-subject.title'),
                body: i18n.t('show-requests.missing-subject.text'),
                type: 'danger',
                timeout: 5,
            });
            return false;
        }

        return true;
    }

    async submitRequest(table, event, item, index = 0) {
        const i18n = this._i18n;
        let button = event.target;
        let request = item;

        if (item?.identifier) {
            try {
                const response = await this.getDispatchRequest(item.identifier);
                const responseBody = response.status === 200 ? await response.json() : undefined;
                if (responseBody !== undefined) {
                    request = responseBody;
                    this.currentItem = responseBody;
                }
            } catch (e) {
                console.error(`${e.name}: ${e.message}`);
            }
        }

        if (request.dateSubmitted) {
            send({
                summary: i18n.t('show-requests.submit-not-allowed-title'),
                body: i18n.t('show-requests.submit-not-allowed-text'),
                type: 'danger',
                timeout: 5,
            });
            return;
        }

        let rows = table.getRows();
        let row = rows[index];
        if (!this.checkCanSubmit(request)) {
            return;
        }

        if (confirm(i18n.t('show-requests.submit-dialog-text', {count: 1}))) {
            try {
                button.start();

                let response = await this.sendSubmitDispatchRequest(request.identifier);

                if (response.status === 201) {
                    let responseBody = await response.json();
                    let Recipientstatus = i18n.t('show-requests.pending');
                    let submitted = this.convertToReadableDate(responseBody['dateSubmitted']);

                    let controls_div = this.createScopedElement('div');
                    let btn_research = this.createScopedElement('dbp-icon-button');
                    btn_research.setAttribute('icon-name', 'keyword-research');
                    btn_research.addEventListener('click', async (event) => {
                        this.editRequest(event, request, index);
                        event.stopPropagation();
                    });
                    controls_div.appendChild(btn_research);
                    table.updateRow(row, {
                        status: Recipientstatus,
                        dateSubmitted: submitted,
                        controls: controls_div,
                    });

                    if (this.currentTable) {
                        if (this.createdRequestsList && this.createdRequestsList.length > 0) {
                            this.createdRequestsIds = this.createdRequestsIds.filter(
                                (id) => id !== request.identifier,
                            );

                            await this.getCreatedDispatchRequests();

                            if (this.createdRequestsList.length !== 0) {
                                this.showListView = true;
                                this.requestCreated = true;
                            } else {
                                this.showListView = false;
                                this.requestCreated = false;
                                this.hasSubject = false;
                                this.hasSender = false;
                            }
                            this.hasRecipients = false;
                            this.showDetailsView = false;
                        } else {
                            this.getListOfRequests();
                            this.clearAll();
                        }
                    }
                    send({
                        summary: i18n.t('show-requests.successfully-submitted-title'),
                        body: i18n.t('show-requests.successfully-submitted-text'),
                        type: 'success',
                        timeout: 5,
                    });
                } else if (response.status === 400) {
                    send({
                        summary: i18n.t('error-delivery-channel-title'),
                        body: i18n.t('error-delivery-channel-text'),
                        type: 'danger',
                        timeout: 5,
                    });
                } else if (response.status === 403) {
                    send({
                        summary: i18n.t('create-request.error-requested-title'),
                        body: i18n.t('error-not-permitted'),
                        type: 'danger',
                        timeout: 5,
                    });
                } else {
                    send({
                        summary: 'Error!',
                        body: 'Could not submit request. Response code: ' + response.status,
                        type: 'danger',
                        timeout: 5,
                    });
                }
            } catch (e) {
                console.error(`${e.name}: ${e.message}`);
            } finally {
                button.stop();
            }
        }
    }

    async changeSubjectRequest(id, subject) {
        const i18n = this._i18n;
        const editSubjectButton = /** @type {IconButton} */ (this._('#edit-subject-btn'));
        editSubjectButton.start();
        try {
            let response = await this.sendChangeSubjectRequest(id, subject);
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 200) {
                this.currentItem = responseBody;
                this.subject = this.currentItem.name;

                send({
                    summary: i18n.t('show-requests.edit-subject-success-title'),
                    body: i18n.t('show-requests.edit-subject-success-text'),
                    type: 'success',
                    timeout: 5,
                });
            } else if (response.status === 403) {
                send({
                    summary: i18n.t('create-request.error-requested-title'),
                    body: i18n.t('error-not-permitted'),
                    type: 'danger',
                    timeout: 5,
                });
            } else {
                // TODO show error code specific notification
                send({
                    summary: i18n.t('create-request.error-changed-subject-title'),
                    body: i18n.t('create-request.error-changed-subject-text'),
                    type: 'danger',
                    timeout: 5,
                });
            }
        } finally {
            editSubjectButton.stop();
        }
    }

    async changeReferenceNumberRequest(id, referenceNumber) {
        const i18n = this._i18n;
        const editReferenceButton = /** @type {IconButton} */ (
            this._('#edit-reference-number-btn')
        );
        editReferenceButton.start();
        try {
            let response = await this.sendChangeReferenceNumberRequest(id, referenceNumber);
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 200) {
                this.currentItem = responseBody;

                send({
                    summary: i18n.t('show-requests.edit-reference-number-success-title'),
                    body: i18n.t('show-requests.edit-reference-number-success-text'),
                    type: 'success',
                    timeout: 5,
                });
            } else if (response.status === 403) {
                send({
                    summary: i18n.t('create-request.error-requested-title'),
                    body: i18n.t('error-not-permitted'),
                    type: 'danger',
                    timeout: 5,
                });
            } else {
                // TODO show error code specific notification
                send({
                    summary: i18n.t('create-request.error-changed-reference-number-title'),
                    body: i18n.t('create-request.error-changed-reference-number-text'),
                    type: 'danger',
                    timeout: 5,
                });
            }
        } finally {
            editReferenceButton.stop();
        }
    }

    async confirmEditSender(sender) {
        const i18n = this._i18n;
        const editSenderButton = /** @type {IconButton} */ (this._('#edit-sender-btn'));
        editSenderButton.start();
        try {
            let id = this.currentItem.identifier;
            let groupId = this.groupId;

            let response = await this.sendEditDispatchRequest(
                id,
                sender.senderOrganizationName,
                sender.senderFullName,
                sender.senderAddressCountry,
                sender.senderPostalCode,
                sender.senderAddressLocality,
                sender.senderStreetAddress,
                sender.senderBuildingNumber,
                groupId,
            );

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                send({
                    summary: i18n.t('show-requests.successfully-updated-sender-title'),
                    body: i18n.t('show-requests.successfully-updated-sender-text'),
                    type: 'success',
                    timeout: 5,
                });

                this.currentItem = responseBody;
            } else if (response.status === 403) {
                send({
                    summary: i18n.t('create-request.error-requested-title'),
                    body: i18n.t('error-not-permitted'),
                    type: 'danger',
                    timeout: 5,
                });
            } else {
                send({
                    summary: 'Error!',
                    body: 'Could not edit sender. Response code: ' + response.status,
                    type: 'danger',
                    timeout: 5,
                });
            }
        } finally {
            editSenderButton.stop();
        }
    }

    async confirmEditSubject(subject) {
        // The detail view can be reached without going through the table
        // (e.g. via a deep link), in which case there is no current table row
        // to update. Skip the optimistic table update in that case.
        const row = this._getCurrentTableRow();
        if (row) {
            this.currentTable.updateRow(row, {subject: subject});
        }
        let id = this.currentItem.identifier;
        await this.changeSubjectRequest(id, subject);
    }

    async confirmEditReferenceNumber(referenceNumber) {
        const row = this._getCurrentTableRow();
        if (row) {
            this.currentTable.updateRow(row, {gz: referenceNumber});
        }
        let id = this.currentItem.identifier;
        await this.changeReferenceNumberRequest(id, referenceNumber);
    }

    /**
     * Returns the current Tabulator row matching `currentRowIndex`, or null when
     * the detail view was not entered through the table (e.g. via a deep link).
     */
    _getCurrentTableRow() {
        if (!this.currentTable || typeof this.currentTable.getRows !== 'function') {
            return null;
        }
        const index = this.currentRowIndex;
        if (index === undefined || index === null || index === '') {
            return null;
        }
        const rows = this.currentTable.getRows();
        return rows?.[index] ?? null;
    }

    async fetchDetailedRecipientInformation(identifier) {
        let response = await this.getDispatchRecipient(identifier);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            this.currentRecipient = responseBody;

            this.currentRecipient.personIdentifier =
                responseBody['personIdentifier'] !== '' ? responseBody['personIdentifier'] : null;
            let birthDate =
                responseBody['birthDate'] && responseBody['birthDate'] !== ''
                    ? this.convertToBirthDateTuple(responseBody['birthDate'])
                    : '';

            if (typeof birthDate === 'object') {
                this.currentRecipient.birthDateDay = birthDate.day;
                this.currentRecipient.birthDateMonth = birthDate.month;
                this.currentRecipient.birthDateYear = birthDate.year;
            } else {
                this.currentRecipient.birthDateDay = '';
                this.currentRecipient.birthDateMonth = '';
                this.currentRecipient.birthDateYear = '';
            }

            this.currentRecipient.statusChanges = responseBody['statusChanges'];
            if (this.currentRecipient.statusChanges.length > 0) {
                this.currentRecipient.statusDescription =
                    this.currentRecipient.statusChanges[0].description;
                this.currentRecipient.statusType =
                    this.currentRecipient.statusChanges[0].statusType;
            } else {
                this.currentRecipient.statusDescription = null;
                this.currentRecipient.statusType = null;
            }
            this.currentRecipient.deliveryEndDate = responseBody['deliveryEndDate']
                ? responseBody['deliveryEndDate']
                : '';
            this.currentRecipient.appDeliveryId = responseBody['appDeliveryID']
                ? responseBody['appDeliveryID']
                : '';
            this.currentRecipient.postalDeliverable = responseBody['postalDeliverable']
                ? responseBody['postalDeliverable']
                : '';
            this.currentRecipient.electronicallyDeliverable = responseBody[
                'electronicallyDeliverable'
            ]
                ? responseBody['electronicallyDeliverable']
                : '';
            this.currentRecipient.lastStatusChange = responseBody['lastStatusChange']
                ? responseBody['lastStatusChange']
                : '';
            // this.currentRecipient.deliveryEndDate = responseBody['deliveryEndDate'] ? responseBody['deliveryEndDate'] : '';
        } else {
            // TODO error handling
        }
    }

    async submitSelected() {
        const i18n = this._i18n;

        const submitAllButton = /** @type {LoadingButton} */ (this._('#submit-all-btn'));
        submitAllButton.start();

        try {
            let table = this.currentTable;
            let selectedItems = table.getSelectedRows();
            let somethingWentWrong = false;

            for (let i = 0; i < selectedItems.length; i++) {
                let id = selectedItems[i].getData()['requestId'];
                let response = await this.getDispatchRequest(id);
                let result = await response.json();
                if (result.dateSubmitted) {
                    send({
                        summary: i18n.t('show-requests.submit-not-allowed-title'),
                        body: i18n.t('show-requests.submit-not-allowed-text'),
                        type: 'danger',
                        timeout: 5,
                    });
                    somethingWentWrong = true;
                    break;
                }
                // let recipients = selectedItems[i].getData()['recipients'];
                if (!this.checkCanSubmit(result)) {
                    somethingWentWrong = true;
                    break;
                }
            }

            if (somethingWentWrong) {
                return;
            }

            let dialogText = i18n.t('show-requests.submit-dialog-text', {
                count: this.currentTable.getSelectedRows().length,
            });

            let ids = [];

            if (confirm(dialogText)) {
                for (let i = 0; i < selectedItems.length; i++) {
                    let id = selectedItems[i].getData()['requestId'];
                    ids.push(id);
                    let response = await this.getDispatchRequest(id);
                    let result = await response.json();

                    let submitResponse = await this.sendSubmitDispatchRequest(result.identifier);

                    if (submitResponse.status !== 201) {
                        somethingWentWrong = true;
                        break;
                    }

                    let responseBody = await submitResponse.json();

                    let Recipientstatus = i18n.t('show-requests.pending');
                    let submitted = this.convertToReadableDate(responseBody['dateSubmitted']);

                    let controls_div = this.createScopedElement('div');
                    let btn_research = this.createScopedElement('dbp-icon-button');
                    btn_research.setAttribute('icon-name', 'keyword-research');
                    btn_research.addEventListener('click', async (event) => {
                        this.editRequest(event, selectedItems[i]);
                        event.stopPropagation();
                    });
                    controls_div.appendChild(btn_research);
                    table.updateRow(selectedItems[i], {
                        status: Recipientstatus,
                        dateSubmitted: submitted,
                        controls: controls_div,
                    });
                }

                if (!somethingWentWrong) {
                    if (this.currentTable) {
                        if (this.createdRequestsList && this.createdRequestsList.length > 0) {
                            for (let i = 0; i < ids.length; i++) {
                                this.createdRequestsIds = this.createdRequestsIds.filter(
                                    (id) => id !== ids[i],
                                ); //TODO maybe there is a better way to do this
                            }
                            await this.getCreatedDispatchRequests();
                            if (this.createdRequestsList.length !== 0) {
                                this.showListView = true;
                                this.requestCreated = true;
                            } else {
                                this.showListView = false;
                                this.requestCreated = false;
                                this.hasSubject = false;
                                this.hasSender = false;
                            }
                            this.hasRecipients = false;
                            this.showDetailsView = false;
                        } else {
                            this.getListOfRequests();
                            this.clearAll();
                        }
                    }
                    send({
                        summary: i18n.t('show-requests.successfully-submitted-title'),
                        body: i18n.t('show-requests.successfully-submitted-text'),
                        type: 'success',
                        timeout: 5,
                    });
                    this.currentTable.deselectAllRows();
                } else {
                    send({
                        summary: 'Error!',
                        body: 'Could not submit request.',
                        type: 'danger',
                        timeout: 5,
                    });
                }
            }
        } finally {
            submitAllButton.stop();
        }
    }

    async deleteSelected() {
        const i18n = this._i18n;

        const deleteAllButton = /** @type {LoadingButton} */ (this._('#delete-all-btn'));
        deleteAllButton.start();

        try {
            let selectedItems = this.currentTable.getSelectedRows();
            let somethingWentWrong = false;

            for (let i = 0; i < selectedItems.length; i++) {
                let id = selectedItems[i].getData()['requestId'];
                let response = await this.getDispatchRequest(id);
                let result = await response.json();

                if (result.dateSubmitted) {
                    send({
                        summary: i18n.t('show-requests.delete-not-allowed-title'),
                        body: i18n.t('show-requests.delete-not-allowed-text'),
                        type: 'danger',
                        timeout: 5,
                    });
                    somethingWentWrong = true;
                    break;
                }
            }

            if (somethingWentWrong) {
                return;
            }

            let dialogText = i18n.t('show-requests.delete-dialog-text', {
                count: this.currentTable.getSelectedRows().length,
            });

            let ids = [];

            if (confirm(dialogText)) {
                for (let i = 0; i < selectedItems.length; i++) {
                    let id = selectedItems[i].getData()['requestId'];

                    ids.push(id);

                    let response = await this.getDispatchRequest(id);
                    let result = await response.json();

                    let deleteResponse = await this.sendDeleteDispatchRequest(result.identifier);

                    if (deleteResponse.status !== 204) {
                        somethingWentWrong = true;
                        break;
                    }
                }

                if (!somethingWentWrong) {
                    if (this.currentTable) {
                        if (this.createdRequestsList && this.createdRequestsList.length > 0) {
                            for (let i = 0; i < ids.length; i++) {
                                this.createdRequestsIds = this.createdRequestsIds.filter(
                                    (id) => id !== ids[i],
                                ); //TODO maybe there is a better way to do this
                            }
                            await this.getCreatedDispatchRequests();

                            if (this.createdRequestsList.length !== 0) {
                                this.showListView = true;
                                this.requestCreated = true;
                            } else {
                                this.showListView = false;
                                this.requestCreated = false;
                                this.hasSubject = false;
                                this.hasSender = false;
                            }

                            this.hasRecipients = false;
                            this.showDetailsView = false;
                        } else {
                            this.getListOfRequests();
                            this.clearAll();
                        }
                    }
                    send({
                        summary: i18n.t('show-requests.successfully-deleted-title'),
                        body: i18n.t('show-requests.successfully-deleted-text'),
                        type: 'success',
                        timeout: 5,
                    });

                    this.currentTable.deleteSelectedRows();
                    // Re-enable select-all button
                    this.allSelected = false;
                } else {
                    // TODO error handling
                    send({
                        summary: 'Error!',
                        body: 'Could not delete request.',
                        type: 'danger',
                        timeout: 5,
                    });
                }
            }
        } finally {
            deleteAllButton.stop();
        }
    }

    /**
     * Toggles delete and submit buttons based on table row selection
     * @param {string} tableId - The ID of the Tabulator table
     */
    toggleDeleteAndSubmitButtons(tableId) {
        let deleteButton = /** @type {HTMLButtonElement} */ (this._('#delete-all-btn'));
        let submitButton = /** @type {HTMLButtonElement} */ (this._('#submit-all-btn'));
        let table = /** @type {TabulatorTable} */ (this._(tableId));
        if (table.getSelectedRows().length !== 0) {
            deleteButton.disabled = false;
            submitButton.disabled = false;
        } else {
            deleteButton.disabled = true;
            submitButton.disabled = true;
        }
    }

    async _onShowFileClicked(event, fileId) {
        let button = event.target;
        button.start();

        try {
            let response = await this.sendGetFileRequest(fileId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                let fileContentUrl = responseBody['contentUrl'];
                let fileName = responseBody['name'];
                const arr = dispatchHelper.convertDataURIToBinary(fileContentUrl);
                const binaryFile = new File([arr], fileName, {
                    type: dispatchHelper.getDataURIContentType(fileContentUrl),
                });
                this._('#file-viewer-modal').showPDF(binaryFile);
            } else {
                //TODO
            }
        } finally {
            button.stop();
        }
    }

    async _onDownloadRequestFileClicked(event, fileId) {
        const i18n = this._i18n;
        let button = event.target;
        button.start();

        try {
            let response = await this.sendGetFileRequest(fileId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                let fileContentUrl = responseBody['contentUrl'];
                let fileName = responseBody['name'];
                await this.downloadFileClickHandler(fileContentUrl, fileName);
            } else {
                send({
                    summary: 'Error',
                    body: i18n.t('show-requests.error-file-donwload'),
                    type: 'success',
                    timeout: 5,
                });
            }
        } finally {
            button.stop();
        }
    }

    async processCreateDispatchRequest() {
        const createButton = /** @type  {LoadingButton} */ (this._('#create-btn'));
        createButton.start();

        try {
            let response = await this.sendCreateDispatchRequest();
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 201) {
                this.currentItem = responseBody;
                this.requestCreated = true;
            } else {
                this.errorCreatingRequest = true;
            }
        } finally {
            createButton.stop();
        }
    }

    createFormattedFilesList(list) {
        const i18n = this._i18n;
        let output = '';
        if (!list) {
            return this.mayReadMetadata && !this.mayRead && !this.mayWrite
                ? i18n.t('show-requests.metadata-files-text')
                : i18n.t('show-requests.no-files-attached');
        }
        list.forEach((file) => {
            output += file.name + '<br>';
        });
        if (output !== '') {
            return output;
        } else {
            return this.mayReadMetadata && !this.mayRead && !this.mayWrite
                ? i18n.t('show-requests.metadata-files-text')
                : i18n.t('show-requests.no-files-attached');
        }
    }

    createFormattedRecipientsList(list) {
        const i18n = this._i18n;
        let output = '';
        list.forEach((recipient) => {
            output += recipient.familyName + ', ' + recipient.givenName + '<br>';
        });
        if (output !== '') {
            return output;
        } else {
            return i18n.t('show-requests.no-recipients-added');
        }
    }

    /**
     * Get a list of all requests
     * @returns {Promise<void>}
     */
    async getListOfRequests() {
        const i18n = this._i18n;
        this.initialRequestsLoading = !this._initialFetchDone;
        try {
            let response = await this.getListOfDispatchRequests(this.groupId);
            let responseBody = await response.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.requestList = this.parseListOfRequests(responseBody);
            } else {
                if (responseBody.status === 500) {
                    send({
                        summary: 'Error!',
                        body: 'Could not fetch dispatch requests. Response code: 500',
                        type: 'danger',
                        timeout: 5,
                    });
                } else if (response.status === 403) {
                    send({
                        summary: i18n.t('create-request.error-requested-title'),
                        body: i18n.t('error-not-permitted'),
                        type: 'danger',
                        timeout: 5,
                    });
                }
            }
        } finally {
            this.initialRequestsLoading = false;
            this._initialFetchDone = true;
        }
    }

    // @TODO: never called?
    async getCreatedRequests() {
        if (this.createdRequestsList.length > 0) {
            this.tableLoading = true;
            this.requestList = this.parseListOfRequests(this.createdRequestsList);
            this.tableLoading = false;
        }
    }

    convertToReadableDate(inputDate) {
        const d = Date.parse(inputDate);
        const timestamp = new Date(d);
        const year = timestamp.getFullYear();
        const month = ('0' + (timestamp.getMonth() + 1)).slice(-2);
        const date = ('0' + timestamp.getDate()).slice(-2);
        const hours = ('0' + timestamp.getHours()).slice(-2);
        const minutes = ('0' + timestamp.getMinutes()).slice(-2);
        return date + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
    }

    convertToBirthDate(inputDate) {
        const d = Date.parse(inputDate);
        const timestamp = new Date(d);
        const year = timestamp.getFullYear();
        const month = ('0' + (timestamp.getMonth() + 1)).slice(-2);
        const date = ('0' + timestamp.getDate()).slice(-2);
        return year + '-' + month + '-' + date;
    }

    convertToBirthDateTuple(inputDate) {
        const d = Date.parse(inputDate);
        const timestamp = new Date(d);
        const year = timestamp.getFullYear();
        const month = ('0' + (timestamp.getMonth() + 1)).slice(-2);
        const date = ('0' + timestamp.getDate()).slice(-2);

        let dateTuple = {
            year: year,
            month: month,
            day: date,
        };
        return dateTuple;
    }

    async confirmEditRecipient(recipient) {
        this.currentRecipient = {...this.currentRecipient, ...recipient};
        await this.updateRecipient();
    }

    async loadLastModifiedName(personIdentifier) {
        if (personIdentifier !== undefined) {
            let response = await this.sendGetPersonRequest(personIdentifier);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                this.lastModifiedName = responseBody.givenName + ' ' + responseBody.familyName;
            } else {
                this.lastModifiedName = '';
            }
        }
    }

    sortRecipients(unsortedRecipients) {
        let sortedRecipients = unsortedRecipients.sort((a, b) => {
            let nameA = a.familyName.toUpperCase();
            let nameB = b.familyName.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return sortedRecipients;
    }

    clearAll() {
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

        this.subject = this._i18n.t('create-request.default-subject');

        this.showListView = true;
        this.showDetailsView = false;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

        // this.organizationLoaded = false;
        this.requestCreated = false;
        this.expanded = false;
    }

    addFilePicker() {
        const i18n = this._i18n;

        return html`
            <dbp-file-source
                id="file-source"
                context="${i18n.t('show-requests.filepicker-context')}"
                allowed-mime-types="application/pdf,.pdf"
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
                @dbp-file-source-file-selected="${this.onFileSelected}"
                @dbp-file-source-file-upload-finished="${this
                    .onFileUploadFinished}"></dbp-file-source>

            <dbp-file-sink
                id="file-sink"
                context="${i18n.t('show-requests.save-field-label')}"
                filename="download.pdf"
                subscribe="initial-file-handling-state,nextcloud-store-session"
                enabled-targets="${this.fileHandlingEnabledTargets}"
                nextcloud-auth-url="${this.nextcloudWebAppPasswordURL}"
                nextcloud-web-dav-url="${this.nextcloudWebDavURL}"
                nextcloud-name="${this.nextcloudName}"
                nextcloud-file-url="${this.nextcloudFileURL}"
                lang="${this.lang}"></dbp-file-sink>

            <dbp-file-source
                id="file-return-receipt"
                lang="${this.lang}"
                class="file-source-return-receipt"
                allowed-mime-types="application/pdf,.pdf"
                max-selected-items="1"
                nextcloud-auth-url="${this.nextcloudWebAppPasswordURL}"
                nextcloud-web-dav-url="${this.nextcloudWebDavURL}"
                nextcloud-name="${this.nextcloudName}"
                nextcloud-file-url="${this.nextcloudFileURL}"
                nexcloud-auth-info="${this.nextcloudAuthInfo}"
                @dbp-file-source-file-selected="${this.onReturnReceiptSelected}"
                @dbp-file-source-file-upload-finished="${this.onReturnReceiptUploadFinished}"
                subscribe="nextcloud-auth-url:nextcloud-auth-url,nextcloud-web-dav-url:nextcloud-web-dav-url,nextcloud-name:nextcloud-name,nextcloud-file-url:nextcloud-file-url"
                enabled-targets="${this.fileHandlingEnabledTargets}"
                text="${i18n.t('show-requests.return-receipt.pdf-only-text')}"
                button-label="${i18n.t(
                    'show-requests.return-receipt.upload-pdf-text',
                )}"></dbp-file-source>
        `;
    }

    checkValidity(input) {
        const isValid = input.reportValidity();
        input.setAttribute('aria-invalid', !isValid);
        return isValid;
    }

    addEditSenderModal() {
        return html`
            <dbp-dispatch-edit-sender-modal
                id="edit-sender-modal"
                lang="${this.lang}"
                .sender=${this.currentItem}
                @confirm="${async (event) => {
                    const modal = event.currentTarget;
                    await this.confirmEditSender(event.detail);
                    modal.close();
                }}"
                @dbp-modal-closed="${() => {
                    this.loading = false;
                }}"></dbp-dispatch-edit-sender-modal>
        `;
    }

    addAddRecipientModal() {
        return html`
            <dbp-dispatch-add-recipient-modal
                id="add-recipient-modal"
                lang="${this.lang}"
                entry-point-url="${this.entryPointUrl}"
                .recipient=${this.currentRecipient}
                @confirm="${async (event) => {
                    const modal = event.currentTarget;
                    await this.addRecipientToRequest(event.detail.recipient);
                    event.detail.complete();
                    modal.close();
                    this.currentRecipient = {};
                }}"
                @dbp-modal-closed="${() => {
                    this.currentRecipient = {};
                    this.personSelectorIsDisabled = false;
                }}"></dbp-dispatch-add-recipient-modal>
        `;
    }

    addEditRecipientModal() {
        return html`
            <dbp-dispatch-edit-recipient-modal
                id="edit-recipient-modal"
                lang="${this.lang}"
                .recipient=${this.currentRecipient}
                @confirm="${async (event) => {
                    const modal = event.currentTarget;
                    await this.confirmEditRecipient(event.detail);
                    modal.close();
                }}"
                @dbp-modal-closed="${() => {
                    this.currentRecipient = {};
                    this.loading = false;
                }}"></dbp-dispatch-edit-recipient-modal>
        `;
    }

    addShowRecipientModal() {
        return html`
            <dbp-dispatch-show-recipient-modal
                id="show-recipient-modal"
                lang="${this.lang}"
                .recipient=${this.currentRecipient}
                @upload-return-receipt="${() => {
                    this._('#file-return-receipt').setAttribute('dialog-open', '');
                }}"
                @download-return-receipt="${(event) => {
                    this._onDownloadFileClicked(
                        {target: event.detail.button},
                        event.detail.statusChange.identifier,
                    );
                }}"
                @view-return-receipt="${(event) => {
                    this.showReturnReceiptFileViewer(
                        {target: event.detail.button},
                        event.detail.statusChange,
                    );
                }}"
                @delete-return-receipt="${(event) => {
                    this._onDeleteReceiptClicked(
                        {target: event.detail.button},
                        event.detail.statusChange,
                    );
                }}"
                @dbp-modal-closed="${() => {
                    this.currentRecipient = {};
                    this.loading = false;
                    if (this.button) {
                        this.button.stop();
                        this.button = undefined;
                    }
                }}"></dbp-dispatch-show-recipient-modal>
        `;
    }

    async showReturnReceiptFileViewer(event, statusChange) {
        let button = event.target;
        button.start();

        try {
            let response = await this.sendGetStatusChangeRequest(statusChange['identifier']);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                let fileContentUrl = responseBody['fileContentUrl'];
                let fileName = 'DeliveryNotification';
                const arr = dispatchHelper.convertDataURIToBinary(fileContentUrl);
                const binaryFile = new File([arr], fileName, {
                    type: dispatchHelper.getDataURIContentType(fileContentUrl),
                });

                this._('#file-viewer-modal').showPDF(binaryFile);
            } else {
                send({
                    summary: 'Error',
                    body: 'No file could not be displayed',
                    type: 'danger',
                    timeout: 10,
                });
            }
        } finally {
            button.stop();
        }
    }

    async _onDeleteReceiptClicked(event, statusChange) {
        const i18n = this._i18n;
        let button = event.target;
        button.start();

        try {
            let responseDelete = await this.sendDeleteStatusChangeFileRequest(
                statusChange.identifier,
            );
            if (responseDelete.ok === true && responseDelete.status === 204) {
                send({
                    summary: i18n.t('show-requests.successfully-deleted-file-title'),
                    body: i18n.t('show-requests.return-receipt.successfully-deleted-file-text'),
                    type: 'success',
                    timeout: 5,
                });

                // Update statusChange in currentRecipient.
                this.fetchDetailedRecipientInformation(this.currentRecipient.identifier);
            }
        } catch (error) {
            send({
                summary: 'Error',
                body: i18n.t('show-requests.return-receipt.file-delete-error-text') + error,
                type: 'error',
                timeout: 5,
            });
        } finally {
            button.stop();
        }
    }

    async sendDeleteStatusChangeFileRequest(id) {
        const options = {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        return await this.httpGetAsync(
            this.entryPointUrl +
                '/dispatch/request-status-changes/' +
                encodeURIComponent(id) +
                '/file',
            options,
        );
    }

    async onReturnReceiptSelected(event) {
        const i18n = this._i18n;

        if (this.currentRecipient.statusType !== 26 && this.currentRecipient.statusType !== 30) {
            send({
                summary: 'Bad statusType',
                body: i18n.t('show-requests.return-receipt.upload-not-allowed'),
                type: 'danger',
                timeout: 10,
            });
            return;
        }

        const lastStatusChange = this.currentRecipient.lastStatusChange;
        if (lastStatusChange.fileFormat) {
            send({
                summary: 'Error',
                body: i18n.t('show-requests.return-receipt.delete-before-uploading'),
                type: 'danger',
                timeout: 10,
            });
            return;
        }

        if (!event.detail.file) {
            send({
                summary: 'Error',
                body: i18n.t('show-requests.return-receipt.file-not-received'),
                type: 'danger',
                timeout: 10,
            });
            return;
        }

        const deliveryStatusChangeIdentifier = lastStatusChange.identifier;

        let statusChangeFormData = new FormData();
        statusChangeFormData.append('dispatchRequestIdentifier', this.currentItem.identifier);
        statusChangeFormData.append(
            'dispatchRequestRecipientIdentifier',
            this.currentRecipient.identifier,
        );
        statusChangeFormData.append('file', event.detail.file);
        statusChangeFormData.append('statusType', '26');
        statusChangeFormData.append('description', 'Rückschein uploaded');
        statusChangeFormData.append('fileUploaderIdentifier', this.auth['user-id']);

        let response = await this.sendPostDeliveryStatusChangeFile(
            statusChangeFormData,
            deliveryStatusChangeIdentifier,
        );
        let statusChange = await response.json();
        if (statusChange !== undefined && response.status === 201) {
            send({
                summary: 'Success',
                body: i18n.t('show-requests.return-receipt.file-uploaded-successfully-text'),
                type: 'success',
                timeout: 10,
            });
            this.fetchDetailedRecipientInformation(this.currentRecipient.identifier);
        } else {
            send({
                summary: i18n.t('show-requests.return-receipt.file-upload-error-title'),
                body: response.status + ' - ' + response.statusText,
                type: 'danger',
                timeout: 10,
            });
        }
    }

    onReturnReceiptUploadFinished() {
        console.log('onReturnReceiptUploadFinished');
    }

    async sendPostDeliveryStatusChangeFile(statusChangeFormData, id) {
        const options = {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: statusChangeFormData,
        };

        return await this.httpGetAsync(
            this.entryPointUrl +
                '/dispatch/request-status-changes/' +
                encodeURIComponent(id) +
                '/file',
            options,
        );
    }

    addEditSubjectModal() {
        return html`
            <dbp-dispatch-edit-subject-modal
                id="edit-subject-modal"
                lang="${this.lang}"
                .subject=${this.subject}
                @confirm="${async (event) => {
                    const modal = event.currentTarget;
                    await this.confirmEditSubject(event.detail.subject);
                    modal.close();
                }}"
                @dbp-modal-closed="${() => {
                    this.loading = false;
                }}"></dbp-dispatch-edit-subject-modal>
        `;
    }

    addEditReferenceNumberModal() {
        return html`
            <dbp-dispatch-edit-reference-number-modal
                id="edit-reference-number-modal"
                lang="${this.lang}"
                .referenceNumber=${this.currentItem.referenceNumber ?? ``}
                @confirm="${async (event) => {
                    const modal = event.currentTarget;
                    await this.confirmEditReferenceNumber(event.detail.referenceNumber);
                    modal.close();
                }}"
                @dbp-modal-closed="${() => {
                    this.loading = false;
                }}"></dbp-dispatch-edit-reference-number-modal>
        `;
    }

    addFileViewerModal() {
        return html`
            <dbp-dispatch-file-viewer-modal
                id="file-viewer-modal"
                lang="${this.lang}"
                @dbp-modal-closed="${() => {
                    this.loading = false;
                }}"></dbp-dispatch-file-viewer-modal>
        `;
    }

    addDetailedFilesView() {
        const i18n = this._i18n;

        return html`
            <div class="details files">
                <div class="header-btn">
                    <div class="section-titles">
                        ${i18n.t('show-requests.files')}
                        <span class="section-title-counts">
                            ${this.currentItem.files && this.currentItem.files.length !== 0
                                ? `(` + this.currentItem.files.length + `)`
                                : ``}
                        </span>
                    </div>
                    ${!this.currentItem.dateSubmitted
                        ? html`
                              <dbp-loading-button
                                  id="add-files-btn"
                                  ?disabled="${this.loading ||
                                  this.currentItem.dateSubmitted ||
                                  !this.mayWrite}"
                                  value="${i18n.t('show-requests.add-files-button-text')}"
                                  @click="${(event) => {
                                      this.requestCreated = true;
                                      this.addFileViaButton = true;
                                      this.openFileSource();
                                  }}"
                                  title="${i18n.t('show-requests.add-files-button-text')}">
                                  <dbp-icon name="plus" aria-hidden="true"></dbp-icon>
                                  ${i18n.t('show-requests.add-files-button-text')}
                              </dbp-loading-button>
                          `
                        : ``}
                </div>
                <div class="files-data">
                    ${this.currentItem.files
                        ? this.currentItem.files.map(
                              (file) => html`
                                  <div class="file card">
                                      <div class="left-side">
                                          <div>${file.name}</div>
                                          <div>${humanFileSize(file.contentSize)}</div>
                                          <div>${file.fileFormat}</div>
                                          <div>${this.convertToReadableDate(file.dateCreated)}</div>
                                      </div>
                                      <div class="right-side">
                                          <dbp-icon-button
                                              id="show-file-btn"
                                              @click="${(event) => {
                                                  this._onShowFileClicked(event, file.identifier);
                                              }}"
                                              aria-label="${i18n.t(
                                                  'show-requests.show-file-button-text',
                                              )}"
                                              title="${i18n.t(
                                                  'show-requests.show-file-button-text',
                                              )}"
                                              icon-name="keyword-research"></dbp-icon-button>
                                          <dbp-icon-button
                                              id="download-file-btn"
                                              @click="${(event) => {
                                                  this._onDownloadRequestFileClicked(
                                                      event,
                                                      file.identifier,
                                                  );
                                              }}"
                                              aria-label="${i18n.t(
                                                  'show-requests.download-file-button-text',
                                              )}"
                                              title="${i18n.t(
                                                  'show-requests.download-file-button-text',
                                              )}"
                                              icon-name="download"></dbp-icon-button>
                                          ${!this.currentItem.dateSubmitted
                                              ? html`
                                                    <dbp-icon-button
                                                        id="delete-file-btn"
                                                        ?disabled="${this.loading ||
                                                        this.currentItem.dateSubmitted ||
                                                        !this.mayWrite}"
                                                        @click="${(event) => {
                                                            this.deleteFile(event, file);
                                                        }}"
                                                        aria-label="${i18n.t(
                                                            'show-requests.delete-file-button-text',
                                                        )}"
                                                        title="${i18n.t(
                                                            'show-requests.delete-file-button-text',
                                                        )}"
                                                        icon-name="trash"></dbp-icon-button>
                                                `
                                              : ``}
                                      </div>
                                  </div>
                              `,
                          )
                        : ``}
                    <div
                        class="no-files ${classMap({
                            hidden:
                                !this.isLoggedIn() ||
                                (this.currentItem.files && this.currentItem.files.length !== 0),
                        })}">
                        ${this.mayReadMetadata && !this.mayRead && !this.mayWrite
                            ? i18n.t('show-requests.metadata-files-text')
                            : i18n.t('show-requests.empty-files-text')}
                    </div>
                </div>
            </div>
        `;
    }

    addSenderDetails() {
        const i18n = this._i18n;

        return html`
            <div class="details sender">
                <div class="header-btn">
                    <div class="section-titles">${i18n.t('show-requests.sender')}</div>
                    ${!this.currentItem.dateSubmitted
                        ? html`
                              <dbp-icon-button
                                  id="edit-sender-btn"
                                  ?disabled="${this.loading ||
                                  this.currentItem.dateSubmitted ||
                                  !this.mayWrite}"
                                  @click="${(event) => {
                                      this._('#edit-sender-modal').open(this.currentItem);
                                  }}"
                                  aria-label="${i18n.t('show-requests.edit-sender-button-text')}"
                                  title="${i18n.t('show-requests.edit-sender-button-text')}"
                                  icon-name="pencil"></dbp-icon-button>
                          `
                        : ``}
                </div>
                <div class="sender-data">
                    <div class="inline-label">
                        ${i18n.t('show-requests.edit-sender-fn-dialog-label')}
                    </div>
                    ${this.currentItem.senderFullName && this.currentItem.senderOrganizationName
                        ? html`
                              ${this.currentItem.senderFullName}
                          `
                        : html`
                              ${this.currentItem.senderFullName
                                  ? html`
                                        ${this.currentItem.senderFullName}
                                    `
                                  : ``}
                          `}
                    <br />
                    <div class="inline-label">
                        ${i18n.t('show-requests.edit-sender-gn-dialog-label')}
                    </div>
                    ${this.currentItem.senderOrganizationName
                        ? html`
                              ${this.currentItem.senderOrganizationName}
                          `
                        : ``}
                    <br />
                    <div class="inline-label">
                        ${i18n.t('show-requests.edit-sender-sa-dialog-label')}
                    </div>
                    ${this.currentItem.senderStreetAddress
                        ? html`
                              ${this.currentItem.senderStreetAddress}
                          `
                        : ``}
                    <br />
                    <div class="inline-label">
                        ${i18n.t('show-requests.edit-sender-pc-dialog-label')}
                    </div>
                    ${this.currentItem.senderPostalCode
                        ? html`
                              ${this.currentItem.senderPostalCode}
                          `
                        : ``}
                    <br />
                    <div class="inline-label">
                        ${i18n.t('show-requests.edit-sender-al-dialog-label')}
                    </div>
                    ${this.currentItem.senderAddressLocality
                        ? html`
                              ${this.currentItem.senderAddressLocality}
                          `
                        : ``}
                    <br />
                    <div class="inline-label">
                        ${i18n.t('show-requests.edit-sender-ac-dialog-label')}
                    </div>
                    ${this.currentItem.senderAddressCountry
                        ? html`
                              ${this.lang === 'en'
                                  ? dispatchHelper.getEnglishCountryMapping()[
                                        this.currentItem.senderAddressCountry
                                    ]
                                  : dispatchHelper.getGermanCountryMapping()[
                                        this.currentItem.senderAddressCountry
                                    ]}
                          `
                        : ``}
                </div>
            </div>
        `;
    }

    addRecipientCardLeftSideContent(recipient) {
        const i18n = this._i18n;
        console.log('addRecipientCardLeftSideContent');
        return html`
            <div class="left-side">
                <div>${recipient.givenName} ${recipient.familyName}</div>
                <div>${recipient.streetAddress}</div>
                <div>${recipient.postalCode} ${recipient.addressLocality}</div>
                <div>
                    ${this.currentItem.senderAddressCountry
                        ? html`
                              ${this.lang === 'en'
                                  ? dispatchHelper.getEnglishCountryMapping()[
                                        recipient.addressCountry
                                    ]
                                  : dispatchHelper.getGermanCountryMapping()[
                                        recipient.addressCountry
                                    ]}
                          `
                        : ``}
                </div>
                ${recipient.electronicallyDeliverable
                    ? html`
                          <div class="delivery-status">
                              <span class="status-green">●</span>
                              ${i18n.t('show-requests.electronically-deliverable')}
                          </div>
                      `
                    : ``}
                ${!recipient.electronicallyDeliverable && recipient.postalDeliverable
                    ? html`
                          <div class="delivery-status">
                              <span class="status-orange">●</span>
                              ${i18n.t('show-requests.only-postal-deliverable')}
                          </div>
                      `
                    : ``}
                ${!recipient.electronicallyDeliverable && !recipient.postalDeliverable
                    ? html`
                          <div class="delivery-status">
                              <span class="status-red">●</span>
                              ${i18n.t('show-requests.not-deliverable-1')}
                              <dbp-tooltip
                                  icon-name="warning-high"
                                  class="info-tooltip"
                                  text-content="${i18n.t('show-requests.not-deliverable-2')}"
                                  interactive></dbp-tooltip>
                          </div>
                      `
                    : ``}
                ${this.currentItem.dateSubmitted &&
                recipient.lastStatusChange.dispatchStatus &&
                recipient.lastStatusChange.dispatchStatus === 'failure'
                    ? html`
                          <div class="dispatch-status">
                              <span class="status-title">
                                  ${i18n.t('show-requests.dispatch-status')}
                              </span>
                              <span class="status-red">${i18n.t('show-requests.failure')}</span>
                          </div>
                      `
                    : ``}
                ${this.currentItem.dateSubmitted &&
                recipient.lastStatusChange.dispatchStatus &&
                recipient.lastStatusChange.dispatchStatus === 'success'
                    ? html`
                          <div class="dispatch-status">
                              <span class="status-title">
                                  ${i18n.t('show-requests.dispatch-status')}
                              </span>
                              <span class="status-green">
                                  ${i18n.t(
                                      DBPDispatchLitElement.isRecipientNotInForeignCountry(
                                          recipient,
                                      )
                                          ? 'show-requests.success'
                                          : 'show-requests.success-foreign-countries',
                                  )}
                              </span>
                          </div>
                      `
                    : ``}
                ${this.currentItem.dateSubmitted &&
                recipient.lastStatusChange.dispatchStatus &&
                recipient.lastStatusChange.dispatchStatus === 'pending'
                    ? html`
                          <div class="dispatch-status">
                              <span class="status-title">
                                  ${i18n.t('show-requests.dispatch-status')}
                              </span>
                              <span>${i18n.t('show-requests.pending')}</span>
                          </div>
                      `
                    : ``}
                ${this.currentItem.dateSubmitted &&
                recipient.lastStatusChange.dispatchStatus &&
                recipient.lastStatusChange.dispatchStatus === 'unknown'
                    ? html`
                          <div class="dispatch-status">
                              <span class="status-title">
                                  ${i18n.t('show-requests.dispatch-status')}
                              </span>
                              <span class="status-orange">${i18n.t('show-requests.unknown')}</span>
                          </div>
                      `
                    : ``}
            </div>
        `;
    }

    /**
     * Check if recipient is from Austria or if the addressCountry is empty (empty will most likely mean electronic delivery)
     * @param recipient
     * @returns {boolean}
     */
    static isRecipientNotInForeignCountry(recipient) {
        return (
            recipient.addressCountry === 'AT' ||
            recipient.addressCountry === '' ||
            !recipient.addressCountry
        );
    }

    checkRecipientStatus(recipients) {
        const i18n = this._i18n;

        let countFailure = 0;
        let countSuccess = 0;
        let countSuccessForeignCountries = 0;
        let countPending = 0;

        for (let i = 0; i < recipients.length; i++) {
            let recipient = recipients[i];
            console.log('checkRecipientStatus recipient', recipient);

            let status;
            if (recipient.lastStatusChange) {
                status = recipient.lastStatusChange.dispatchStatus;
            } else {
                status = 'unknown';
            }
            if (status === 'success') {
                if (DBPDispatchLitElement.isRecipientNotInForeignCountry(recipient)) {
                    countSuccess++;
                } else {
                    countSuccessForeignCountries++;
                }
            } else if (status === 'pending') {
                countPending++;
            } else {
                countFailure++;
            }
        }

        let overallStatusTextItems = [];
        let shortStatusTextItems = [];

        if (countSuccess > 0) {
            overallStatusTextItems.push(
                i18n.t('show-requests.overall-status-success', {success: countSuccess}),
            );
            shortStatusTextItems.push(
                i18n.t('show-requests.short-status-success', {success: countSuccess}),
            );
        }

        if (countSuccessForeignCountries > 0) {
            overallStatusTextItems.push(
                i18n.t('show-requests.overall-status-success-foreign-countries', {
                    success: countSuccessForeignCountries,
                }),
            );
            shortStatusTextItems.push(
                i18n.t('show-requests.short-status-success-foreign-countries', {
                    success: countSuccessForeignCountries,
                }),
            );
        }

        if (countPending > 0) {
            overallStatusTextItems.push(
                i18n.t('show-requests.overall-status-pending', {pending: countPending}),
            );
            shortStatusTextItems.push(
                i18n.t('show-requests.short-status-pending', {pending: countPending}),
            );
        }

        if (countFailure > 0) {
            overallStatusTextItems.push(
                i18n.t('show-requests.overall-status-failure', {failure: countFailure}),
            );
            shortStatusTextItems.push(
                i18n.t('show-requests.short-status-failure', {failure: countFailure}),
            );
        }

        const overallStatusText = overallStatusTextItems.join(', ');
        const shortStatusText = shortStatusTextItems.join(', ');

        return [overallStatusText, shortStatusText];
    }

    storeGroupValue(value) {
        this.groupValue = value;
        sessionStorage.setItem('dbp-dispatch-group-value', this.groupValue);
    }

    loadGroupValue() {
        this.groupValue = sessionStorage.getItem('dbp-dispatch-group-value');

        return this.groupValue;
    }

    /**
     * @param {string} dateTimeString in 'dd.mm.yyyy hh:mm' format
     * @returns {number} unix timestamp
     */
    dateToTimestamp(dateTimeString) {
        if (!dateTimeString) {
            return -Infinity;
        }
        // Split the date and time parts
        const [datePart, timePart] = dateTimeString.split(' ');

        // Split the date into day, month, and year
        const [day, month, year] = datePart.split('.');

        // Split the time into hours and minutes
        const [hours, minutes] = timePart.split(':');

        const dateObject = new Date(year, month - 1, day, hours, minutes);
        const timestamp = dateObject.getTime();

        return timestamp;
    }

    onCountryChange(e) {
        const selectedCode = e.target.value;
        console.log('User selected country:', selectedCode);
        this.currentRecipient.addressCountry = selectedCode;
        // handle however you need
    }
}

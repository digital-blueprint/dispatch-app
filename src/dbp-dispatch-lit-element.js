import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import {send} from "@dbp-toolkit/common/notification";
import MicroModal from "./micromodal.es";
import {FileSource, FileSink} from "@dbp-toolkit/file-handling";
import {html} from "lit";
import * as dispatchHelper from './utils';
import {CustomPersonSelect} from "./person-select";
import {ResourceSelect} from "@dbp-toolkit/resource-select";
import {IconButton} from "@dbp-toolkit/common";
import {humanFileSize} from "@dbp-toolkit/common/i18next";
import {classMap} from "lit/directives/class-map.js";
import {PdfViewer} from "@dbp-toolkit/pdf-viewer";
import {getReferenceNumberFromPDF} from "./utils";


export default class DBPDispatchLitElement extends DBPLitElement {
    constructor() {
        super();
        this.isSessionRefreshed = false;
        this.auth = {};

        this.currentItem = {};
        this.currentRecipient = {};
        this.subject = '';
        this.groupId = '';
        this.groupValue = this.loadGroupValue();

        this.tempItem = {};
        this.tempValue = {};
        this.tempChange = false;
    }

    static get scopedElements() {
        return {
            'dbp-file-source': FileSource,
            'dbp-file-sink': FileSink,
            'dbp-person-select': CustomPersonSelect,
            'dbp-resource-select': ResourceSelect,
            'dbp-icon-button': IconButton,
            'dbp-pdf-viewer': PdfViewer
        };
    }

    static get properties() {
        return {
            ...super.properties,
            auth: { type: Object },

            currentItem: {type: Object, attribute: false},
            currentRecipient: {type: Object, attribute: false},
            subject: {type: String, attribute: false},
            groupId: {type: String, attribute: false},
            tempItem: {type: Object, attribute: false},
            tempValue: {type: Object, attribute: false},

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
                case "auth":
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
        return (this.auth.person !== undefined && this.auth.person !== null);
    }

    /**
     * Returns true if a person has successfully logged in
     * @returns {boolean} true or false
     */
    isLoading() {
        if (this._loginStatus === "logged-out")
            return false;
        return (!this.isLoggedIn() && this.auth.token !== undefined);
    }

    /**
     * Send a fetch to given url with given options
     * @param url
     * @param options
     * @returns {object} response (error or result)
     */
    async httpGetAsync(url, options) {
        let response = await fetch(url, options).then(result => {
            if (!result.ok) throw result;
            return result;
        }).catch(error => {
            return error;
        });

        return response;
    }

    /**
     * Gets the list of all dispatch requests of the current logged-in user
     * @param groupId
     * @returns {object} response
     */
    async getListOfDispatchRequests(groupId) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests?perPage=999&groupId=' + groupId, options);
    }

    /**
     * Gets the dispatch request of the current logged-in user with the given identifier
     * @param identifier
     * @returns {object} response
     */
    async getDispatchRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier, options);
    }

    /**
     * Gets the dispatch recipient of the given ID
     * @param identifier
     * @returns {object} response
     */
    async getDispatchRecipient(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-recipients/' + identifier, options);
    }

    /**
     * Sends a dispatch post request
     * @returns {object} response
     */
    async sendCreateDispatchRequest() {
        let body = {
            "name": this.subject,
            "senderOrganizationName": this.currentItem.senderOrganizationName, //we set the same for both since senderOrganizationName will be ignored but we need to have the organization somewhere
            "senderFullName": this.currentItem.senderOrganizationName, // this.currentItem.senderFullName,
            "senderAddressCountry": this.currentItem.senderAddressCountry,
            "senderPostalCode": this.currentItem.senderPostalCode,
            "senderAddressLocality": this.currentItem.senderAddressLocality,
            "senderStreetAddress": this.currentItem.senderStreetAddress,
            "senderBuildingNumber": '', //this.currentItem.senderBuildingNumber,
            "groupId": this.groupId
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
     * @returns {object} response
     */
    async sendDeleteDispatchRequest(identifier) {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier, options);
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
     * @returns {object} response
     */
    async sendEditDispatchRequest(identifier, senderOrganizationName, senderFullName, senderAddressCountry, senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber, groupId) {
        let body = {
            "senderOrganizationName": senderOrganizationName,
            "senderFullName": senderOrganizationName, //'', //senderFullName,
            "senderAddressCountry": senderAddressCountry,
            "senderPostalCode": senderPostalCode,
            "senderAddressLocality": senderAddressLocality,
            "senderStreetAddress": senderStreetAddress,
            "senderBuildingNumber": senderBuildingNumber,
            "groupId": groupId
        };

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier, options);
    }

    /**
     * Sends a submit dispatch request
     * @param identifier
     * @returns {object} response
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

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier + '/submit', options);
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
     * @returns {object} response
     */
    async sendAddRequestRecipientsRequest(id, personIdentifier, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress) {
        let body;

        if (personIdentifier === null) {
            body = {
                "dispatchRequestIdentifier": id,
                "givenName": givenName,
                "familyName": familyName,
                "addressCountry": addressCountry,
                "postalCode": postalCode,
                "addressLocality": addressLocality,
                "streetAddress": streetAddress,
                "buildingNumber": '',
                "birthDate": birthDate
            };
        } else {
            body = {
                "dispatchRequestIdentifier": id,
                "personIdentifier": personIdentifier,
                "buildingNumber": ''
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

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-recipients', options);
    }

    async sendUpdateRecipientRequest(recipientId, id, personIdentifier, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress) {
        let body;

        if (personIdentifier === null) {
            body = {
                "dispatchRequestIdentifier": id,
                "givenName": givenName,
                "familyName": familyName,
                "addressCountry": addressCountry,
                "postalCode": postalCode,
                "addressLocality": addressLocality,
                "streetAddress": streetAddress,
                "birthDate": birthDate
            };
        } else {
            body = {
                "dispatchRequestIdentifier": id,
                "personIdentifier": personIdentifier,
            };
            if (givenName) {
                body["givenName"] = givenName;
            }
            if (familyName) {
                body["familyName"] = familyName;
            }
            if (birthDate) {
                body["birthDate"] = birthDate;
            }
            if (addressCountry) {
                body["addressCountry"] = addressCountry;
            }
            if (postalCode) {
                body["postalCode"] = postalCode;
            }
            if (addressLocality) {
                body["addressLocality"] = addressLocality;
            }
            if (streetAddress) {
                body["streetAddress"] = streetAddress;
            }
        }

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-recipients/' + recipientId, options);
    }

    async sendDeleteRecipientRequest(id) {
        const options = {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-recipients/' + id, options);
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

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-files/' + id, options);
    }

    async sendGetPersonDetailsRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        // return await this.httpGetAsync(this.entryPointUrl + identifier, options); ///'base/people/'
        return await this.httpGetAsync(this.entryPointUrl + identifier + '?includeLocal=streetAddress%2CaddressLocality%2CpostalCode%2CaddressCountry', options);
    }

    async sendGetPersonRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/base/people/' + identifier, options);
    }

    async sendChangeSubjectRequest(identifier, subject) {
        let body = {
            "name": subject,
        };

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier, options);
    }

    /**
     * Send a PUT request to the API to change the reference number of a request
     * @param identifier The identifier of the dispatch request
     * @param referenceNumber The new reference number
     */
    async sendChangeReferenceNumberRequest(identifier, referenceNumber) {
        let body = {
            "referenceNumber": referenceNumber
        };

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
            },
            body: JSON.stringify(body),
        };

        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier, options);
    }

    async sendGetStatusChangeRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + identifier, options);
    }

    async sendGetFileRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/request-files/' + identifier, options);
    }

    async getCreatedDispatchRequests() {
        // const i18n = this._i18n;
        this.createRequestsLoading = !this._initialFetchDone;

        this.createdRequestsList = [];
        let createdRequestsIds = this.createdRequestsIds;

        if (createdRequestsIds !== null) {
            for (let i = 0; i < createdRequestsIds.length; i++) {
                try {
                    let response = await this.getDispatchRequest(createdRequestsIds[i]);
                    let responseBody = await response.json();
                    if (responseBody !== undefined && responseBody.status !== 403) {
                        this.createdRequestsList.push(responseBody);
                    } else {
                        if (response.status === 500) {
                            send({
                                "summary": 'Error!',
                                "body": 'Could not fetch dispatch requests. Response code: 500',
                                "type": "danger",
                                "timeout": 5,
                            });
                        }  else if (response.status === 403) {
                            //TODO
                        }
                    }
                } catch (e) {
                    send({
                        "summary": 'Error!',
                        "body": 'Could not fetch dispatch requests.',
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            }
        }

        let tableObject = this.createTableObject(this.createdRequestsList);
        this.dispatchRequestsTable.replaceData(tableObject);
        this.dispatchRequestsTable.setLocale(this.lang);
        this.totalNumberOfItems = this.dispatchRequestsTable.getDataCount("active");
        // console.log('totalNumberOfItems: ' + this.totalNumberOfItems);

        this.createRequestsLoading = false;
        this._initialFetchDone = true;

        //TODO here
        this.showListView = true;
    }

    /*
    * Open file source
    *
    */
    openFileSource() {
        const fileSource = this._('#file-source');
        if (fileSource) {
            this._('#file-source').openDialog();
        }

        if (this.singleFileProcessing && !this.requestCreated) {
            this.processCreateDispatchRequest().then(() => {
                this.showDetailsView = true;
                this.hasSubject = true;
                this.hasSender = true;
            });
        }
    }

    onFileUploadFinished(event) {
        this.fileUploadFinished = true;
        this.uploadedNumberOfFiles = event.detail.count;
        console.log(this.uploadedNumberOfFiles);
        this.currentFileIndex = 0;
    }

    async onFileSelected(event) {
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
        this._('#add-files-btn').start();

        try {
            let id = this.currentItem.identifier;
            await this.addFileToRequest(id, file);
        } catch (e) {
            //TODO
            send({
                "summary": 'Error!',
                "body": 'There was an error.',
                "type": "danger",
                "timeout": 5,
            });
        } finally {
            this._('#add-files-btn').stop();
        }
    }

    async addFileToRequest(id, file) {
        const i18n = this._i18n;

        // Get the reference number from the PDF
        const referenceNumber = await getReferenceNumberFromPDF(file);

        // Set the reference number if it is not set yet, and we have a valid one
        if (referenceNumber !== null && [undefined, null, '-'].includes(this.currentItem.referenceNumber)) {
            const response = await this.sendChangeReferenceNumberRequest(id, referenceNumber);
            if (response.status !== 200) {
                console.error('Could not set reference number!');

                send({
                    "summary": i18n.t('show-requests.error-reference-number-auto-update-failed-title'),
                    "body": i18n.t('show-requests.error-reference-number-auto-update-failed-text'),
                    "type": "danger",
                    "timeout": 5,
                });
            } else {
                console.log("referenceNumber was updated", referenceNumber);
                this.currentItem.referenceNumber = referenceNumber;

                send({
                    "summary": i18n.t('show-requests.error-reference-number-auto-update-success-title'),
                    "body": i18n.t('show-requests.error-reference-number-auto-update-success-text'),
                    "type": "info",
                    "timeout": 5,
                });
            }
        }

        let response = await this.sendAddFileToRequest(id, file);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 201) {
            if (this.singleFileProcessing) {
                send({
                    "summary": i18n.t('show-requests.successfully-added-file-title'),
                    "body": i18n.t('show-requests.successfully-added-file-text'),
                    "type": "success",
                    "timeout": 5,
                });
            }

            let resp = await this.getDispatchRequest(id);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }

            this.currentFileIndex++;

            if (this.uploadedNumberOfFiles === this.currentFileIndex) {
                await this.getCreatedDispatchRequests();
            }
            //TODO
        } else {
            // TODO error handling
            if (this.singleFileProcessing) {
                send({
                    "summary": 'Error!',
                    "body": 'File could not be added.',
                    "type": "danger",
                    "timeout": 5,
                });
            }
        }
    }

    async deleteFile(event, file) {
        const i18n = this._i18n;
        let button = event.target;
        button.start();

        try {
            let response = await this.sendDeleteFileRequest(file.identifier, file);
            if (response.status === 204) {
                send({
                    "summary": i18n.t('show-requests.successfully-deleted-file-title'),
                    "body": i18n.t('show-requests.successfully-deleted-file-text'),
                    "type": "success",
                    "timeout": 5,
                });

                let id = this.currentItem.identifier;
                let resp = await this.getDispatchRequest(id);
                let responseBody = await resp.json();
                if (responseBody !== undefined && responseBody.status !== 403) {
                    this.currentItem = responseBody;
                }
            } else {
                // TODO error handling

                send({
                    "summary": 'Error!',
                    "body": 'File could not be deleted.',
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } finally {
            button.stop();
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
        this._('#file-sink').files = [...files];
    }

    async _onDownloadFileClicked(event, statusRequestId) {
        let button = event.target;
        button.start();

        try {
            let response = await this.sendGetStatusChangeRequest(statusRequestId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                console.log('resp: ', responseBody);
                let fileContentUrl = responseBody['fileContentUrl'];
                let fileName = 'DeliveryNotification';//responseBody['description']; //TODO
                await this.downloadFileClickHandler(fileContentUrl, fileName);

            } else {
                //TODO
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

    async addRecipientToRequest(button) {
        this._('#add-recipient-btn').start();
        try {
            const i18n = this._i18n;
            let id = this.currentItem.identifier;
            let givenName = this.currentRecipient.givenName;
            let familyName = this.currentRecipient.familyName;
            let addressCountry = this.currentRecipient.addressCountry;
            let postalCode = this.currentRecipient.postalCode;
            let addressLocality = this.currentRecipient.addressLocality;
            let streetAddress = this.currentRecipient.streetAddress;
            let personIdentifier = this.currentRecipient.personIdentifier ? this.currentRecipient.personIdentifier : null;

            let birthDate = '';
            if (this.currentRecipient.birthDateDay !== '' && this.currentRecipient.birthDateMonth !== '' && this.currentRecipient.birthDateYear !== '') {
                birthDate = this.currentRecipient.birthDateDay + '.' + this.currentRecipient.birthDateMonth + '.' + this.currentRecipient.birthDateYear;
            } else if (!personIdentifier) {
                send({
                    "summary": i18n.t('show-requests.error-invalid-birthdate-title'),
                    "body": i18n.t('show-requests.error-invalid-birthdate-text'),
                    "type": "danger",
                    "timeout": 5,
                });
                return;
            }

            let response = await this.sendAddRequestRecipientsRequest(id, personIdentifier, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress);

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
                    // console.log(this.currentItem);
                    this.currentRecipient = {};
                }
                this.currentRecipient.personIdentifier = '';
                this.currentRecipient.givenName = '';
                this.currentRecipient.familyName = '';
                this.currentRecipient.postalCode = '';
                this.currentRecipient.addressLocality = '';
                this.currentRecipient.streetAddress = '';
                this.currentRecipient.birthDateDay = '';
                this.currentRecipient.birthDateMonth = '';
                this.currentRecipient.birthDateYear = '';

                this.currentRecipient.addressCountry = dispatchHelper.getCountryMapping('AT');

                this._('#tf-add-recipient-gn-dialog').value = this.currentRecipient.givenName;
                this._('#tf-add-recipient-fn-dialog').value = this.currentRecipient.familyName;
                this._('#tf-add-recipient-pc-dialog').value = this.currentRecipient.postalCode;
                this._('#tf-add-recipient-al-dialog').value = this.currentRecipient.addressLocality;
                this._('#tf-add-recipient-sa-dialog').value = this.currentRecipient.streetAddress;
                this._('#tf-add-recipient-birthdate-day').value = this.currentRecipient.birthDateDay;
                this._('#tf-add-recipient-birthdate-month').value = this.currentRecipient.birthDateMonth;
                this._('#tf-add-recipient-birthdate-year').value = this.currentRecipient.birthDateYear;
                this._('#add-recipient-country-select').value = 'AT';

                this.requestUpdate();
            } else {
                // TODO error handling

                send({
                    "summary": 'Error!',
                    "body": 'Could not add recipient. Response code: ' + response.status,
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } catch (e) {
            //TODO
            send({
                "summary": 'Error!',
                "body": 'Could not add recipient.',
                "type": "danger",
                "timeout": 5,
            });
        } finally {
            this._('#recipient-selector').clear();
            this._('#add-recipient-btn').stop();
            button.disabled = false;
        }
    }

    async updateRecipient(button) {
        button.start();
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
            if (this.currentRecipient.birthDateDay !== '' && this.currentRecipient.birthDateMonth !== '' && this.currentRecipient.birthDateYear !== '') {
                birthDate = this.currentRecipient.birthDateDay + '.' + this.currentRecipient.birthDateMonth + '.' + this.currentRecipient.birthDateYear;
            }
            let personIdentifier = this.currentRecipient.personIdentifier;

            let recipientId = this.currentRecipient.identifier;

            // First, send a delete requests to remove the old recipient
            let response = await this.sendDeleteRecipientRequest(recipientId);
            if (response.status === 204) {
                // Then, send a new add request to add the updated recipient
                let innerResponse = await this.sendAddRequestRecipientsRequest(id, personIdentifier, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress);

                let innerResponseBody = await innerResponse.json();
                if (innerResponseBody !== undefined && innerResponse.status === 201) {
                    send({
                        "summary": i18n.t('show-requests.successfully-edited-recipient-title'),
                        "body": i18n.t('show-requests.successfully-edited-recipient-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                    this.currentRecipient = innerResponseBody;

                    let resp = await this.getDispatchRequest(id);
                    let responseBody = await resp.json();
                    if (responseBody !== undefined && responseBody.status !== 403) {
                        this.currentItem = responseBody;
                        this.currentRecipient = {};
                    }
                    this.currentRecipient.personIdentifier = '';
                    this.currentRecipient.givenName = '';
                    this.currentRecipient.familyName = '';
                    this.currentRecipient.postalCode = '';
                    this.currentRecipient.addressLocality = '';
                    this.currentRecipient.streetAddress = '';
                    this.currentRecipient.birthDateDay = '';
                    this.currentRecipient.birthDateMonth = '';
                    this.currentRecipient.birthDateYear = '';
                    this.currentRecipient.addressCountry = dispatchHelper.getCountryMapping('AT');

                    this._('#tf-edit-recipient-gn-dialog').value = this.currentRecipient.givenName;
                    this._('#tf-edit-recipient-fn-dialog').value = this.currentRecipient.familyName;
                    this._('#tf-edit-recipient-pc-dialog').value = this.currentRecipient.postalCode;
                    this._('#tf-edit-recipient-al-dialog').value = this.currentRecipient.addressLocality;
                    this._('#tf-edit-recipient-sa-dialog').value = this.currentRecipient.streetAddress;
                    this._('#tf-edit-recipient-birthdate-day').value = this.currentRecipient.birthDateDay;
                    this._('#tf-edit-recipient-birthdate-month').value = this.currentRecipient.birthDateMonth;
                    this._('#tf-edit-recipient-birthdate-year').value = this.currentRecipient.birthDateYear;
                    this._('#edit-recipient-country-select').value = 'AT';
                } else {
                    hasError = true;
                }
            } else {
                hasError = true;
            }
        } catch (e) {
            //TODO
            send({
                "summary": 'Error!',
                "body": 'Could not add recipient.',
                "type": "danger",
                "timeout": 5,
            });
        } finally {
            if (hasError) {
                send({
                    "summary": 'Error!',
                    "body": 'Could not add recipient.',
                    "type": "danger",
                    "timeout": 5,
                });
            }
            this.requestUpdate();
            button.stop();
        }
    }

    async deleteRecipient(event, recipient) {
        const i18n = this._i18n;
        let button = event.target;
        button.start();

        try {
            let response = await this.sendDeleteRecipientRequest(recipient.identifier);
            if (response.status === 204) {
                send({
                    "summary": i18n.t('show-requests.successfully-deleted-recipient-title'),
                    "body": i18n.t('show-requests.successfully-deleted-recipient-text'),
                    "type": "success",
                    "timeout": 5,
                });

                let id = this.currentItem.identifier;
                let resp = await this.getDispatchRequest(id);
                let responseBody = await resp.json();
                if (responseBody !== undefined && responseBody.status !== 403) {
                    this.currentItem = responseBody;
                    this.requestCreated = false;
                }
            } else {
                // TODO error handling

                send({
                    "summary": 'Error!',
                    "body": 'Could not delete recipient. Response code: ' + response.status,
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } finally {
            button.stop();
        }
    }

    async fetchStatusOfRecipient(recipient) {
        const i18n = this._i18n;
        console.log(recipient);

        let response = await this.getDispatchRecipient(recipient.identifier);
        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('show-requests.successfully-updated-sender-title'), //TODO
                "body": i18n.t('show-requests.successfully-updated-sender-text'),
                "type": "success",
                "timeout": 5,
            });

            this.currentRecipient.statusType = responseBody['statusType'];
            this.currentRecipient.statusDescription = responseBody['description'];
        } else {
            // TODO error handling

            // send({
            //     "summary": 'Error!',
            //     "body": 'Could not fetch status of recipient with ID: ' + recipient.identifier + '. Response code: ' + response.status,
            //     "type": "danger",
            //     "timeout": 5,
            // });
        }
    }

    async editRequest(event, item) {
        let button = event.target;
        button.start();

        try {
            let resp = await this.getDispatchRequest(item.identifier);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }

            this.currentItem.recipients.forEach((element) => {
                // console.log(element.identifier);
                this.fetchDetailedRecipientInformation(element.identifier).then(result => {
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

    async deleteRequest(event, item) {
        const i18n = this._i18n;
        let button = event.target;

        if (item.dateSubmitted) {
            send({
                "summary": i18n.t('show-requests.delete-not-allowed-title'),
                "body": i18n.t('show-requests.delete-not-allowed-text'),
                "type": "danger",
                "timeout": 5,
            });
            return;
        }

        if (confirm(i18n.t('show-requests.delete-dialog-text'))) {
            button.start();

            try {
                let response = await this.sendDeleteDispatchRequest(item.identifier);
                if (response.status === 204) {
                    if (this.dispatchRequestsTable ) {
                        if (this.createdRequestsList && this.createdRequestsList.length > 0) {
                            this.createdRequestsIds = this.createdRequestsIds.filter(id => id !== item.identifier);
                            this.getCreatedDispatchRequests();
                            this.currentItem = {};

                            this.currentItem.senderOrganizationName = "";
                            this.currentItem.senderFullName = "";
                            this.currentItem.senderAddressCountry = "";
                            this.currentItem.senderPostalCode = "";
                            this.currentItem.senderAddressLocality = "";
                            this.currentItem.senderStreetAddress = "";
                            this.currentItem.senderBuildingNumber = "";

                            this.currentItem.files = [];
                            this.currentItem.recipients = [];

                            this.currentRecipient = {};

                            this.subject = '';

                            this.showListView = true;
                            this.showDetailsView = false;

                            this.hasSubject = true;
                            this.hasSender = true;
                        } else {
                            this.getListOfRequests();
                            this.clearAll();
                        }
                    }
                    send({
                        "summary": i18n.t('show-requests.successfully-deleted-title'),
                        "body": i18n.t('show-requests.successfully-deleted-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                } else {
                    // TODO error handling

                    send({
                        "summary": 'Error!',
                        "body": 'Could not delete request. Response code: ' + response.status,
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            } catch (e) {
                //TODO
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
        if (!request.files || request.files.length == 0) {
            send({
                "summary": i18n.t('show-requests.missing-files.title'),
                "body": i18n.t('show-requests.missing-files.text'),
                "type": "danger",
                "timeout": 5,
            });
            return false;
        }

        // No recipients
        if (!request.recipients || request.recipients.length == 0) {
            send({
                "summary": i18n.t('show-requests.missing-recipients.title'),
                "body": i18n.t('show-requests.missing-recipients.text'),
                "type": "danger",
                "timeout": 5,
            });
            return false;
        }

        // Missing or empty referenceNumber
        if (!request.referenceNumber || !request.referenceNumber.trim()) {
            send({
                "summary": i18n.t('show-requests.missing-reference-number.title'),
                "body": i18n.t('show-requests.missing-reference-number.text'),
                "type": "danger",
                "timeout": 5,
            });
            return false;
        }

        // Missing or empty subject
        if (!request.name || !request.name.trim()) {
            send({
                "summary": i18n.t('show-requests.missing-subject.title'),
                "body": i18n.t('show-requests.missing-subject.text'),
                "type": "danger",
                "timeout": 5,
            });
            return false;
        }

        return true;
    }

    async submitRequest(event, item) {
        const i18n = this._i18n;
        let button = event.target;

        if (item.dateSubmitted) {
            send({
                "summary": i18n.t('show-requests.submit-not-allowed-title'),
                "body": i18n.t('show-requests.submit-not-allowed-text'),
                "type": "danger",
                "timeout": 5,
            });
            return;
        }

        if (!this.checkCanSubmit(item)) {
            return;
        }

        if(confirm(i18n.t('show-requests.submit-dialog-text'))) {
            try {
                this._('#submit-btn').start(); //TODO
                button.start();

                let response = await this.sendSubmitDispatchRequest(item.identifier);
                if (response.status === 201) {
                    if (this.dispatchRequestsTable) {
                        if (this.createdRequestsList && this.createdRequestsList.length > 0) {
                            this.createdRequestsIds = this.createdRequestsIds.filter(id => id !== item.identifier);
                            this.getCreatedDispatchRequests();
                            this.currentItem = {};

                            this.currentItem.senderOrganizationName = "";
                            this.currentItem.senderFullName = "";
                            this.currentItem.senderAddressCountry = "";
                            this.currentItem.senderPostalCode = "";
                            this.currentItem.senderAddressLocality = "";
                            this.currentItem.senderStreetAddress = "";
                            this.currentItem.senderBuildingNumber = "";

                            this.currentItem.files = [];
                            this.currentItem.recipients = [];

                            this.currentRecipient = {};

                            this.subject = '';

                            this.showListView = true;
                            this.showDetailsView = false;

                            this.hasSubject = true;
                            this.hasSender = true;
                        } else {
                            this.getListOfRequests();
                            this.clearAll();
                        }
                    }
                    send({
                        "summary": i18n.t('show-requests.successfully-submitted-title'),
                        "body": i18n.t('show-requests.successfully-submitted-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                } else if (response.status === 400) {
                    send({
                        "summary": i18n.t('error-delivery-channel-title'),
                        "body": i18n.t('error-delivery-channel-text'),
                        "type": "danger",
                        "timeout": 5,
                    });
                } else if (response.status === 403) {
                    send({
                        "summary": i18n.t('create-request.error-requested-title'),
                        "body": i18n.t('error-not-permitted'),
                        "type": "danger",
                        "timeout": 5,
                    });
                } else {
                    // TODO error handling

                    send({
                        "summary": 'Error!',
                        "body": 'Could not submit request. Response code: ' + response.status,
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            } catch (e) {
                //TODO
            } finally {
                this._('#submit-btn').stop();
                button.stop();
            }
        }
    }

    async changeSubjectRequest(id, subject) {
        this._('#edit-subject-btn').start();
        const i18n = this._i18n;
        try {
            let response = await this.sendChangeSubjectRequest(id, subject);
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 200) {
                this.currentItem = responseBody;
                this.subject = this.currentItem.name;

                console.log('responsebody AFTER changeSubjectRequest: ', responseBody);


                send({
                    "summary": i18n.t('show-requests.edit-subject-success-title'),
                    "body": i18n.t('show-requests.edit-subject-success-text'),
                    "type": "success",
                    "timeout": 5,
                });
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
                    "summary": i18n.t('create-request.error-changed-subject-title'),
                    "body": i18n.t('create-request.error-changed-subject-text'),
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } finally {
            this._('#edit-subject-btn').stop();
        }
    }

    async changeReferenceNumberRequest(id, referenceNumber) {
        this._('#edit-reference-number-btn').start();
        const i18n = this._i18n;
        try {
            let response = await this.sendChangeReferenceNumberRequest(id, referenceNumber);
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 200) {
                this.currentItem = responseBody;

                console.log('responsebody AFTER changeReferenceNumberRequest: ', responseBody);

                send({
                    "summary": i18n.t('show-requests.edit-reference-number-success-title'),
                    "body": i18n.t('show-requests.edit-reference-number-success-text'),
                    "type": "success",
                    "timeout": 5,
                });
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
                    "summary": i18n.t('create-request.error-changed-reference-number-title'),
                    "body": i18n.t('create-request.error-changed-reference-number-text'),
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } finally {
            this._('#edit-reference-number-btn').stop();
        }
    }

    async confirmEditSender() {
        const i18n = this._i18n;

        try {
            this._('#edit-sender-btn').start();
            let id = this.currentItem.identifier;
            let senderOrganizationName = this._('#tf-edit-sender-gn-dialog').value;
            let senderFullName = this._('#tf-edit-sender-fn-dialog').value;
            let senderPostalCode = this._('#tf-edit-sender-pc-dialog').value;
            let senderAddressLocality = this._('#tf-edit-sender-al-dialog').value;
            let senderStreetAddress = this._('#tf-edit-sender-sa-dialog').value;
            let senderBuildingNumber = (this._('#tf-edit-sender-bn-dialog') && this._('#tf-edit-sender-bn-dialog').value)
                ? this._('#tf-edit-sender-bn-dialog').value : '';

            let groupId = this.groupId;

            let e = this._('#edit-sender-country-select');
            let value = e.value;
            let text = e.options[e.selectedIndex].text;
            let senderAddressCountry = [value, text];

            let response = await this.sendEditDispatchRequest(id, senderOrganizationName, senderFullName, senderAddressCountry[0], senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber, groupId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                send({
                    "summary": i18n.t('show-requests.successfully-updated-sender-title'),
                    "body": i18n.t('show-requests.successfully-updated-sender-text'),
                    "type": "success",
                    "timeout": 5,
                });

                this.currentItem = responseBody;
                if (this.dispatchRequestsTable) {
                    this.getListOfRequests();
                }
            } else if (response.status === 403) {
                send({
                    "summary": i18n.t('create-request.error-requested-title'),
                    "body": i18n.t('error-not-permitted'),
                    "type": "danger",
                    "timeout": 5,
                });
            } else {
                // TODO error handling

                send({
                    "summary": 'Error!',
                    "body": 'Could not edit sender. Response code: ' + response.status,
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } finally {
            this._('#edit-sender-btn').stop();
        }
    }

    async confirmEditSubject() {
        let subject = this._('#tf-edit-subject-fn-dialog').value;
        let id = this.currentItem.identifier;
        await this.changeSubjectRequest(id, subject);
    }

    async confirmEditReferenceNumber() {
        let referenceNumber = this._('#tf-edit-reference-number-fn-dialog').value;
        let id = this.currentItem.identifier;
        await this.changeReferenceNumberRequest(id, referenceNumber);
    }

    async confirmAddSubject() {

        this._('#add-subject-confirm-btn').disabled = true;

        //TODO
        this.subject = this._('#tf-add-subject-fn-dialog').value ? this._('#tf-add-subject-fn-dialog').value : '';

        await this.processCreateDispatchRequest();

        this._('#tf-add-subject-fn-dialog').value = '';

        this.showDetailsView = true;
        this.hasSubject = true;

        this.hasSender = true;

        this._('#add-subject-confirm-btn').disabled = false;
    }

    async fetchDetailedRecipientInformation(identifier) {
        if (this.mayReadAddress) {
            let response = await this.getDispatchRecipient(identifier);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {

                this.currentRecipient = responseBody;

                this.currentRecipient.personIdentifier = responseBody['personIdentifier'] !== '' ? responseBody['personIdentifier'] : null;
                let birthDate = responseBody['birthDate'] && responseBody['birthDate'] !== '' ? this.convertToBirthDateTuple(responseBody['birthDate']) : '';

                if (birthDate !== '') {
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
                    this.currentRecipient.statusDescription = this.currentRecipient.statusChanges[0].description;
                    this.currentRecipient.statusType = this.currentRecipient.statusChanges[0].statusType;
                } else {
                    this.currentRecipient.statusDescription = null;
                    this.currentRecipient.statusType = null;
                }
                this.currentRecipient.deliveryEndDate = responseBody['deliveryEndDate'] ? responseBody['deliveryEndDate'] : '';
                this.currentRecipient.appDeliveryId = responseBody['appDeliveryID'] ? responseBody['appDeliveryID'] : '';
                this.currentRecipient.postalDeliverable = responseBody['postalDeliverable'] ? responseBody['postalDeliverable'] : '';
                this.currentRecipient.electronicallyDeliverable = responseBody['electronicallyDeliverable'] ? responseBody['electronicallyDeliverable'] : '';
                this.currentRecipient.lastStatusChange = responseBody['lastStatusChange'] ? responseBody['lastStatusChange'] : '';


                // this.currentRecipient.deliveryEndDate = responseBody['deliveryEndDate'] ? responseBody['deliveryEndDate'] : '';
            } else {
                // TODO error handling
            }
        }
    }

    async submitSelected() {
        const i18n = this._i18n;

        this._('#submit-all-btn').start();

        try {

            let selectedItems = this.dispatchRequestsTable.getSelectedRows();
            // console.log('selectedItems: ', selectedItems);

            let somethingWentWrong = false;

            for (let i = 0; i < selectedItems.length; i++) {
                let id = selectedItems[i].getData()['requestId'];
                let response = await this.getDispatchRequest(id);
                let result = await response.json();
                if (result.dateSubmitted) {
                    send({
                        "summary": i18n.t('show-requests.submit-not-allowed-title'),
                        "body": i18n.t('show-requests.submit-not-allowed-text'),
                        "type": "danger",
                        "timeout": 5,
                    });
                    somethingWentWrong = true;
                    break;
                }
                if (!this.checkCanSubmit(result)) {
                    somethingWentWrong = true;
                    break;
                }
            }

            if (somethingWentWrong) {
                return;
            }

            let dialogText = i18n.t('show-requests.submit-dialog-text', {count: this.dispatchRequestsTable.getSelectedRows().length});

            if (confirm(dialogText)) {
                for (let i = 0; i < selectedItems.length; i++) {
                    let id = selectedItems[i].getData()['requestId'];
                    let response = await this.getDispatchRequest(id);
                    let result = await response.json();

                    let submitResponse = await this.sendSubmitDispatchRequest(result.identifier);

                    if (submitResponse.status !== 201) {
                        somethingWentWrong = true;
                        break;
                    }
                }

                if (!somethingWentWrong) {
                    this.getListOfRequests();
                    send({
                        "summary": i18n.t('show-requests.successfully-submitted-title'),
                        "body": i18n.t('show-requests.successfully-submitted-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                    this.clearAll();
                } else {
                    // TODO error handling
                    send({
                        "summary": 'Error!',
                        "body": 'Could not submit request.',
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            }
        } finally {
            this._('#submit-all-btn').stop();
        }
    }

    async deleteSelected() {
        const i18n = this._i18n;

        this._('#delete-all-btn').start();

        try {

            let selectedItems = this.dispatchRequestsTable.getSelectedRows();
            // console.log('selectedItems: ', selectedItems);

            let somethingWentWrong = false;

            for (let i = 0; i < selectedItems.length; i++) {
                let id = selectedItems[i].getData()['requestId'];
                let response = await this.getDispatchRequest(id);
                let result = await response.json();
                if (result.dateSubmitted) {
                    send({
                        "summary": i18n.t('show-requests.delete-not-allowed-title'),
                        "body": i18n.t('show-requests.delete-not-allowed-text'),
                        "type": "danger",
                        "timeout": 5,
                    });
                    somethingWentWrong = true;
                    break;
                }
            }

            if (somethingWentWrong) {
                return;
            }

            let dialogText = i18n.t('show-requests.delete-dialog-text', {count: this.dispatchRequestsTable.getSelectedRows().length});

            if (confirm(dialogText)) {
                for (let i = 0; i < selectedItems.length; i++) {
                    let id = selectedItems[i].getData()['requestId'];
                    let response = await this.getDispatchRequest(id);
                    let result = await response.json();

                    let deleteResponse = await this.sendDeleteDispatchRequest(result.identifier);

                    if (deleteResponse.status !== 204) {
                        somethingWentWrong = true;
                        break;
                    }
                }

                if (!somethingWentWrong) {
                    this.getListOfRequests();
                    send({
                        "summary": i18n.t('show-requests.successfully-deleted-title'),
                        "body": i18n.t('show-requests.successfully-deleted-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                    this.clearAll();
                } else {
                    // TODO error handling
                    send({
                        "summary": 'Error!',
                        "body": 'Could not delete request.',
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            }
        } finally {
            this._('#delete-all-btn').stop();
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
                this._('#file-viewer').showPDF(binaryFile);
                MicroModal.show(this._('#file-viewer-modal'), {
                    disableScroll: true,
                    onClose: (modal) => {
                        this.loading = false;
                    },
                });

            } else {
                //TODO
            }
        } finally {
            button.stop();
        }
    }

    async processCreateDispatchRequest() {
        this._('#create-btn').start();

        const i18n = this._i18n;
        try {
            let response = await this.sendCreateDispatchRequest();
            let responseBody = await response.json();

            if (responseBody !== undefined && response.status === 201) {
                if (this.singleFileProcessing) {
                    send({
                        "summary": i18n.t('create-request.successfully-requested-title'),
                        "body": i18n.t('create-request.successfully-requested-text'),
                        "type": "success",
                        "timeout": 5,
                    });
                }
                this.currentItem = responseBody;
                this.requestCreated = true;
                // console.log(this.currentItem);

            } else if (response.status === 403) {
                if (this.singleFileProcessing) {
                    send({
                        "summary": i18n.t('create-request.error-requested-title'),
                        "body": i18n.t('error-not-permitted'),
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            } else {
                // TODO show error code specific notification
                if (this.singleFileProcessing) {
                    send({
                        "summary": i18n.t('create-request.error-requested-title'),
                        "body": i18n.t('create-request.error-requested-text'),
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            }
        } finally {
            // TODO
            this._('#create-btn').stop();
        }
    }

    expandAll(event) {
        this.dispatchRequestsTable.getRows('visible').forEach(row => {
            const item = row.getElement().lastChild;

            if (item.classList.contains('tabulator-responsive-collapse')) {
                item.style.display = 'block';
            }
            row.getElement().getElementsByClassName('tabulator-responsive-collapse-toggle')[0].classList.add('open');
        });

        const that = this;

        setTimeout(function () {
            that.dispatchRequestsTable.redraw();
        }, 0);

        this.expanded = true;
    }

    collapseAll(event) {
        this.dispatchRequestsTable.getRows('visible').forEach(row => {
            const item = row.getElement().lastChild;

            if (item.classList.contains('tabulator-responsive-collapse')) {
                item.style.display = 'none';
            }
            row.getElement().getElementsByClassName('tabulator-responsive-collapse-toggle')[0].classList.remove('open');
        });

        const that = this;

        setTimeout(function () {
            that.dispatchRequestsTable.redraw();
        }, 0);

        this.expanded = false;
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
        console.log('toggleCollapse');
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
        if (
            this.dispatchRequestsTable !== null &&
            this.dispatchRequestsTable.getSelectedRows().length > 0 ) {
            this.rowsSelected = true;
        } else {
            this.rowsSelected = false;
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
        const i18n = this._i18n;
        let output = '';
        if (!list) {
            return this.mayReadMetadata && !this.mayRead && !this.mayWrite ? i18n.t('show-requests.metadata-files-text') : i18n.t('show-requests.no-files-attached');
        }
        list.forEach((file) => {
            output += file.name + "<br>";
        });
        if (output !== '') {
            return output;
        } else {
            return this.mayReadMetadata && !this.mayRead && !this.mayWrite ? i18n.t('show-requests.metadata-files-text') : i18n.t('show-requests.no-files-attached');
        }
    }

    createFormattedRecipientsList(list) {
        const i18n = this._i18n;
        let output = '';
        list.forEach((recipient) => {
            output += recipient.familyName + ", " + recipient.givenName + "<br>";
        });
        if (output !== '') {
            return output;
        } else {
            return i18n.t('show-requests.no-recipients-added');
        }
    }

    setControlsHtml(item) {
        let div = this.createScopedElement('div');
        div.classList.add('tabulator-icon-buttons');

        if (item.dateSubmitted || !this.mayWrite) {
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

        list.forEach((item) => {
            // let span = this.createScopedElement('span');
            // span.classList.add('muted');
            // span.textContent = this.mayReadMetadata && !this.mayRead && !this.mayWrite ?
            //     i18n.t('show-requests.metadata-subject-text') : i18n.t('show-requests.no-subject-found');

            let recipientStatus = this.checkRecipientStatus(item.recipients);

            // let tooltip = this.createScopedElement('dbp-tooltip');
            // tooltip.classList.add('info-tooltip');
            // tooltip.setAttribute('icon-name', 'info-icon');
            // tooltip.setAttribute('text-content', recipientStatus[0]);
            // tooltip.setAttribute('interactive');
            // let spanStatus = this.createScopedElement('span');
            // spanStatus.textContent = recipientStatus[1];
            // spanStatus.appendChild(tooltip);

            let content = {
                requestId: item.identifier,
                subject: item.name && item.name !== '' ? item.name : this.mayReadMetadata && !this.mayRead && !this.mayWrite ?
                    i18n.t('show-requests.metadata-subject-text') : i18n.t('show-requests.no-subject-found'), //span
                status: item.dateSubmitted ? recipientStatus[1] : i18n.t('show-requests.empty-date-submitted'),
                gz: item.referenceNumber ? item.referenceNumber : i18n.t('show-requests.empty-reference-number'),
                dateCreated: item.dateCreated,
                details: "Details",
                files: this.createFormattedFilesList(item.files),
                recipients: this.createFormattedRecipientsList(item.recipients),
                dateSubmitted: item.dateSubmitted ? this.convertToReadableDate(item.dateSubmitted) : i18n.t('show-requests.date-submitted-not-submitted'),
                controls: this.setControlsHtml(item),
            };
            tableObject.push(content);
        });

        return tableObject;
    }

    /**
     * Get a list of all requests
     * @returns {Array} list
     */
    async getListOfRequests() {
        const i18n = this._i18n;
        this.initialRequestsLoading = !this._initialFetchDone;
        try {
            let response = await this.getListOfDispatchRequests(this.groupId);
            let responseBody = await response.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.requestList = this.parseListOfRequests(responseBody);
                let tableObject = this.createTableObject(this.requestList);
                this.dispatchRequestsTable.setData(tableObject);
                this.dispatchRequestsTable.setLocale(this.lang);
                this.totalNumberOfItems = this.dispatchRequestsTable.getDataCount("active");
            } else { //TODO error handling
                if (responseBody.status === 500) {
                    send({
                        "summary": 'Error!',
                        "body": 'Could not fetch dispatch requests. Response code: 500',
                        "type": "danger",
                        "timeout": 5,
                    });
                }  else if (response.status === 403) {
                    send({
                        "summary": i18n.t('create-request.error-requested-title'),
                        "body": i18n.t('error-not-permitted'),
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            }
        } finally {
            this.initialRequestsLoading = false;
            this._initialFetchDone = true;
        }
    }

    async getCreatedRequests() {
        if (this.createdRequestsList.length > 0) {
            this.requestList = this.parseListOfRequests(this.createdRequestsList);
            let tableObject = this.createTableObject(this.requestList);
            this.dispatchRequestsTable.setData(tableObject);
            this.dispatchRequestsTable.setLocale(this.lang);
            this.totalNumberOfItems = this.dispatchRequestsTable.getDataCount("active");
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
            day: date
        };
        return dateTuple;
    }

    async processSelectedRecipient(event) {
        this.currentRecipient = {};
        const person = JSON.parse(event.target.dataset.object);

        this.currentRecipient.personIdentifier = person['@id'];

        const elements = this.shadowRoot.querySelectorAll('.nf-label.no-selector');
        elements.forEach((element) => { element.classList.add('muted'); });

        this.requestUpdate();
    }

    async processSelectedSender(event) {
        this.storeGroupValue(event.detail.value);
        const i18n = this._i18n;
        this.organizationLoaded = true;

        if (event.target.valueObject.accessRights) {
            this.mayReadAddress = event.target.valueObject.accessRights.includes('wra');
            this.mayReadMetadata = event.target.valueObject.accessRights.includes('rm');

            let mayWrite = event.target.valueObject.accessRights.includes('w');
            if (!mayWrite && !this.requestCreated) {
                this.mayRead = event.target.valueObject.accessRights.includes('rc');
                this.mayWrite = mayWrite;
            } else if (!mayWrite && this.requestCreated) {
                if (Object.keys(this.tempItem).length !== 0) {
                    this.currentItem = this.tempItem;
                    // console.log('case 2 current: ', this.currentItem);
                    this.tempChange = true;
                    this._('#create-resource-select').value = this.tempValue;

                    send({
                        "summary": i18n.t('create-request.create-not-allowed-title'),
                        "body": i18n.t('create-request.create-not-allowed-text'),
                        "type": "danger",
                        "timeout": 5,
                    });
                }
                this.mayRead = event.target.valueObject.accessRights.includes('rc');
                this.mayWrite = mayWrite;
                return;
            } else if (mayWrite && this.requestCreated && !this.tempChange) {
                // console.log('case3 curr', this.currentItem);
                let senderFullName = event.target.valueObject.identifier;

                if (senderFullName === this.currentItem.senderFullName) {
                    return;
                }

                let senderOrganizationName = event.target.valueObject.name;
                let senderAddressCountry = event.target.valueObject.country;
                let senderStreetAddress = event.target.valueObject.street;
                let senderAddressLocality = event.target.valueObject.locality;
                let senderPostalCode = event.target.valueObject.postalCode;
                let groupId = event.target.valueObject.identifier;
                let mayRead = event.target.valueObject.accessRights.includes('rc');

                let response = await this.sendEditDispatchRequest(this.currentItem.identifier, senderOrganizationName, senderFullName,
                    senderAddressCountry, senderPostalCode, senderAddressLocality, senderStreetAddress, groupId);

                let responseBody = await response.json();
                if (responseBody !== undefined && response.status === 200) {
                    send({
                        "summary": i18n.t('show-requests.successfully-updated-sender-title'),
                        "body": i18n.t('show-requests.successfully-updated-sender-text'),
                        "type": "success",
                        "timeout": 5,
                    });

                    this.currentItem = responseBody;
                    // console.log(event.target.valueObject);
                    this.currentItem.senderFullName = senderFullName;
                    this.currentItem.senderOrganizationName = senderOrganizationName;
                    this.currentItem.senderAddressCountry = senderAddressCountry;
                    this.currentItem.senderStreetAddress = senderStreetAddress;
                    this.currentItem.senderAddressLocality = senderAddressLocality;
                    this.currentItem.senderPostalCode = senderPostalCode;

                    this.groupId = groupId;

                    this.mayRead = mayRead;
                    this.mayWrite = mayWrite;

                    this.tempItem = this.currentItem;
                    this.tempValue = this._('#create-resource-select').value;

                } else if (response.status === 403) {
                    send({
                        "summary": i18n.t('create-request.error-requested-title'),
                        "body": i18n.t('error-not-permitted'),
                        "type": "danger",
                        "timeout": 5,
                    });
                } else {
                    // TODO error handling
                    send({
                        "summary": 'Error!',
                        "body": 'Could not edit sender. Response code: ' + response.status,
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            } else {
                // console.log(event.target.valueObject);
                this.currentItem.senderFullName = event.target.valueObject.identifier;
                this.currentItem.senderOrganizationName = event.target.valueObject.name;
                this.currentItem.senderAddressCountry = event.target.valueObject.country;
                this.currentItem.senderStreetAddress = event.target.valueObject.street;
                this.currentItem.senderAddressLocality = event.target.valueObject.locality;
                this.currentItem.senderPostalCode = event.target.valueObject.postalCode;

                this.groupId = event.target.valueObject.identifier;
                this.mayRead = event.target.valueObject.accessRights.includes('rc');
                this.mayWrite = event.target.valueObject.accessRights.includes('w');

                this.tempItem = this.currentItem;
                this.tempValue = this._('#create-resource-select').value;
            }
        }

        this.tempChange = false;
    }

    async preloadSelectedRecipient() {
        this.currentRecipient = {};

        if (this._('#recipient-selector') && this._('#recipient-selector').getAttribute('data-object') !== null && this._('#recipient-selector').getAttribute('data-object') !== '') {
            console.log(this._('#recipient-selector').getAttribute('data-object'));
            const person = JSON.parse(this._('#recipient-selector').getAttribute('data-object'));
            const personId = person['@id'];

            // let value = this._('#recipient-selector').getAttribute('data-object');
            // console.log('selector', this._('#recipient-selector'));
            // console.log('value: ', value);
            // console.log('persId', personId);

            let response = await this.sendGetPersonDetailsRequest(personId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {

                // console.log(responseBody);
                this.currentRecipient.familyName = responseBody.familyName;
                this.currentRecipient.givenName = responseBody.givenName;
                let birthDate = responseBody.birthDate ? responseBody.birthDate : '';
                this.currentRecipient.birthDateDay = birthDate.day ? birthDate.day : '';
                this.currentRecipient.birthDateMonth = birthDate.month ? birthDate.month : '';
                this.currentRecipient.birthDateYear = birthDate.year ? birthDate.year : '';

                if (responseBody['localData'] !== null) {
                    this.currentRecipient.addressLocality = responseBody['localData']['addressLocality'] ? responseBody['localData']['addressLocality'] : '';
                    this.currentRecipient.postalCode = responseBody['localData']['postalCode'] ? responseBody['localData']['postalCode'] : '';
                    this.currentRecipient.streetAddress = responseBody['localData']['streetAddress'] ? responseBody['localData']['streetAddress'] : '';
                    this.currentRecipient.addressCountry = responseBody['localData']['addressCountry'] ? dispatchHelper.getCountryMapping(responseBody['localData']['addressCountry']) : dispatchHelper.getCountryMapping('AT');
                }
            } else {
                // TODO error handling
            }
            console.log('rec', this.currentRecipient);
            this.requestUpdate();
        }
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

    resetPersonSelect(event) {
        this._('#recipient-selector').clear();
        this.currentRecipient = {};
        const elements = this.shadowRoot.querySelectorAll('.nf-label.no-selector');
        elements.forEach((element) => {
            element.classList.remove('muted');
        });
    }

    clearAll() {
        this.currentItem = {};

        this.currentItem.senderOrganizationName = "";
        this.currentItem.senderFullName = "";
        this.currentItem.senderAddressCountry = "";
        this.currentItem.senderPostalCode = "";
        this.currentItem.senderAddressLocality = "";
        this.currentItem.senderStreetAddress = "";
        this.currentItem.senderBuildingNumber = "";

        this.currentItem.files = [];
        this.currentItem.recipients = [];

        this.currentRecipient = {};

        this.subject = '';

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
                  @dbp-file-source-file-upload-finished="${this.onFileUploadFinished}">
             </dbp-file-source>
            
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
        `;
    }

    checkValidity(input) {
        const isValid = input.reportValidity();
        input.setAttribute('aria-invalid', !isValid);
        return isValid;
    }

    addEditSenderModal() {
        const i18n = this._i18n;

        return html`
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
                                            required
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-fn-dialog"
                                            id="tf-edit-sender-fn-dialog"
                                            value="${this.currentItem && this.currentItem.senderFullName}"
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
                                            required
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-gn-dialog"
                                            id="tf-edit-sender-gn-dialog"
                                            value="${this.currentItem && this.currentItem.senderOrganizationName}"
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
                                            required
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-sa-dialog"
                                            id="tf-edit-sender-sa-dialog"
                                            value="${this.currentItem && this.currentItem.senderStreetAddress}"
                                            @input="${() => {
                                                // TODO
                                            }}"
                                    />
                                </div>
                            </div>
                            ${this.currentItem && this.currentItem.senderBuildingNumber ? html`
                                <div class="modal-content-item">
                                    <div class="nf-label">
                                        ${i18n.t('show-requests.edit-sender-bn-dialog-label')}
                                    </div>
                                    <div>
                                        <input
                                                type="text"
                                                class="input"
                                                maxlength="10"
                                                name="tf-edit-sender-bn-dialog"
                                                id="tf-edit-sender-bn-dialog"
                                                value="${this.currentItem && this.currentItem.senderBuildingNumber}"
                                                @input="${() => {
                                                    // TODO
                                                }}"
                                        />
                                    </div>
                                </div>
                            ` : ``}
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-sender-pc-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
                                            type="number"
                                            class="input"
                                            name="tf-edit-sender-pc-dialog"
                                            id="tf-edit-sender-pc-dialog"
                                            value="${this.currentItem && this.currentItem.senderPostalCode}"
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
                                            required
                                            type="text"
                                            class="input"
                                            name="tf-edit-sender-al-dialog"
                                            id="tf-edit-sender-al-dialog"
                                            value="${this.currentItem && this.currentItem.senderAddressLocality}"
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
                                    <select required id="edit-sender-country-select" class="country-select">
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
                                            MicroModal.close(this._('#edit-sender-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-sender-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-sender-confirm-btn"
                                        @click="${() => {
                                            let validpc = this.checkValidity(this._('#edit-sender-country-select'));
                                            let validbn = this.checkValidity(this._('#tf-edit-sender-al-dialog'));
                                            let validsa = this.checkValidity(this._('#tf-edit-sender-pc-dialog'));
                                            let validbirthday = this.checkValidity(this._('#tf-edit-sender-sa-dialog'));
                                            let validfn = this.checkValidity(this._('#tf-edit-sender-gn-dialog'));
                                            let validgn = this.checkValidity(this._('#tf-edit-sender-fn-dialog'));
                                
                                            if (validgn && validfn && validpc && validsa && validbn && validbirthday) {
                                                this.confirmEditSender().then(r => {
                                                    MicroModal.close(this._('#edit-sender-modal'));
                                                });
                                            }
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

    addAddRecipientModal() {
        const i18n = this._i18n;

        return html`
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
                                        this._('#add-recipient-btn').stop();
                                        MicroModal.close(this._('#add-recipient-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="add-recipient-modal-content">
                            <div class="modal-content-container">
                                <div class="modal-content-left">
                                    <div class="modal-content-item">
                                        <div class="nf-label selector">
                                            <h4>${i18n.t('show-requests.add-recipient-person-select-label')}</h4>
                                        </div>
                                        <div>
                                            <div class="control">
                                                <dbp-person-select
                                                        id="recipient-selector"
                                                        subscribe="auth"
                                                        lang="${this.lang}"
                                                        entry-point-url="${this.entryPointUrl}"
                                                        show-reload-button
                                                        @change="${(event) => {this.processSelectedRecipient(event);}}"
                                                ></dbp-person-select>
                                            </div>
                                            <button
                                                    class="button ${classMap({ hidden: this._('#recipient-selector') && this._('#recipient-selector').value === '' })}"
                                                    @click="${(event) => {this.resetPersonSelect(event);}}"
                                            >${i18n.t('show-requests.reset-select-button-text')}</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-content-right">
                                    <div>
                                        <h4 class="${classMap({ muted: this.currentRecipient && this.currentRecipient.personIdentifier})}">${i18n.t('show-requests.add-recipient-or-text')}</h4>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-gn-dialog-label')}
                                        </div>
                                        <div>
                                            <input
                                                    ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                    type="text"
                                                    class="input"
                                                    name="tf-add-recipient-gn-dialog"
                                                    id="tf-add-recipient-gn-dialog"
                                                    value="${this.currentRecipient ? this.currentRecipient.givenName : ``}"
                                                    @input="${() => {
                                                        // TODO
                                                    }}"
                                            />
                                        </div>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-fn-dialog-label')}
                                        </div>
                                        <div>
                                            <input
                                                    ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                    type="text"
                                                    class="input"
                                                    name="tf-add-recipient-fn-dialog"
                                                    id="tf-add-recipient-fn-dialog"
                                                    value="${this.currentRecipient ? this.currentRecipient.familyName : ``}"
                                                    @input="${() => {
                                                        // TODO
                                                    }}"
                                            />
                                        </div>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}
                                        </div>
                                        <div class="birthdate-input">
                                            <input
                                                ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                type="number"
                                                class="input"
                                                id="tf-add-recipient-birthdate-day"
                                                min="1" max="31"
                                                lang="${this.lang}"
                                                placeholder="${i18n.t('show-requests.add-recipient-birthdate-dialog-placeholder-day')}"
                                                value="${this.currentRecipient ? this.currentRecipient.birthDateDay : ``}"
                                            />
                                            <input
                                                ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                type="number"
                                                class="input"
                                                id="tf-add-recipient-birthdate-month"
                                                min="1" max="12"
                                                lang="${this.lang}"
                                                placeholder="${i18n.t('show-requests.add-recipient-birthdate-dialog-placeholder-month')}"
                                                value="${this.currentRecipient ? this.currentRecipient.birthDateMonth : ``}"
                                            />
                                            <input
                                                ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                type="number"
                                                class="input"
                                                id="tf-add-recipient-birthdate-year"
                                                min="1800" max="2300"
                                                lang="${this.lang}"
                                                placeholder="${i18n.t('show-requests.add-recipient-birthdate-dialog-placeholder-year')}"
                                                value="${this.currentRecipient ? this.currentRecipient.birthDateYear : ``}"
                                            />
                                        </div>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-sa-dialog-label')}
                                        </div>
                                        <div>
                                            <input
                                                    ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                    type="text"
                                                    class="input"
                                                    name="tf-add-recipient-sa-dialog"
                                                    id="tf-add-recipient-sa-dialog"
                                                    value="${this.currentRecipient ? this.currentRecipient.streetAddress : ``}"
                                                    @input="${() => {
                                                        // TODO
                                                    }}"
                                            />
                                        </div>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-pc-dialog-label')}
                                        </div>
                                        <div>
                                            <input
                                                    ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                    type="number"
                                                    class="input"
                                                    name="tf-add-recipient-pc-dialog"
                                                    id="tf-add-recipient-pc-dialog"
                                                    value="${this.currentRecipient ? this.currentRecipient.postalCode : ``}"
                                                    @input="${() => {
                                                        // TODO
                                                    }}"
                                            />
                                        </div>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-al-dialog-label')}
                                        </div>
                                        <div>
                                            <input
                                                    ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                    type="text"
                                                    class="input"
                                                    name="tf-add-recipient-al-dialog"
                                                    id="tf-add-recipient-al-dialog"
                                                    value="${this.currentRecipient ? this.currentRecipient.addressLocality : ``}"
                                                    @input="${() => {
                                                        // TODO
                                                    }}"
                                            />
                                        </div>
                                    </div>
                                    <div class="modal-content-item">
                                        <div class="nf-label no-selector">
                                            ${i18n.t('show-requests.add-recipient-ac-dialog-label')}
                                        </div>
                                        <div>
                                            <select
                                                    ?disabled="${this.currentRecipient && this.currentRecipient.personIdentifier}"
                                                    id="add-recipient-country-select" 
                                                    class="country-select">
                                                ${dispatchHelper.getCountryList()}
                                            </select>
                                        </div>
                                    </div>
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
                                        @click="${(event) => {
                                            let button = event.target;
                                            button.disabled = true;
                                            
                                            let validcountry = this.checkValidity(this._('#add-recipient-country-select'));
                                            let validal = this.checkValidity(this._('#tf-add-recipient-al-dialog'));
                                            let validpc = this.checkValidity(this._('#tf-add-recipient-pc-dialog'));
                                            let validsa = this.checkValidity(this._('#tf-add-recipient-sa-dialog'));
                                            let validbirthday = this.checkValidity(this._('#tf-add-recipient-birthdate-day'));
                                            let validbirthmonth = this.checkValidity(this._('#tf-add-recipient-birthdate-month'));
                                            let validbirthyear = this.checkValidity(this._('#tf-add-recipient-birthdate-year'));
                                            let validfn = this.checkValidity(this._('#tf-add-recipient-fn-dialog'));
                                            let validgn = this.checkValidity(this._('#tf-add-recipient-gn-dialog'));

                                            if (validgn && validfn && validcountry && validpc && validal && validsa && validbirthday && validbirthmonth && validbirthyear) {
                                                this.currentRecipient.givenName = this._('#tf-add-recipient-gn-dialog').value;
                                                this.currentRecipient.familyName = this._('#tf-add-recipient-fn-dialog').value;
                                                this.currentRecipient.addressCountry = this._('#add-recipient-country-select').value;
                                                this.currentRecipient.postalCode = this._('#tf-add-recipient-pc-dialog').value;
                                                this.currentRecipient.addressLocality = this._('#tf-add-recipient-al-dialog').value;
                                                this.currentRecipient.streetAddress = this._('#tf-add-recipient-sa-dialog').value;
                                                this.currentRecipient.birthDateDay = this._('#tf-add-recipient-birthdate-day').value;
                                                this.currentRecipient.birthDateMonth = this._('#tf-add-recipient-birthdate-month').value;
                                                this.currentRecipient.birthDateYear = this._('#tf-add-recipient-birthdate-year').value;

                                                this.addRecipientToRequest(button).then(r => {
                                                    button.disabled = false;
                                                    MicroModal.close(this._('#add-recipient-modal'));
                                                    this._('#recipient-selector').value = "";

                                                    const elements = this.shadowRoot.querySelectorAll('.nf-label.no-selector');
                                                    elements.forEach((element) => {
                                                        element.classList.remove('muted');
                                                    });
                                                });
                                            } else {
                                                button.disabled = false;
                                            }
                                        }}">
                                    ${i18n.t('show-requests.add-recipient-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }

    addEditRecipientModal() {
        const i18n = this._i18n;

        return html`
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
                                        let button = this.button;
                                        button.stop();
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
                                    ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}
                                </div>
                                 <div class="birthdate-input">
                                            <input
                                                type="number"
                                                class="input"
                                                id="tf-edit-recipient-birthdate-day"
                                                min="1" max="31"
                                                lang="${this.lang}"
                                                placeholder="${i18n.t('show-requests.add-recipient-birthdate-dialog-placeholder-day')}"
                                                value="${this.currentRecipient ? this.currentRecipient.birthDateDay : ``}"
                                            />
                                            <input
                                                type="number"
                                                class="input"
                                                id="tf-edit-recipient-birthdate-month"
                                                min="1" max="12"
                                                lang="${this.lang}"
                                                placeholder="${i18n.t('show-requests.add-recipient-birthdate-dialog-placeholder-month')}"
                                                value="${this.currentRecipient ? this.currentRecipient.birthDateMonth : ``}"
                                            />
                                            <input
                                                type="number"
                                                class="input"
                                                id="tf-edit-recipient-birthdate-year"
                                                min="1800" max="2300"
                                                lang="${this.lang}"
                                                placeholder="${i18n.t('show-requests.add-recipient-birthdate-dialog-placeholder-year')}"
                                                value="${this.currentRecipient ? this.currentRecipient.birthDateYear : ``}"
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
                                    ${i18n.t('show-requests.edit-recipient-pc-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="number"
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
                                    ${i18n.t('show-requests.edit-recipient-ac-dialog-label')}
                                </div>
                                <div>
                                    <div>
                                        <select 
                                                id="edit-recipient-country-select" 
                                                class="country-select">
                                            ${dispatchHelper.getCountryList()}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn">
                                <button
                                        class="button"
                                        aria-label="Close this dialog window"
                                        @click="${() => {
                                            let button = this.button;
                                            button.stop();
                                            MicroModal.close(this._('#edit-recipient-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-recipient-confirm-btn"
                                        @click="${() => {
                                            let button = this.button;
                                            
                                            let validcountry = this.checkValidity(this._('#edit-recipient-country-select'));
                                            let validal = this.checkValidity(this._('#tf-edit-recipient-al-dialog'));
                                            let validpc = this.checkValidity(this._('#tf-edit-recipient-pc-dialog'));
                                            let validsa = this.checkValidity(this._('#tf-edit-recipient-sa-dialog'));
                                            let validbirthday = this.checkValidity(this._('#tf-edit-recipient-birthdate-day'));
                                            let validbirthmonth = this.checkValidity(this._('#tf-edit-recipient-birthdate-month'));
                                            let validbirthyear = this.checkValidity(this._('#tf-edit-recipient-birthdate-year'));
                                            let validfn = this.checkValidity(this._('#tf-edit-recipient-fn-dialog'));
                                            let validgn = this.checkValidity(this._('#tf-edit-recipient-gn-dialog'));
                                            
                                            if (validgn && validfn && validcountry && validpc && validal && validsa && validbirthday && validbirthmonth && validbirthyear) {
                                                this.currentRecipient.givenName = this._('#tf-edit-recipient-gn-dialog').value;
                                                this.currentRecipient.familyName = this._('#tf-edit-recipient-fn-dialog').value;
                                                this.currentRecipient.addressCountry = this._('#edit-recipient-country-select').value;
                                                this.currentRecipient.postalCode = this._('#tf-edit-recipient-pc-dialog').value;
                                                this.currentRecipient.addressLocality = this._('#tf-edit-recipient-al-dialog').value;
                                                this.currentRecipient.streetAddress = this._('#tf-edit-recipient-sa-dialog').value;
                                                this.currentRecipient.birthDateDay = this._('#tf-edit-recipient-birthdate-day').value;
                                                this.currentRecipient.birthDateMonth = this._('#tf-edit-recipient-birthdate-month').value;
                                                this.currentRecipient.birthDateYear = this._('#tf-edit-recipient-birthdate-year').value;

                                                this.updateRecipient(button);
                                                MicroModal.close(this._('#edit-recipient-modal'));
                                            } else {
                                                button.stop();
                                            }
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

    addShowRecipientModal() {
        const i18n = this._i18n;

        return html`
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
                                    ${i18n.t('show-requests.edit-recipient-gn-dialog-label')}:
                                </div>
                                <div class="element-right first">
                                    ${this.currentRecipient && this.currentRecipient.givenName ? this.currentRecipient.givenName : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-fn-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.familyName ? this.currentRecipient.familyName : ``}
                                </div>
                                
                                ${this.currentRecipient && this.currentRecipient.birthDateDay && this.currentRecipient.birthDateMonth 
                                && this.currentRecipient.birthDateYear && this.currentRecipient.birthDateDay !== ''
                                && this.currentRecipient.birthDateMonth !== '' && this.currentRecipient.birthDateYear !== '' ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient.birthDateYear + '-' + this.currentRecipient.birthDateMonth + '-' + this.currentRecipient.birthDateDay}
                                    </div>
                                ` : ``}
                                ${this.currentRecipient && this.currentRecipient.streetAddress ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.edit-recipient-sa-dialog-label')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient.streetAddress}
                                    </div>
                                ` : ``}
                                ${this.currentRecipient && this.currentRecipient.postalCode ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.edit-recipient-pc-dialog-label')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient.postalCode}
                                    </div>
                                ` : ``}
                                ${this.currentRecipient && this.currentRecipient.addressLocality ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.edit-recipient-al-dialog-label')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient.addressLocality}
                                    </div>
                                ` : ``}
                                ${this.currentRecipient && this.currentRecipient.addressCountry ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.edit-recipient-ac-dialog-label')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient.addressCountry}
                                    </div>
                                ` : ``}
                                <div class="element-left">
                                    ${i18n.t('show-requests.delivery-service-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient.electronicallyDeliverable ? i18n.t('show-requests.electronically-deliverable') :
                                            (this.currentRecipient.postalDeliverable ? i18n.t('show-requests.only-postal-deliverable') : 
                                                    i18n.t('show-requests.not-deliverable-1') + '. ' + i18n.t('show-requests.not-deliverable-2'))}
                                </div>
                                ${this.currentRecipient && this.currentRecipient.deliveryEndDate ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.delivery-end-date')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.convertToReadableDate(this.currentRecipient.deliveryEndDate)}
                                    </div>
                                ` : ``}
                                <div class="element-left">
                                    ${i18n.t('show-requests.recipient-id')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.identifier ? this.currentRecipient.identifier : ``}
                                </div>
                                ${this.currentRecipient && this.currentRecipient.appDeliveryId ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.app-delivery-id')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient && this.currentRecipient.appDeliveryId ? this.currentRecipient.appDeliveryId : ``}
                                    </div>
                                ` : ``}
                            </div>
                            ${this.currentRecipient && this.currentRecipient.statusChanges && this.currentRecipient.statusChanges.length > 0 ? html`
                            <h3>${i18n.t('show-requests.delivery-status-changes')}:</h3>
                            <div class="scroll">
                                ${this.currentRecipient.statusChanges.map(statusChange => html`
                                    <div class="recipient-status">
                                        <div>
                                            <div>${this.convertToReadableDate(statusChange.dateCreated)} </div>
                                            <div class="status-detail new-line-content">${statusChange.description} (StatusType ${statusChange.statusType})</div>
                                        </div>
                                        <div class="download-btn">
                                            ${statusChange.fileFormat ? html`
                                                <dbp-icon-button class="download-btn"
                                                                 @click="${(event) => {
                                                                        this._onDownloadFileClicked(event, statusChange['@id']);
                                                                    }}"
                                                                 title="${i18n.t('show-requests.download-button-text')}"
                                                                 icon-name="download"></dbp-icon-button>
                                            ` : ``}
                                        </div>
                                    </div>
                                `)}
                            </div>` : ``}
                        </main>
                        <footer class="modal-footer">
                            <div class="modal-footer-btn">
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }

    addEditSubjectModal() {
        const i18n = this._i18n;

        return html`
            <div class="modal micromodal-slide" id="edit-subject-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div
                            class="modal-container"
                            id="edit-subject-modal-box"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-subject-modal-title">
                        <header class="modal-header">
                            <h3 id="edit-subject-modal-title">
                                ${i18n.t('show-requests.edit-subject-modal-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#edit-subject-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="edit-subject-modal-content">
                            <div class="modal-content-item">
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-subject-fn-dialog"
                                            id="tf-edit-subject-fn-dialog"
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
                                            MicroModal.close(this._('#edit-subject-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-subject-confirm-btn"
                                        @click="${() => {
                                            // this._('#edit-subject-confirm-btn').start();
                                            this.confirmEditSubject().then(r => {
                                                MicroModal.close(this._('#edit-subject-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.edit-subject-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }

    addEditReferenceNumberModal() {
        const i18n = this._i18n;

        return html`
            <div class="modal micromodal-slide" id="edit-reference-number-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div
                            class="modal-container"
                            id="edit-reference-number-modal-box"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-reference-number-modal-title">
                        <header class="modal-header">
                            <h3 id="edit-reference-number-modal-title">
                                ${i18n.t('show-requests.reference-number-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#edit-reference-number-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="edit-reference-number-modal-content">
                            <div class="modal-content-item">
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            name="tf-edit-reference-number-fn-dialog"
                                            id="tf-edit-reference-number-fn-dialog"
                                            value="${this.currentItem.referenceNumber ? this.currentItem.referenceNumber : ``}"
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
                                            MicroModal.close(this._('#edit-reference-number-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-reference-number-confirm-btn"
                                        @click="${() => {
                                            this.confirmEditReferenceNumber().then(r => {
                                                MicroModal.close(this._('#edit-reference-number-modal'));
                                            });
                                        }}">
                                    ${i18n.t('show-requests.edit-reference-number-dialog-button-ok')}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        `;
    }

    addFileViewerModal() {
        const i18n = this._i18n;

        return html`
            <div class="modal micromodal-slide" id="file-viewer-modal" aria-hidden="true">
                <div class="modal-overlay" tabindex="-2" data-micromodal-close>
                    <div class="modal-container"
                            id="file-viewer-modal-box"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="file-viewer-modal-title">
                        <header class="modal-header">
                            <h3 id="file-viewer-modal-title">
                                ${i18n.t('show-requests.file-viewer-dialog-title')}
                            </h3>
                            <button
                                    title="${i18n.t('show-requests.modal-close')}"
                                    class="modal-close"
                                    aria-label="Close modal"
                                    @click="${() => {
                                        MicroModal.close(this._('#file-viewer-modal'));
                                    }}">
                                <dbp-icon
                                        title="${i18n.t('show-requests.modal-close')}"
                                        name="close"
                                        class="close-icon"></dbp-icon>
                            </button>
                        </header>
                        <main class="modal-content" id="file-viewer-modal-content">
                            <!-- TODO: auto-resize="contain"-->
                            <dbp-pdf-viewer lang="${this.lang}" auto-resize="cover" id="file-viewer"></dbp-pdf-viewer>
                        </main>
                    </div>
                </div>
            </div>
        `;
    }

    addDetailedFilesView() {
        const i18n = this._i18n;

        return html`
            <div class="details files">
                <div class="header-btn">
                    <div class="section-titles">${i18n.t('show-requests.files')} <span class="section-title-counts">
                            ${this.currentItem.files && this.currentItem.files.length !== 0 ? `(` + this.currentItem.files.length + `)` : ``}</span>
                    </div>
                    ${!this.currentItem.dateSubmitted ? html`
                         <dbp-loading-button id="add-files-btn"
                                        ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                        value="${i18n.t('show-requests.add-files-button-text')}" 
                                        @click="${(event) => {
                                            this.requestCreated = true;
                                            this.openFileSource();
                                        }}" 
                                        title="${i18n.t('show-requests.add-files-button-text')}"
                                        >${i18n.t('show-requests.add-files-button-text')}
                         </dbp-loading-button>` : `` }
                </div>
                <div class="files-data">
                    ${this.currentItem.files ? this.currentItem.files.map(file => html`
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
                                                    console.log( this._('#file-viewer'));
                                                    this._onShowFileClicked(event, file.identifier);
                                                }}"
                                                 title="${i18n.t('show-requests.show-file-button-text')}"
                                                 icon-name="keyword-research"></dbp-icon-button>
                                ${!this.currentItem.dateSubmitted ? html`
                                    <dbp-icon-button id="delete-file-btn"
                                                ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                                @click="${(event) => {
                                                    this.deleteFile(event, file);
                                                }}"
                                                title="${i18n.t('show-requests.delete-file-button-text')}" 
                                                icon-name="trash"></dbp-icon-button>` : ``
}
                            </div>
                        </div>
                    `) : ``}
                    <div class="no-files ${classMap({hidden: !this.isLoggedIn() || this.currentItem.files && this.currentItem.files.length !== 0})}">${this.mayReadMetadata && !this.mayRead && !this.mayWrite ? i18n.t('show-requests.metadata-files-text') : i18n.t('show-requests.empty-files-text')}</div>
                </div>
            </div>
        `;
    }

    addSubHeader() {
        const i18n = this._i18n;

        return html`
            <div class="details header sub">
                <div>
                    <div class="section-titles">${i18n.t('show-requests.date-created')}</div>
                    <div>${this.convertToReadableDate(this.currentItem.dateCreated)}</div>
                </div>
                <div class="line"></div>
                <div>
                    <div class="section-titles">${i18n.t('show-requests.modified-from')}</div>
                    <div>${this.lastModifiedName ? this.lastModifiedName : this.currentItem.personIdentifier}</div>
                </div>
                <div class="line"></div>
                <div>
                    <div class="section-titles">${i18n.t('show-requests.table-header-id')}</div>
                    <div>${this.currentItem.identifier}</div>
                </div>
            </div>
        `;
    }

    addSenderDetails() {
        const i18n = this._i18n;

        return html`
            <div class="details sender hidden">
                <div class="header-btn">
                    <div class="section-titles">${i18n.t('show-requests.sender')}</div>
                    ${!this.currentItem.dateSubmitted ? html`
                        <dbp-icon-button id="edit-sender-btn"
                                    ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                    @click="${(event) => {
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
                    ${this.currentItem.senderOrganizationName ? html`${this.currentItem.senderOrganizationName}` : ``}
                    ${this.currentItem.senderFullName && this.currentItem.senderOrganizationName
                        ? html` ${this.currentItem.senderFullName}` :
                        html`${this.currentItem.senderFullName ? html`${this.currentItem.senderFullName}` : ``}
                    `}
                    ${this.currentItem.senderStreetAddress ? html`<br>${this.currentItem.senderStreetAddress}` : ``}
                    ${this.currentItem.senderBuildingNumber ? html` ${this.currentItem.senderBuildingNumber}` : ``}
                    ${this.currentItem.senderPostalCode ? html`<br>${this.currentItem.senderPostalCode}` : ``}
                    ${this.currentItem.senderAddressLocality ? html` ${this.currentItem.senderAddressLocality}` : ``}
                    ${this.currentItem.senderAddressCountry ? html`<br>${dispatchHelper.getCountryMapping()[this.currentItem.senderAddressCountry]}` : ``}
                </div>
                <div class="no-sender ${classMap({hidden: !this.isLoggedIn() || this.currentItem.senderFullName})}">${i18n.t('show-requests.empty-sender-text')}</div>
            </div>
        `;
    }

    addRecipientCardLeftSideContent(recipient) {
        const i18n = this._i18n;

        return html`
             <div class="left-side">
                <div>${recipient.givenName} ${recipient.familyName}</div>
                <div>${recipient.streetAddress}</div>
                <div>${recipient.postalCode} ${recipient.addressLocality}</div>
                <div>${dispatchHelper.getCountryMapping()[recipient.addressCountry]}</div>
                ${recipient.electronicallyDeliverable ? html`
                    <div class="delivery-status"><span class="status-green">●</span> ${i18n.t('show-requests.electronically-deliverable')}</div>
                ` : ``}
                ${!recipient.electronicallyDeliverable && recipient.postalDeliverable ? html`
                    <div class="delivery-status"><span class="status-orange">●</span> ${i18n.t('show-requests.only-postal-deliverable')}</div>
                ` : ``}
                
                ${!recipient.electronicallyDeliverable && !recipient.postalDeliverable ? html`
                    <div class="delivery-status"><span class="status-red">●</span> ${i18n.t('show-requests.not-deliverable-1')}
                    <dbp-tooltip
                        icon-name="warning-high"
                        class="info-tooltip"
                        text-content="${i18n.t('show-requests.not-deliverable-2')}"
                        interactive></dbp-tooltip></div>
                ` : ``}

                 ${this.currentItem.dateSubmitted && recipient.lastStatusChange.dispatchStatus && recipient.lastStatusChange.dispatchStatus === 'failure' ? html`
                    <div class="dispatch-status"><span class="status-title">${i18n.t('show-requests.dispatch-status')}</span> <span class="status-red">${i18n.t('show-requests.failure')}</span></div>
                ` : ``}
                 ${this.currentItem.dateSubmitted && recipient.lastStatusChange.dispatchStatus && recipient.lastStatusChange.dispatchStatus === 'success'  ? html`
                    <div class="dispatch-status"><span class="status-title">${i18n.t('show-requests.dispatch-status')}</span> <span class="status-green">${i18n.t('show-requests.success')}</span></div>
                ` : ``}
                 ${this.currentItem.dateSubmitted && recipient.lastStatusChange.dispatchStatus && recipient.lastStatusChange.dispatchStatus === 'pending'  ? html`
                    <div class="dispatch-status"><span class="status-title">${i18n.t('show-requests.dispatch-status')}</span> <span>${i18n.t('show-requests.pending')}</span></div>
                ` : ``}
                 ${this.currentItem.dateSubmitted && recipient.lastStatusChange.dispatchStatus && recipient.lastStatusChange.dispatchStatus === 'unknown'  ? html`
                    <div class="dispatch-status"><span class="status-title">${i18n.t('show-requests.dispatch-status')}</span> <span class="status-orange">${i18n.t('show-requests.unknown')}</span></div>
                ` : ``}
            </div>
        `;
    }

    checkRecipientStatus(recipients) {
        const i18n = this._i18n;

        let countFailure = 0;
        let countSuccess = 0;
        let countPending = 0;

        for (let i = 0; i < recipients.length; i++) {
            let recipient = recipients[i];

            let status;
            if (recipient.lastStatusChange) {
                status = recipient.lastStatusChange.dispatchStatus;
            } else {
                status = 'unknown';
            }
            if (status === 'success') {
                countSuccess++;
            } else if (status === 'pending') {
                countPending++;
            } else {
                countFailure++;
            }
        }

        let overallStatusText = "";

        overallStatusText += countSuccess > 0 ? i18n.t('show-requests.overall-status-success', { success: countSuccess }) :  "";

        overallStatusText += countSuccess > 0 && countPending > 0 ? ", " + i18n.t('show-requests.overall-status-pending', { pending: countPending }) :
                                 countPending > 0 ? i18n.t('show-requests.overall-status-pending', { pending: countPending }) : "";

        overallStatusText += (countSuccess > 0 || countPending > 0) && countFailure > 0 ? ", " + i18n.t('show-requests.overall-status-failure', { failure: countFailure }) :
                                countFailure > 0 ? i18n.t('show-requests.overall-status-failure', { failure: countFailure }) : "";

        let shortStatusText = "";
        shortStatusText += countSuccess > 0 ? i18n.t('show-requests.short-status-success', { success: countSuccess }) :  "";

        shortStatusText += countSuccess > 0 && countPending > 0 ? ", " + i18n.t('show-requests.short-status-pending', { pending: countPending }) :
                countPending > 0 ? i18n.t('show-requests.short-status-pending', { pending: countPending }) : "";

        shortStatusText += (countSuccess > 0 || countPending > 0) && countFailure > 0 ? ", " + i18n.t('show-requests.short-status-failure', { failure: countFailure }) :
                countFailure > 0 ? i18n.t('show-requests.short-status-failure', { failure: countFailure }) : "";

        return [ overallStatusText, shortStatusText ];
    }

    storeGroupValue(value) {
        this.groupValue = value;
        sessionStorage.setItem('dbp-dispatch-group-value', this.groupValue);
    }

    loadGroupValue() {
        this.groupValue = sessionStorage.getItem('dbp-dispatch-group-value');

        return this.groupValue;
    }
}
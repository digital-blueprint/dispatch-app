import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import {send} from "@dbp-toolkit/common/notification";
import MicroModal from "./micromodal.es";
import {FileSource, FileSink} from "@dbp-toolkit/file-handling";
import {html} from "lit";
import * as dispatchHelper from './utils';
import {PersonSelect} from "@dbp-toolkit/person-select";
import {ResourceSelect} from "@dbp-toolkit/resource-select";
import {IconButton} from "@dbp-toolkit/common";
import {classMap} from "lit/directives/class-map.js";
import {humanFileSize} from "@dbp-toolkit/common/i18next";


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
            'dbp-person-select': PersonSelect,
            'dbp-resource-select': ResourceSelect,
            'dbp-icon-button': IconButton
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
     *
     * @returns {boolean} true or false
     */
    isLoggedIn() {
        return (this.auth.person !== undefined && this.auth.person !== null);
    }

    /**
     * Returns true if a person has successfully logged in
     *
     * @returns {boolean} true or false
     */
    isLoading() {
        if (this._loginStatus === "logged-out")
            return false;
        return (!this.isLoggedIn() && this.auth.token !== undefined);
    }

    /**
     * Send a fetch to given url with given options
     *
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
     *
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
     *
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
     *
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
     *
     * @returns {object} response
     */
    async sendCreateDispatchRequest() {
        let body = {
            "name": this.subject,
            "senderGivenName": this.currentItem.senderGivenName,
            "senderFamilyName": this.currentItem.senderFamilyName,
            "senderAddressCountry": this.currentItem.senderAddressCountry,
            "senderPostalCode": this.currentItem.senderPostalCode,
            "senderAddressLocality": this.currentItem.senderAddressLocality,
            "senderStreetAddress": this.currentItem.senderStreetAddress,
            "senderBuildingNumber": this.currentItem.senderBuildingNumber,
            "groupId": this.groupId,
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
     *
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
     *
     * @param identifier
     * @param senderGivenName
     * @param senderFamilyName
     * @param senderAddressCountry
     * @param senderPostalCode
     * @param senderAddressLocality
     * @param senderStreetAddress
     * @param senderBuildingNumber
     * @param groupId
     * @returns {object} response
     */
    async sendEditDispatchRequest(identifier, senderGivenName, senderFamilyName, senderAddressCountry, senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber, groupId) {
        let body = {
            "senderGivenName": senderGivenName,
            "senderFamilyName": senderFamilyName,
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
     *
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
     *
     * @param id
     * @param givenName
     * @param familyName
     * @param birthDate
     * @param addressCountry
     * @param postalCode
     * @param addressLocality
     * @param streetAddress
     * @param buildingNumber
     * @returns {object} response
     */
    async sendAddRequestRecipientsRequest(id, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber) {
        let body = {
            "dispatchRequestIdentifier": id,
            "givenName": givenName,
            "familyName": familyName,
            "addressCountry": addressCountry,
            "postalCode": postalCode,
            "addressLocality": addressLocality,
            "streetAddress": streetAddress,
            "buildingNumber": buildingNumber,
            "birthDate": birthDate
        };

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

    async sendUpdateRecipientRequest(recipientId, id, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber) {
        let body = {
            "dispatchRequestIdentifier": id,
            "givenName": givenName,
            "familyName": familyName,
            "addressCountry": addressCountry,
            "postalCode": postalCode,
            "addressLocality": addressLocality,
            "streetAddress": streetAddress,
            "buildingNumber": buildingNumber,
            "birthDate": birthDate
        };

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
        this._('#add-files-btn').start();
        try {
            const i18n = this._i18n;
            let id = this.currentItem.identifier;

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

                send({
                    "summary": 'Error!',
                    "body": 'File could not be added.',
                    "type": "danger",
                    "timeout": 5,
                });
            }
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

    async deleteFile(file) {
        const i18n = this._i18n;

        this._('#delete-file-btn').start();

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
            this._('#delete-file-btn').stop();
        }
    }

    /**
     * Open Filesink for a single File
     *
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

    async addRecipientToRequest(event, item) {
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
            let buildingNumber = this.currentRecipient.buildingNumber;
            let birthDate = this.currentRecipient.birthDate;

            let response = await this.sendAddRequestRecipientsRequest(id, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber);

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
                this._('#recipient-selector').clear();
                this.currentRecipient.givenName = '';
                this.currentRecipient.familyName = '';
                this.currentRecipient.postalCode = '';
                this.currentRecipient.addressLocality = '';
                this.currentRecipient.streetAddress = '';
                this.currentRecipient.buildingNumber = '';
                this.currentRecipient.birthDate = '';

                this.currentRecipient.addressLocality = '';
                this.currentRecipient.postalCode = '';
                this.currentRecipient.streetAddress = '';
                this.currentRecipient.addressCountry = dispatchHelper.getCountryMapping('AT');

                this._('#tf-add-recipient-gn-dialog').value = this.currentRecipient.givenName;
                this._('#tf-add-recipient-fn-dialog').value = this.currentRecipient.familyName;
                this._('#tf-add-recipient-pc-dialog').value = this.currentRecipient.postalCode;
                this._('#tf-add-recipient-al-dialog').value = this.currentRecipient.addressLocality;
                this._('#tf-add-recipient-sa-dialog').value = this.currentRecipient.streetAddress;
                this._('#tf-add-recipient-bn-dialog').value = this.currentRecipient.buildingNumber;
                this._('#tf-add-recipient-birthdate').value = this.currentRecipient.birthDate;
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
            this._('#add-recipient-btn').stop();
        }
    }

    async updateRecipient(event, item) {
        this._('#edit-recipient-btn').start();

        try {
            const i18n = this._i18n;
            let id = this.currentItem.identifier;
            let recipientId = this.currentRecipient.identifier;

            let givenName = this.currentRecipient.givenName;
            let familyName = this.currentRecipient.familyName;
            let addressCountry = this.currentRecipient.addressCountry;
            let postalCode = this.currentRecipient.postalCode;
            let addressLocality = this.currentRecipient.addressLocality;
            let streetAddress = this.currentRecipient.streetAddress;
            let buildingNumber = this.currentRecipient.buildingNumber;
            let birthDate = this.currentRecipient.birthDate;

            let response = await this.sendUpdateRecipientRequest(recipientId, id, givenName, familyName, birthDate, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {
                send({
                    "summary": i18n.t('show-requests.successfully-edited-recipient-title'),
                    "body": i18n.t('show-requests.successfully-edited-recipient-text'),
                    "type": "success",
                    "timeout": 5,
                });

                this.currentRecipient = responseBody;

                let resp = await this.getDispatchRequest(id);
                let responseBody2 = await resp.json();
                if (responseBody2 !== undefined && responseBody2.status !== 403) {
                    this.currentItem = responseBody2;
                }
            } else {
                // TODO error handling

                send({
                    "summary": 'Error!',
                    "body": 'Could not update recipient. Response code: ' + response.status,
                    "type": "danger",
                    "timeout": 5,
                });
            }
        } catch (e) {
            //TODO
        } finally {
            this._('#edit-recipient-btn').stop();
        }
    }

    async deleteRecipient(recipient) {
        const i18n = this._i18n;
        // console.log(recipient);
        this._('#delete-recipient-btn').start();

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
            this._('#delete-recipient-btn').stop();
        }
    }

    async fetchStatusOfRecipient(recipient) {
        const i18n = this._i18n;
        console.log(recipient);

        let response = await this.getDispatchRecipient(recipient.identifier);
        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('show-requests.successfully-updated-sender-title'),
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

            this.showListView = false;
            this.showDetailsView = true;
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

        if(confirm(i18n.t('show-requests.delete-dialog-text'))) {
            this._('#delete-btn').start(); //TODO check if code below works
            button.start();

            try {
                let response = await this.sendDeleteDispatchRequest(item.identifier);
                if (response.status === 204) {
                    if (this.dispatchRequestsTable) {
                        this.getListOfRequests();
                    }
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
                        "body": 'Could not delete request. Response code: ' + response.status,
                        "type": "danger",
                        "timeout": 5,
                    });
                }
            } catch (e) {
                //TODO
            } finally {
                this._('#delete-btn').stop();
                button.stop();
            }
        }
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

        if (item.files && item.files.length > 0 && item.recipients && item.recipients.length > 0) {
            if(confirm(i18n.t('show-requests.submit-dialog-text'))) {
                try {
                    this._('#submit-btn').start(); //TODO
                    button.start();

                    let response = await this.sendSubmitDispatchRequest(item.identifier);
                    if (response.status === 201) {
                        if (this.dispatchRequestsTable) {
                            this.getListOfRequests();
                        }
                        send({
                            "summary": i18n.t('show-requests.successfully-submitted-title'),
                            "body": i18n.t('show-requests.successfully-submitted-text'),
                            "type": "success",
                            "timeout": 5,
                        });
                        this.clearAll();
                        this.requestCreated = false;
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
        } else {
            send({
                "summary": i18n.t('show-requests.empty-fields-submitted-title'),
                "body": i18n.t('show-requests.empty-fields-submitted-text'),
                "type": "danger",
                "timeout": 5,
            });
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

    async confirmEditSender() {
        const i18n = this._i18n;

        try {
            this._('#edit-sender-btn').start();
            let id = this.currentItem.identifier;
            let senderGivenName = this._('#tf-edit-sender-gn-dialog').value;
            let senderFamilyName = this._('#tf-edit-sender-fn-dialog').value;
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

            let response = await this.sendEditDispatchRequest(id, senderGivenName, senderFamilyName, senderAddressCountry[0], senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber, groupId);

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
        // let id = this.currentRecipient.identifier;

        let response = await this.getDispatchRecipient(identifier);
        // console.log('fetchdetailedrecipientinformation', response);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {

            this.currentRecipient = responseBody;

            this.currentRecipient.birthDate = this.convertToBirthDate(responseBody['birthDate']);

            this.currentRecipient.statusChanges = responseBody['statusChanges'];
            console.log('statusChanges: ', this.currentRecipient.statusChanges);
            if (this.currentRecipient.statusChanges.length > 0) {
                this.currentRecipient.statusDescription = this.currentRecipient.statusChanges[0].description;
                this.currentRecipient.statusType = this.currentRecipient.statusChanges[0].statusType;
            } else {
                this.currentRecipient.statusDescription = null;
                this.currentRecipient.statusType = null;
            }
            this.currentRecipient.deliveryEndDate = responseBody['deliveryEndDate'] ? responseBody['deliveryEndDate'] : '';
            this.currentRecipient.appDeliveryId = responseBody['appDeliveryID'] ? responseBody['appDeliveryID'] : '';
            // console.log('rec: ', this.currentRecipient);
        } else {
            // TODO error handling
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
                        "summary": i18n.t('show-requests.delete-not-allowed-title'),
                        "body": i18n.t('show-requests.delete-not-allowed-text'), //TODO add more specific text here
                        "type": "danger",
                        "timeout": 5,
                    });
                    somethingWentWrong = true;
                    break;
                }
                if (!(result.files && result.files.length > 0 && result.recipients && result.recipients.length > 0)) {
                    send({
                        "summary": i18n.t('show-requests.empty-fields-submitted-title'),
                        "body": i18n.t('show-requests.empty-fields-submitted-text'),
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

            let dialogText;
            if (this.dispatchRequestsTable.getSelectedRows().length > 1) {
                dialogText = i18n.t('show-requests.submit-more-dialog-text', {count: this.dispatchRequestsTable.getSelectedRows().length});
            } else {
                dialogText = i18n.t('show-requests.submit-dialog-text');
            }

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
            console.log('selectedItems: ', selectedItems);

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

            let dialogText;
            if (this.dispatchRequestsTable.getSelectedRows().length > 1) {
                dialogText = i18n.t('show-requests.delete-more-dialog-text', {count: this.dispatchRequestsTable.getSelectedRows().length});
            } else {
                dialogText = i18n.t('show-requests.delete-dialog-text');
            }

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

    createFormattedFilesList(list) {
        const i18n = this._i18n;
        let output = '';
        list.forEach((file) => {
            output += file.name + "<br>";
        });
        if (output !== '') {
            return output;
        } else {
            return i18n.t('show-requests.no-files-attached');
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
            let span = this.createScopedElement('span');
            span.classList.add('muted');
            span.textContent = i18n.t('show-requests.no-subject-found');

            let content = {
                requestId: item.identifier,
                subject: item.name ? item.name : span,
                status: item.dateSubmitted ? i18n.t('show-requests.status-completed') : i18n.t('show-requests.empty-date-submitted'),
                dateCreated: item.dateCreated,
                details: "Details",
                // sender: item.senderFamilyName ? item.senderFamilyName + " " + item.senderGivenName + "<br>"
                //     + item.senderStreetAddress + " " + item.senderBuildingNumber + "<br>"
                //     + item.senderPostalCode + " " + item.senderAddressLocality + "<br>"
                //     + item.senderAddressCountry : i18n.t('show-requests.empty-sender-text'),
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
     *
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

    async processSelectedRecipient(event) {
        this.currentRecipient = {};
        const person = JSON.parse(event.target.dataset.object);
        const personId = person['@id'];

        this.personId = personId;
        this.person = person;

        let response = await this.sendGetPersonDetailsRequest(personId);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {

            // console.log(responseBody);
            this.currentRecipient.familyName = responseBody.familyName;
            this.currentRecipient.givenName = responseBody.givenName;
            this.currentRecipient.birthDate = responseBody.birthDate ? responseBody.birthDate : '';

            this._('#tf-add-recipient-gn-dialog').value = this.currentRecipient.givenName;
            this._('#tf-add-recipient-fn-dialog').value = this.currentRecipient.familyName;
            this._('#tf-add-recipient-birthdate').value = this.currentRecipient.birthDate;

            // console.log(responseBody['localData']);

            if (responseBody['localData'] && responseBody['localData'] !== '') {
                this.currentRecipient.addressLocality = responseBody['localData']['addressLocality'] ? responseBody['localData']['addressLocality'] : '';
                this.currentRecipient.postalCode = responseBody['localData']['postalCode'] ? responseBody['localData']['postalCode'] : '';
                this.currentRecipient.streetAddress = responseBody['localData']['streetAddress'] ? responseBody['localData']['streetAddress'] : '';
                this.currentRecipient.addressCountry = responseBody['localData']['addressCountry'] ? dispatchHelper.getCountryMapping(responseBody['localData']['addressCountry']) : dispatchHelper.getCountryMapping('AT');
                this._('#add-recipient-country-select').value = responseBody['localData']['addressCountry'] ? responseBody['localData']['addressCountry'] : 'AT';
            } else {
                this.currentRecipient.addressLocality = '';
                this.currentRecipient.postalCode = '';
                this.currentRecipient.streetAddress = '';
                this.currentRecipient.addressCountry = dispatchHelper.getCountryMapping('AT');
                this._('#add-recipient-country-select').value = 'AT';
            }

            this._('#tf-add-recipient-pc-dialog').value = this.currentRecipient.postalCode;
            this._('#tf-add-recipient-al-dialog').value = this.currentRecipient.addressLocality;
            this._('#tf-add-recipient-sa-dialog').value = this.currentRecipient.streetAddress;
            this._('#tf-add-recipient-bn-dialog').value = this.currentRecipient.buildingNumber ? this.currentRecipient.buildingNumber : '';

        } else {
            // TODO error handling

            // send({
            //     "summary": 'Error!',
            //     "body": 'Could not fetch recipient with ID ' + personId + '. Response code: ' + response.status,
            //     "type": "danger",
            //     "timeout": 5,
            // });
        }

        this.requestUpdate();
    }

    async processSelectedSender(event) {
        this.storeGroupValue(event.detail.value);
        const i18n = this._i18n;
        this.organizationLoaded = true;

        let mayWrite = event.target.valueObject.mayWrite;
        if (!mayWrite && !this.requestCreated) {
            this.mayRead = event.target.valueObject.mayRead;
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
            this.mayRead = event.target.valueObject.mayRead;
            this.mayWrite = mayWrite;
            return;
        } else if (mayWrite && this.requestCreated && !this.tempChange) {
            // console.log('case3 curr', this.currentItem);
            let senderFamilyName = event.target.valueObject.identifier;

            if (senderFamilyName === this.currentItem.senderFamilyName) {
                return;
            }

            let senderGivenName = event.target.valueObject.name;
            let senderAddressCountry = event.target.valueObject.country;
            let senderStreetAddress = event.target.valueObject.street;
            let senderAddressLocality = event.target.valueObject.locality;
            let senderPostalCode = event.target.valueObject.postalCode;
            let groupId = event.target.valueObject.identifier;
            let mayRead = event.target.valueObject.mayRead;

            let response = await this.sendEditDispatchRequest(this.currentItem.identifier, senderGivenName, senderFamilyName,
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
                this.currentItem.senderFamilyName = senderFamilyName;
                this.currentItem.senderGivenName = senderGivenName;
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
            this.currentItem.senderFamilyName = event.target.valueObject.identifier;
            this.currentItem.senderGivenName = event.target.valueObject.name;
            this.currentItem.senderAddressCountry = event.target.valueObject.country;
            this.currentItem.senderStreetAddress = event.target.valueObject.street;
            this.currentItem.senderAddressLocality = event.target.valueObject.locality;
            this.currentItem.senderPostalCode = event.target.valueObject.postalCode;

            this.groupId = event.target.valueObject.identifier;
            this.mayRead = event.target.valueObject.mayRead;
            this.mayWrite = event.target.valueObject.mayWrite;

            this.tempItem = this.currentItem;
            this.tempValue = this._('#create-resource-select').value;
        }

        this.tempChange = false;
    }

    async preloadSelectedRecipient() {
        this.currentRecipient = {};

        if (this._('#recipient-selector') && this._('#recipient-selector').getAttribute('data-object') !== null) {
            const person = JSON.parse(this._('#recipient-selector').getAttribute('data-object'));
            const personId = person['@id'];

            // let value = this._('#recipient-selector').getAttribute('data-object');
            let response = await this.sendGetPersonDetailsRequest(personId);

            let responseBody = await response.json();
            if (responseBody !== undefined && response.status === 200) {

                // console.log(responseBody);
                this.currentRecipient.familyName = responseBody.familyName;
                this.currentRecipient.givenName = responseBody.givenName;
                this.currentRecipient.birthDate = responseBody.birthDate ? responseBody.birthDate : '';

                if (responseBody['localData'] !== null) {
                    this.currentRecipient.addressLocality = responseBody['localData']['addressLocality'] ? responseBody['localData']['addressLocality'] : '';
                    this.currentRecipient.postalCode = responseBody['localData']['postalCode'] ? responseBody['localData']['postalCode'] : '';
                    this.currentRecipient.streetAddress = responseBody['localData']['streetAddress'] ? responseBody['localData']['streetAddress'] : '';
                    this.currentRecipient.addressCountry = responseBody['localData']['addressCountry'] ? dispatchHelper.getCountryMapping(responseBody['localData']['addressCountry']) : dispatchHelper.getCountryMapping('AT');
                }
            } else {
                // TODO error handling
            }
            // console.log('rec', this.currentRecipient);
            this.requestUpdate();
        }
    }

    clearAll() {
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

        this.currentRecipient = {};

        this.subject = '';

        this.showListView = true;
        this.showDetailsView = false;
        this.currentRecipient = null;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

        // this.organizationLoaded = false;
        this.requestCreated = false;
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
                  @dbp-file-source-file-selected="${this.onFileSelected}">
             </dbp-file-source>
            
            <dbp-file-sink
                id="file-sink"
                context="${i18n.t('show-requests.save-field-label', {
                    count: 1,
                })}"
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

    processSenderGivenNameInput(event) {
        this.currentItem.senderGivenName = "";
        if (this._('#sender-given-name').value !== '') {
            this.currentItem.senderGivenName = this._('#sender-given-name').value;
        } else {
            this.currentItem.senderGivenName = '';
        }
    }

    processSenderFamilyNameInput(event) {
        this.currentItem.senderFamilyName = "";
        if (this._('#sender-family-name').value !== '') {
            this.currentItem.senderFamilyName = this._('#sender-family-name').value;
        } else {
            this.currentItem.senderFamilyName = '';
        }
    }

    processSenderAddressCountryInput(event) {
        this.currentItem.senderAddressCountry = "";
        if (this._('#sender-address-country').value !== '') {
            this.currentItem.senderAddressCountry = this._('#sender-address-country').value;
        } else {
            this.currentItem.senderAddressCountry = '';
        }
    }

    processSenderPostalCodeInput(event) {
        this.currentItem.senderPostalCode = "";
        if (this._('#sender-postal-code').value !== '') {
            this.currentItem.senderPostalCode = this._('#sender-postal-code').value;
        } else {
            this.currentItem.senderPostalCode = '';
        }
    }

    processSenderAddressLocalityInput(event) {
        this.currentItem.senderAddressLocality = "";
        if (this._('#sender-address-locality').value !== '') {
            this.currentItem.senderAddressLocality = this._('#sender-address-locality').value;
        } else {
            this.currentItem.senderAddressLocality = '';
        }
    }

    processSenderStreetAddressInput(event) {
        this.currentItem.senderStreetAddress = "";
        if (this._('#sender-street-address').value !== '') {
            this.currentItem.senderStreetAddress = this._('#sender-street-address').value;
        } else {
            this.currentItem.senderStreetAddress = '';
        }
    }

    processSenderBuildingNumberInput(event) {
        this.currentItem.senderBuildingNumber = "";
        if (this._('#sender-building-number').value !== '') {
            this.currentItem.senderBuildingNumber = this._('#sender-building-number').value;
        } else {
            this.currentItem.senderBuildingNumber = '';
        }
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
                                            value="${this.currentItem && this.currentItem.senderFamilyName}"
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
                                            value="${this.currentItem && this.currentItem.senderGivenName}"
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
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-person-select-label')}
                                <div>
                                <div>
                                    <div class="control">
                                        <dbp-person-select
                                                id="recipient-selector"
                                                subscribe="auth"
                                                lang="${this.lang}"
                                                entry-point-url="${this.entryPointUrl}"
                                                @change="${(event) => {this.processSelectedRecipient(event);}}"
                                        ></dbp-person-select>
                                    </div>
                                </div>
                            </div>
                            ${i18n.t('show-requests.add-recipient-or-text')}
                                    
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-gn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
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
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-fn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
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
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
                                            type="date" 
                                            id="tf-add-recipient-birthdate"
                                            lang="${this.lang}"
                                            value="${this.currentRecipient ? this.currentRecipient.birthDate : ``}"
                                    />
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-sa-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
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
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-bn-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            type="text"
                                            class="input"
                                            maxlength="10"
                                            name="tf-add-recipient-bn-dialog"
                                            id="tf-add-recipient-bn-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.buildingNumber : ``}"
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
                                            required
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
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-al-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
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
                                <div class="nf-label">
                                    ${i18n.t('show-requests.add-recipient-ac-dialog-label')}
                                </div>
                                <div>
                                    <select required id="add-recipient-country-select" class="country-select">
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
                                            MicroModal.close(this._('#add-recipient-modal'));
                                        }}">
                                    ${i18n.t('show-requests.add-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="add-recipient-confirm-btn"
                                        @click="${() => {
                                            let validcountry = this.checkValidity(this._('#add-recipient-country-select'));
                                            let validal = this.checkValidity(this._('#tf-add-recipient-al-dialog'));
                                            let validpc = this.checkValidity(this._('#tf-add-recipient-pc-dialog'));
                                            let validbn = this.checkValidity(this._('#tf-add-recipient-bn-dialog'));
                                            let validsa = this.checkValidity(this._('#tf-add-recipient-sa-dialog'));
                                            let validbirthday = this.checkValidity(this._('#tf-add-recipient-birthdate'));
                                            let validfn = this.checkValidity(this._('#tf-add-recipient-fn-dialog'));
                                            let validgn = this.checkValidity(this._('#tf-add-recipient-gn-dialog'));

                                            if (validgn && validfn && validcountry && validpc && validal && validsa && validbn && validbirthday) {
                                                this.currentRecipient.givenName = this._('#tf-add-recipient-gn-dialog').value;
                                                this.currentRecipient.familyName = this._('#tf-add-recipient-fn-dialog').value;
                                                this.currentRecipient.addressCountry = this._('#add-recipient-country-select').value;
                                                this.currentRecipient.postalCode = this._('#tf-add-recipient-pc-dialog').value;
                                                this.currentRecipient.addressLocality = this._('#tf-add-recipient-al-dialog').value;
                                                this.currentRecipient.streetAddress = this._('#tf-add-recipient-sa-dialog').value;
                                                this.currentRecipient.buildingNumber = this._('#tf-add-recipient-bn-dialog').value;
                                                this.currentRecipient.birthDate = this._('#tf-add-recipient-birthdate').value;
                                                
                                                this.addRecipientToRequest().then(r => {
                                                    MicroModal.close(this._('#add-recipient-modal'));

                                                    // TODO clear selector value
                                                    this._('#recipient-selector').value = "";
                                                    // console.log(this._('#recipient-selector'));
                                                    // console.log('value: ', this._('#recipient-selector').value);
                                                });
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
                                        this._('#edit-recipient-btn').stop();
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
                                            required
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
                                            required
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
                                <div>
                                    <input
                                            required
                                            type="date" 
                                            id="tf-edit-recipient-birthdate"
                                            lang="${this.lang}"
                                            value="${this.currentRecipient ? this.currentRecipient.birthDate : ``}"
                                    >
                                </div>
                            </div>
                            <div class="modal-content-item">
                                <div class="nf-label">
                                    ${i18n.t('show-requests.edit-recipient-sa-dialog-label')}
                                </div>
                                <div>
                                    <input
                                            required
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
                                            maxlength="10"
                                            name="tf-edit-recipient-bn-dialog"
                                            id="tf-edit-recipient-bn-dialog"
                                            value="${this.currentRecipient ? this.currentRecipient.buildingNumber : ``}"
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
                                            required
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
                                            required
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
                                        <select required id="edit-recipient-country-select" class="country-select">
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
                                            this._('#edit-recipient-btn').stop();
                                            MicroModal.close(this._('#edit-recipient-modal'));
                                        }}">
                                    ${i18n.t('show-requests.edit-recipient-dialog-button-cancel')}
                                </button>
                                <button
                                        class="button select-button is-primary"
                                        id="edit-recipient-confirm-btn"
                                        @click="${() => {
                                            let validcountry = this.checkValidity(this._('#edit-recipient-country-select'));
                                            let validal = this.checkValidity(this._('#tf-edit-recipient-al-dialog'));
                                            let validpc = this.checkValidity(this._('#tf-edit-recipient-pc-dialog'));
                                            let validbn = this.checkValidity(this._('#tf-edit-recipient-bn-dialog'));
                                            let validsa = this.checkValidity(this._('#tf-edit-recipient-sa-dialog'));
                                            let validbirthday = this.checkValidity(this._('#tf-edit-recipient-birthdate'));
                                            let validfn = this.checkValidity(this._('#tf-edit-recipient-fn-dialog'));
                                            let validgn = this.checkValidity(this._('#tf-edit-recipient-gn-dialog'));
                                            
                                            if (validgn && validfn && validcountry && validpc && validal && validsa && validbn && validbirthday) {
                                                this.currentRecipient.givenName = this._('#tf-edit-recipient-gn-dialog').value;
                                                this.currentRecipient.familyName = this._('#tf-edit-recipient-fn-dialog').value;
                                                this.currentRecipient.addressCountry = this._('#edit-recipient-country-select').value;
                                                this.currentRecipient.postalCode = this._('#tf-edit-recipient-pc-dialog').value;
                                                this.currentRecipient.addressLocality = this._('#tf-edit-recipient-al-dialog').value;
                                                this.currentRecipient.streetAddress = this._('#tf-edit-recipient-sa-dialog').value;
                                                this.currentRecipient.buildingNumber = this._('#tf-edit-recipient-bn-dialog').value;
                                                this.currentRecipient.birthDate = this._('#tf-edit-recipient-birthdate').value;
                                                this.updateRecipient();
                                                MicroModal.close(this._('#edit-recipient-modal'));
                                            } else {
                                                this._('#edit-recipient-btn').stop();
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

                                <div class="element-left">
                                    ${i18n.t('show-requests.add-recipient-birthdate-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.birthDate ? this.convertToBirthDate(this.currentRecipient.birthDate) : ``}
                                </div>
                                
                                <div class="element-left">
                                    ${i18n.t('show-requests.edit-recipient-sa-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.streetAddress ? this.currentRecipient.streetAddress : ``}
                                </div>
                                ${this.currentRecipient && this.currentRecipient.buildingNumber ? html`
                                    <div class="element-left">
                                        ${i18n.t('show-requests.edit-recipient-bn-dialog-label')}:
                                    </div>
                                    <div class="element-right">
                                        ${this.currentRecipient.buildingNumber}
                                    </div>
                                ` : ``}
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
                                    ${i18n.t('show-requests.edit-recipient-ac-dialog-label')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.addressCountry ? this.currentRecipient.addressCountry : ``}
                                </div>
                                ${this.currentRecipient && this.currentRecipient.deliveryEndDate ? html`
                                <div class="element-left">
                                    ${i18n.t('show-requests.delivery-end-date')}:
                                </div>
                                <div class="element-right">
                                    ${this.convertToReadableDate(this.currentRecipient.deliveryEndDate)}
                                </div>` : ``}
                                <div class="element-left">
                                    ${i18n.t('show-requests.recipient-id')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.identifier ? this.currentRecipient.identifier : ``}
                                </div>
                                <div class="element-left">
                                    ${i18n.t('show-requests.app-delivery-id')}:
                                </div>
                                <div class="element-right">
                                    ${this.currentRecipient && this.currentRecipient.appDeliveryId ? this.currentRecipient.appDeliveryId : ``}
                                </div>
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
                            <div class="modal-content-item">
                                <div>
                                    ${i18n.t('show-requests.edit-subject-description')}
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

    storeGroupValue(value) {
        this.groupValue = value;
        sessionStorage.setItem('dbp-dispatch-group-value', this.groupValue);
    }

    loadGroupValue() {
        this.groupValue = sessionStorage.getItem('dbp-dispatch-group-value');

        return this.groupValue;
    }

    addSenderDetailsView() {
        const i18n = this._i18n;

        return html`
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
        `;
    }

    addRecipientDetailsView(recipient) {
        const i18n = this._i18n;

        return html`
            <div class="recipient card">
                <div class="left-side">
                    <div>${recipient.givenName} ${recipient.familyName}</div>
                    <div>${recipient.streetAddress} ${recipient.buildingNumber}</div>
                    <div>${recipient.postalCode} ${recipient.addressLocality}</div>
                    <div>${dispatchHelper.getCountryMapping()[recipient.addressCountry]}</div>
                </div>
                <div class="right-side">
                        <dbp-icon-button id="show-recipient-btn"
                                    @click="${() => {
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
                                 ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                 @click="${() => {
                                        this.currentRecipient = recipient;
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
                                                    }
                                                });
                                            });
                                        } catch {
                                            this._('#edit-recipient-btn').stop();
                                        }
                                 }}"
                                 title="${i18n.t('show-requests.edit-recipients-button-text')}"
                                 icon-name="pencil"></dbp-icon-button>
                            <dbp-icon-button id="delete-recipient-btn"
                                ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                @click="${() => {
                                    this.deleteRecipient(recipient);
                                }}"
                                title="${i18n.t('show-requests.delete-recipient-button-text')}"
                                icon-name="trash"></dbp-icon-button>` : ``
                         }
                </div>
            </div>
        `;
    }

    addFileDetailsView() {
        const i18n = this._i18n;

        return html`
            <div class="header-btn">
                <div class="section-titles">${i18n.t('show-requests.files')} <span class="section-title-counts">
                        ${this.currentItem.files && this.currentItem.files.length !== 0 ? `(` + this.currentItem.files.length + `)` : ``}</span>
                </div>
                ${!this.currentItem.dateSubmitted ? html`
                     <dbp-loading-button id="add-files-btn"
                        ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                        value="${i18n.t('show-requests.add-files-button-text')}" 
                        @click="${() => {
                            this.openFileSource();
                        }}" 
                        title="${i18n.t('show-requests.add-files-button-text')}">${i18n.t('show-requests.add-files-button-text')}</dbp-loading-button>` : ``
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
                                }}"
                                class="hidden" <!--TODO -->
                                title="${i18n.t('show-requests.show-file-button-text')}"
                                icon-name="keyword-research"></dbp-icon-button>
                            ${!this.currentItem.dateSubmitted ? html`
                               <dbp-icon-button id="delete-file-btn"
                                    ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}"
                                    @click="${(event) => {
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
        `;
    }

    addSubmitAndDeleteButtons() {
        const i18n = this._i18n;

        return html`
            ${ this.currentItem && !this.currentItem.dateSubmitted ? html`
                <div class="request-buttons">
                    <div class="edit-buttons">
                        <dbp-loading-button id="delete-btn" 
                                            ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}" 
                                            value="${i18n.t('show-requests.delete-button-text')}" 
                                            @click="${(event) => { this.deleteRequest(event, this.currentItem); }}" 
                                            title="${i18n.t('show-requests.delete-button-text')}"
                        >${i18n.t('show-requests.delete-button-text')}</dbp-loading-button>
                    </div>
                    <div class="submit-button">
                        <dbp-loading-button type="is-primary"
                                            id="submit-btn" 
                                            ?disabled="${this.loading || this.currentItem.dateSubmitted || !this.mayWrite}" 
                                            value="${i18n.t('show-requests.submit-button-text')}" 
                                            @click="${(event) => { this.submitRequest(event, this.currentItem); }}" 
                                            title="${i18n.t('show-requests.submit-button-text')}"
                        >${i18n.t('show-requests.submit-button-text')}</dbp-loading-button>
                    </div>
                </div>` : ``
            }
        `;
    }
}
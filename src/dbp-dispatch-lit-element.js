import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import {send} from "@dbp-toolkit/common/notification";
import MicroModal from "./micromodal.es";


export default class DBPDispatchLitElement extends DBPLitElement {
    constructor() {
        super();
        this.isSessionRefreshed = false;
        this.auth = {};
    }

    static get properties() {
        return {
            ...super.properties,
            auth: { type: Object },
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
     * Gets the list of all dispatch requests of the current logged in user
     *
     * @returns {object} response
     */
    async getListOfDispatchRequests() {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests?perPage=10000', options);
    }

    /**
     * Gets the dispatch request of the current logged in user with the given identifier
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
     * Sends a dispatch post request
     *
     * @returns {object} response
     */
    async sendCreateDispatchRequest() {
        let body = {
            "senderGivenName": this.senderGivenName,
            "senderFamilyName": this.senderFamilyName,
            "senderAddressCountry": this.senderAddressCountry,
            "senderPostalCode": this.senderPostalCode,
            "senderAddressLocality": this.senderAddressLocality,
            "senderStreetAddress": this.senderStreetAddress,
            "senderBuildingNumber": this.senderBuildingNumber
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
     * @returns {object} response
     */
    async sendEditDispatchRequest(identifier, senderGivenName, senderFamilyName, senderAddressCountry, senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber) {
        let body = {
            "senderGivenName": senderGivenName,
            "senderFamilyName": senderFamilyName,
            "senderAddressCountry": senderAddressCountry,
            "senderPostalCode": senderPostalCode,
            "senderAddressLocality": senderAddressLocality,
            "senderStreetAddress": senderStreetAddress,
            "senderBuildingNumber": senderBuildingNumber
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
     * @param addressCountry
     * @param postalCode
     * @param addressLocality
     * @param streetAddress
     * @param buildingNumber
     * @returns {object} response
     */
    async sendAddRequestRecipientsRequest(id, givenName, familyName, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber) {
        let body = {
            "dispatchRequestIdentifier": id,
            "givenName": givenName,
            "familyName": familyName,
            "addressCountry": addressCountry,
            "postalCode": postalCode,
            "addressLocality": addressLocality,
            "streetAddress": streetAddress,
            "buildingNumber": buildingNumber,
            "birthDate": "1980-01-01" /** TODO */
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

    async sendUpdateRecipientRequest(recipientId, id, givenName, familyName, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber) {
        let body = {
            "dispatchRequestIdentifier": id,
            "givenName": givenName,
            "familyName": familyName,
            "addressCountry": addressCountry,
            "postalCode": postalCode,
            "addressLocality": addressLocality,
            "streetAddress": streetAddress,
            "buildingNumber": buildingNumber
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

    async sendGetOrganizationDetailsRequest(identifier) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: "Bearer " + this.auth.token
            },
        };
        return await this.httpGetAsync(this.entryPointUrl + '/dispatch/requests/' + identifier + '?includeLocal=street%2Ccity%2CpostalCode%2Ccountry', options);
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
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        console.log(file);

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
        }
    }

    async deleteFile(file) {
        const i18n = this._i18n;
        console.log(file);

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

    /**
     * Get a list of all requests
     *
     * @returns {Array} list
     */
    async getListOfRequests() {
        this.initialRequestsLoading = !this._initialFetchDone;
        try {
            let response = await this.getListOfDispatchRequests();
            let responseBody = await response.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.requestList = this.parseListOfRequests(responseBody);
                let tableObject = this.createTableObject(this.requestList);
                this.dispatchRequestsTable.setData(tableObject);
                this.dispatchRequestsTable.setLocale(this.lang);
            }
        } finally {
            this.initialRequestsLoading = false;
            this._initialFetchDone = true;
        }
    }

    async addRecipientToRequest(event, item) {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let givenName = this._('#tf-add-recipient-gn-dialog').value;
        let familyName = this._('#tf-add-recipient-fn-dialog').value;
        let addressCountry = this._('#tf-add-recipient-ac-dialog').value;
        let postalCode = this._('#tf-add-recipient-pc-dialog').value;
        let addressLocality = this._('#tf-add-recipient-al-dialog').value;
        let streetAddress = this._('#tf-add-recipient-sa-dialog').value;
        let buildingNumber = this._('#tf-add-recipient-bn-dialog').value;

        let response = await this.sendAddRequestRecipientsRequest(id, givenName, familyName, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber);

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

                // this.currentRecipient = '';
            }
        } else {
            // TODO error handling
        }
    }

    async updateRecipient(event, item) {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let recipientId = this.currentRecipient.identifier;
        let givenName = this._('#tf-edit-recipient-gn-dialog').value;
        let familyName = this._('#tf-edit-recipient-fn-dialog').value;
        let addressCountry = this._('#tf-edit-recipient-ac-dialog').value;
        let postalCode = this._('#tf-edit-recipient-pc-dialog').value;
        let addressLocality = this._('#tf-edit-recipient-al-dialog').value;
        let streetAddress = this._('#tf-edit-recipient-sa-dialog').value;
        let buildingNumber = this._('#tf-edit-recipient-bn-dialog').value;

        let response = await this.sendUpdateRecipientRequest(recipientId, id, givenName, familyName, addressCountry, postalCode, addressLocality, streetAddress, buildingNumber);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('show-requests.successfully-edited-recipient-title'),
                "body": i18n.t('show-requests.successfully-edited-recipient-text'),
                "type": "success",
                "timeout": 5,
            });

            // this.currentRecipient = responseBody;

            let resp = await this.getDispatchRequest(id);
            let responseBody = await resp.json();
            if (responseBody !== undefined && responseBody.status !== 403) {
                this.currentItem = responseBody;
            }
        } else {
            // TODO error handling
        }
    }

    async deleteRecipient(recipient) {
        const i18n = this._i18n;
        console.log(recipient);

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
            }
        } else {
            // TODO error handling
        }
    }

    async editRequest(event, item) {
        this.showListView = false;
        this.showDetailsView = true;
        this.currentItem = item;
        //await this.getDispatchRequest(item.identifier);
    }

    async deleteRequest(event, item) {
        const i18n = this._i18n;

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
            let response = await this.sendDeleteDispatchRequest(item.identifier);
            if (response.status === 204) {
                this.getListOfRequests();
                send({
                    "summary": i18n.t('show-requests.successfully-deleted-title'),
                    "body": i18n.t('show-requests.successfully-deleted-text'),
                    "type": "success",
                    "timeout": 5,
                });
                if (this.currentItem) {
                    this.showListView = true;
                    this.showDetailsView = false;
                    this.currentItem = null;
                }
            } else {
                // TODO error handling
            }
        }
    }

    async submitRequest(event, item) {
        const i18n = this._i18n;

        if (item.dateSubmitted) {
            send({
                "summary": i18n.t('show-requests.delete-not-allowed-title'),
                "body": i18n.t('show-requests.delete-not-allowed-text'),
                "type": "danger",
                "timeout": 5,
            });
            return;
        }

        if (item.files && item.files.length > 0 && item.recipients && item.recipients.length > 0) {

            if(confirm(i18n.t('show-requests.submit-dialog-text'))) {
                let response = await this.sendSubmitDispatchRequest(item.identifier);
                if (response.status === 201) {
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

    async confirmEditSender() {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let senderGivenName = this._('#tf-edit-sender-gn-dialog').value;
        let senderFamilyName = this._('#tf-edit-sender-fn-dialog').value;
        let senderPostalCode = this._('#tf-edit-sender-pc-dialog').value;
        let senderAddressLocality = this._('#tf-edit-sender-al-dialog').value;
        let senderStreetAddress = this._('#tf-edit-sender-sa-dialog').value;
        let senderBuildingNumber = this._('#tf-edit-sender-bn-dialog').value;

        var e = this._('#edit-sender-country-select');
        var value = e.value;
        var text = e.options[e.selectedIndex].text;
        let senderAddressCountry = [value, text];

        let response = await this.sendEditDispatchRequest(id, senderGivenName, senderFamilyName, senderAddressCountry[0], senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('show-requests.successfully-updated-sender-title'),
                "body": i18n.t('show-requests.successfully-updated-sender-text'),
                "type": "success",
                "timeout": 5,
            });

            this.currentItem = responseBody;
        } else {
            // TODO error handling
        }
    }

    async confirmAddSubject() {
        this.subject = this._('#tf-add-subject-fn-dialog').value;

        await this.processCreateDispatchRequest();

        this.showDetailsView = true;
        this.hasSubject = true;

        MicroModal.show(this._('#add-sender-modal'), {
            disableScroll: true,
            onClose: (modal) => {
                this.loading = false;
            },
        });
    }

    async confirmAddSender() {
        const i18n = this._i18n;
        let id = this.currentItem.identifier;
        let senderGivenName = this._('#tf-add-sender-gn-dialog').value;
        let senderFamilyName = this._('#tf-add-sender-fn-dialog').value;
        let senderPostalCode = this._('#tf-add-sender-pc-dialog').value;
        let senderAddressLocality = this._('#tf-add-sender-al-dialog').value;
        let senderStreetAddress = this._('#tf-add-sender-sa-dialog').value;
        let senderBuildingNumber = this._('#tf-add-sender-bn-dialog').value;

        var e = this._('#add-sender-country-select');
        var value = e.value;
        var text = e.options[e.selectedIndex].text;
        let senderAddressCountry = [value, text];

        let response = await this.sendEditDispatchRequest(id, senderGivenName, senderFamilyName, senderAddressCountry[0], senderPostalCode, senderAddressLocality, senderStreetAddress, senderBuildingNumber);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            send({
                "summary": i18n.t('create-request.successfully-requested-title'),
                "body": i18n.t('create-request.successfully-requested-text'),
                "type": "success",
                "timeout": 5,
            });

            this.currentItem = responseBody;
        } else {
            // TODO error handling
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

    processSelectedRecipient(event) {
        const person = JSON.parse(event.target.dataset.object);
        const personId = person['@id'];

        this.personId = personId;
        this.person = person;

        this.currentItem.givenName = person.givenName;
        this.currentItem.familyName = person.familyName;

        // person.birthDate;
        this._('#tf-add-recipient-gn-dialog').value = person.givenName;
        this._('#tf-add-recipient-fn-dialog').value = person.familyName;
        this._('#tf-add-recipient-ac-dialog').value = '';
        this._('#tf-add-recipient-pc-dialog').value = '';
        this._('#tf-add-recipient-al-dialog').value = '';
        this._('#tf-add-recipient-sa-dialog').value = '';
        this._('#tf-add-recipient-bn-dialog').value = '';
    }

    async processSelectedSender(event) {
        this.organizationId = event.target.valueObject.identifier;
        this.organization = event.target.valueObject.name;

        let response = await this.sendGetOrganizationDetailsRequest(this.organizationId);

        let responseBody = await response.json();
        if (responseBody !== undefined && response.status === 200) {
            if (responseBody['localData']) {
                //this.currentItem.senderAddressCountry = responseBody.localData['country'];
                // this.currentItem.senderStreetAddress = responseBody.localData['street'];
                //TODO
            }
        } else {
            // TODO error handling
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

        this.senderGivenName = "";
        this.senderFamilyName = "";
        this.senderAddressCountry = "";
        this.senderPostalCode = "";
        this.senderAddressLocality = "";
        this.senderStreetAddress = "";
        this.senderBuildingNumber = "";

        this.subject = '';

        this.showListView = true;
        this.showDetailsView = false;
        this.currentRecipient = null;

        this.hasEmptyFields = false;
        this.hasSender = false;
        this.hasRecipients = false;

        this.organization = "";
        this.organizationId = "";
    }

}
import {ResourceSelect} from '@dbp-toolkit/resource-select';

export class PersonResourceSelect extends ResourceSelect {
    constructor() {
        super();
        this.resourcePath = 'base/people';
        this.fetchMode = 'search';
        this.noDefault = true;
    }

    getCollectionQueryParameters(select) {
        return {
            includeLocal: 'matriculationNumber',
        };
    }

    getItemQueryParameters(select) {
        return {
            includeLocal: 'matriculationNumber',
        };
    }

    /**
     * If the search term matches a matriculationNumber, we search for that,
     * otherwise the name.
     * @param {object} select
     * @param {string} searchTerm
     * @returns {object}
     */
    getSearchQueryParameters(select, searchTerm) {
        searchTerm = searchTerm.trim();
        if (PersonResourceSelect.isValidMatriculationNumber(searchTerm)) {
            return {
                'filter[localData.matriculationNumber]': `"${searchTerm}"`,
            };
        }

        return {
            search: searchTerm,
            sort: 'familyName',
        };
    }

    /**
     * @param {object} select
     * @param {object} person
     * @returns {string}
     */
    formatResource(select, person) {
        let text = person.givenName ?? '';
        if (person.familyName) {
            text += ` ${person.familyName}`;
        }

        const matriculationNumber = person.localData?.matriculationNumber;
        if (PersonResourceSelect.isValidMatriculationNumber(matriculationNumber)) {
            text += ` (${matriculationNumber})`;
        }

        return text;
    }

    /**
     * @param {string} matriculationNumber
     * @returns {boolean}
     */
    static isValidMatriculationNumber(matriculationNumber) {
        return Boolean(matriculationNumber && /^[0-9]{8}$/g.test(matriculationNumber));
    }
}

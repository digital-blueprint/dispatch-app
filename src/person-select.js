import {PersonSelect} from '@dbp-toolkit/person-select';
import {ScopedElementsMixin} from '@dbp-toolkit/common';

export class CustomPersonSelect extends ScopedElementsMixin(PersonSelect) {
    constructor() {
        super();
        super.localDataAttributes = ['matriculationNumber'];
    }

    /**
     * If the search term matches a matriculationNumber, we search for that,
     * otherwise the name (default behavior)
     * @param select
     * @param searchTerm
     */
    getFilterQueryParameters(select, searchTerm) {
        searchTerm = searchTerm.trim();
        if (CustomPersonSelect.isValidMatriculationNumber(searchTerm)) {
            return {
                'filter[localData.matriculationNumber]': `"${searchTerm}"`,
            };
        }

        return super.getFilterQueryParameters(select, searchTerm);
    }

    /**
     * Should return a string representation of the selected person's local data attributes.
     * Feel free to override.
     *
     * @param {object} select
     * @param {object} person
     * @returns {string}
     */
    formatLocalData(select, person) {
        const matriculationNumber = person.localData?.matriculationNumber;
        if (CustomPersonSelect.isValidMatriculationNumber(matriculationNumber)) {
            return ` (${matriculationNumber})`;
        }

        return '';
    }

    /**
     * @param {string} mat
     * @returns {boolean}
     */
    static isValidMatriculationNumber(mat) {
        return mat && /^[0-9]{8}$/g.test(mat);
    }
}

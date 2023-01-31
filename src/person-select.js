import {PersonSelect} from "@dbp-toolkit/person-select";
import {ScopedElementsMixin} from '@open-wc/scoped-elements';

export class CustomPersonSelect extends ScopedElementsMixin(PersonSelect) {

    // If the search term matches a matriculationNumber, we search for that,
    // otherwise the name
    buildUrlData(select, params) {
        let term = params.term.trim();
    
        const isMat = term.match(/^[0-9]{8}$/g);
        let data = {
            includeLocal: 'matriculationNumber'
        };
        if (isMat) {
            data['queryLocal'] = 'matriculationNumber:'+term;
        } else {
            data['search'] = term;
        }
        return data;
    }

    // Includes the matriculationNumber if possible
    formatPerson(select, person) {
        let text = person['givenName'] ?? '';
        if (person['familyName']) {
            text += ` ${person['familyName']}`;
        }
    
        let mat = person?.localData?.matriculationNumber;
        if (mat !== undefined && mat.length) {
             text += ` (${mat[0]})`;
        }
    
        return text;
    }
}
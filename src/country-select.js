import {CountrySelect} from '@dbp-toolkit/country-select';
import {ScopedElementsMixin} from '@dbp-toolkit/common';

export class CustomCountrySelect extends ScopedElementsMixin(CountrySelect) {
    constructor() {
        super();
    }
    handleCountryChange(event) {
        this.selectedCountry = event.detail.value;
    }
}

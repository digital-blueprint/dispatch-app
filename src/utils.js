import {html} from 'lit';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as commonUtils from '@dbp-toolkit/common/utils';
import deAT from 'cldr-localenames-full/main/de-AT/territories.json';
//import keys from "../dist/shared/index.es.DXc8AeoU.es.js";

export const getPDFFileBase64Content = (file) => {
    return file.contentUrl.replace(/data:\s*application\/pdf;\s*base64,/, '');
};

/**
 * Returns the content of the file
 * @param {File} file The file to read
 * @returns {string} The content
 */
export const readBinaryFileContent = async (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(reader.error);
        };
        reader.readAsBinaryString(file);
    });
};

export const getReferenceNumberFromPDF = async (file) => {
    const data = await readBinaryFileContent(file);

    // Load PDF
    const pdf = await pdfjs.getDocument({data: data}).promise;
    let referenceNumber = null;

    // Get first page of the PDF
    await pdf.getPage(1).then(async (page) => {
        // Get the annotations for the page
        await page.getAnnotations().then(async (annotations) => {
            // Loop through the annotations
            await commonUtils.asyncArrayForEach(annotations, async (annotation) => {
                // Check if the annotation is a business number, and we haven't found one yet
                if (
                    referenceNumber === null &&
                    annotation.contentsObj.str.startsWith('dbp_annotation_bbe3a371=')
                ) {
                    let contents = annotation.contentsObj.str;
                    referenceNumber = contents.substring(contents.indexOf('=') + 1);
                }
            });
        });
    });

    return referenceNumber;
};

export const convertDataURIToBinary = (dataURI) => {
    const BASE64_MARKER = ';base64,';
    const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    const base64 = dataURI.substring(base64Index);
    const raw = window.atob(base64);
    const rawLength = raw.length;
    let array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }

    return array;
};

export const getDataURIContentType = (dataURI) => {
    const BASE64_MARKER = ';base64,';
    const base64Index = dataURI.indexOf(BASE64_MARKER);

    return dataURI.substring(5, base64Index);
};

export function getGermanCountryList() {
    let selectElement = document.createElement("select");
    let allCountries = deAT.main["de-AT"].localeDisplayNames.territories;

    const countryCodes =
        ["AF","EG","AL","DZ","AD","AO","AG","GQ","AR","AM","AZ","ET","AU",
            "BS","BH","BD","BB","BY","BE","BZ","BJ","BT","BO","BA","BW",
            "BR","BN","BG","BF","BI","CL","CN","CR","CI","DK","DE","DM",
            "DO","DJ","EC","SV","ER","EE","FJ","FI","FR","GA","GM","GE",
            "GH","GD","GR","GT","GN","GW","GY","HT","HN","IN","ID","IQ",
            "IR","IE","IS","IL","IT","JM","JP","YE","JO","KH","CM","CA",
            "CV","KZ","QA","KE","KG","KI","CO","KM","CG","CD","KP","KR",
            "XK","HR","CU","KW","LA","LS","LV","LB","LR","LY","LI","LT",
            "LU","MG","MW","MY","MV","ML","MT","MA","MH","MR","MU","MK",
            "MX","FM","MD","MC","MN","ME","MZ","MM","NA","NR","NP","NZ",
            "NI","NL","NE","NG","NO","OM","AT","PK","PW","PA","PG","PY",
            "PE","PH","PL","PT","RW","RO","RU","SB","ZM","WS","SM","ST",
            "SA","SE","CH","SN","RS","SC","SL","ZW","SG","SK","SI","SO",
            "ES","LK","KN","LC","VC","ZA","SR","SZ","SY","TJ","TZ","TH",
            "TL","TG","TO","TT","TD","CZ","TN","TR","TM","TV","UG","UA",
            "HU","UY","UZ","VU","VA","VE","AE","US","GB","VN","CF","CY","SS","SD"];
    const selectedCountries = countryCodes.reduce((acc, key) => {
        if (key in allCountries) {
            acc[key] = allCountries[key];
        }
        return acc;
    }, {});


    const sortedCountries= Object.fromEntries(
        Object.entries(selectedCountries).sort(([,a],[,b]) => a.localeCompare(b, "de"))
    );
    console.log(sortedCountries);
    let firstOption = document.createElement("option");
    selectElement.appendChild(firstOption);
    for (const [countryCode, countryName] of Object.entries(sortedCountries))
    {
        let option = document.createElement("option");
        option.value = countryCode;
        option.text = countryName;
        selectElement.appendChild(option);
    }

    return selectElement;
}

export function getEnglishCountryList() {
    let selectElement = document.createElement("select");
    let allCountries = deAT.main["en-AT"].localeDisplayNames.territories;

    const countryCodes =
        ["AF","EG","AL","DZ","AD","AO","AG","GQ","AR","AM","AZ","ET","AU",
            "BS","BH","BD","BB","BY","BE","BZ","BJ","BT","BO","BA","BW",
            "BR","BN","BG","BF","BI","CL","CN","CR","CI","DK","DE","DM",
            "DO","DJ","EC","SV","ER","EE","FJ","FI","FR","GA","GM","GE",
            "GH","GD","GR","GT","GN","GW","GY","HT","HN","IN","ID","IQ",
            "IR","IE","IS","IL","IT","JM","JP","YE","JO","KH","CM","CA",
            "CV","KZ","QA","KE","KG","KI","CO","KM","CG","CD","KP","KR",
            "XK","HR","CU","KW","LA","LS","LV","LB","LR","LY","LI","LT",
            "LU","MG","MW","MY","MV","ML","MT","MA","MH","MR","MU","MK",
            "MX","FM","MD","MC","MN","ME","MZ","MM","NA","NR","NP","NZ",
            "NI","NL","NE","NG","NO","OM","AT","PK","PW","PA","PG","PY",
            "PE","PH","PL","PT","RW","RO","RU","SB","ZM","WS","SM","ST",
            "SA","SE","CH","SN","RS","SC","SL","ZW","SG","SK","SI","SO",
            "ES","LK","KN","LC","VC","ZA","SR","SZ","SY","TJ","TZ","TH",
            "TL","TG","TO","TT","TD","CZ","TN","TR","TM","TV","UG","UA",
            "HU","UY","UZ","VU","VA","VE","AE","US","GB","VN","CF","CY","SS","SD"];
    const selectedCountries = countryCodes.reduce((acc, key) => {
        if (key in allCountries) {
            acc[key] = allCountries[key];
        }
        return acc;
    }, {});


    const sortedCountries= Object.fromEntries(
        Object.entries(selectedCountries).sort(([,a],[,b]) => a.localeCompare(b, "de"))
    );
    console.log(sortedCountries);
    let firstOption = document.createElement("option");
    selectElement.appendChild(firstOption);
    for (const [countryCode, countryName] of Object.entries(sortedCountries))
    {
        let option = document.createElement("option");
        option.value = countryCode;
        option.text = countryName;
        selectElement.appendChild(option);
    }

    return selectElement;
}

export function getGermanCountryMapping() {
    const countries = {
        AF: 'Afghanistan',
        EG: 'Ägypten',
        AX: 'Åland',
        AL: 'Albanien',
        DZ: 'Algerien',
        VI: 'Amerikanische Jungferninseln',
        AS: 'Amerikanisch-Samoa',
        AD: 'Andorra',
        AO: 'Angola',
        AI: 'Anguilla',
        AQ: 'Antarktis',
        AG: 'Antigua und Barbuda',
        GQ: 'Äquatorialguinea',
        AR: 'Argentinien',
        AM: 'Armenien',
        AW: 'Aruba',
        AZ: 'Aserbaidschan',
        ET: 'Äthiopien',
        AU: 'Australien',
        BS: 'Bahamas',
        BH: 'Bahrain',
        BD: 'Bangladesch',
        BB: 'Barbados',
        BY: 'Belarus',
        BE: 'Belgien',
        BZ: 'Belize',
        BJ: 'Benin',
        BM: 'Bermuda',
        BT: 'Bhutan',
        BO: 'Bolivien',
        BQ: 'Bonaire, Saba, Sint Eustatius',
        BA: 'Bosnien and Herzegovina',
        BW: 'Botswana',
        BR: 'Brasilien',
        VG: 'Britische Jungferninseln',
        IO: 'Britisches Territorium im Indischen Ozean',
        BN: 'Brunei',
        BG: 'Bulgarien',
        BF: 'Burkina Faso',
        BI: 'Burundi',
        CL: 'Chile',
        CN: 'China',
        CK: 'Cookinseln',
        CR: 'Costa Rica',
        CI: "Côte d'Ivoire",
        CW: 'Curaçao',
        DK: 'Dänemark',
        DE: 'Deutschland',
        DM: 'Dominica',
        DO: 'Dominikanische Republik',
        DJ: 'Dschibuti',
        EC: 'Ecuador',
        SV: 'El Salvador',
        ER: 'Eritrea',
        EE: 'Estland',
        SZ: 'Eswatini',
        FK: 'Falklandinseln',
        FO: 'Färöer',
        FJ: 'Fidschi',
        FI: 'Finnland',
        FR: 'Frankreich',
        GF: 'Französisch-Guayana',
        PF: 'Französisch-Polynesien',
        GA: 'Gabun',
        GM: 'Gambia',
        GE: 'Georgien',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GD: 'Grenada',
        GR: 'Griechenland',
        GL: 'Grönland',
        GP: 'Guadeloupe',
        GU: 'Guam',
        GT: 'Guatemala',
        GG: 'Guernsey',
        GN: 'Guinea',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HT: 'Haiti',
        HN: 'Honduras',
        HK: 'Hongkong',
        IN: 'Indien',
        ID: 'Indonesien',
        IM: 'Insel Man',
        IR: 'Iran',
        IQ: 'Irak',
        IE: 'Irland',
        IS: 'Islan',
        IL: 'Israel',
        IT: 'Italien',
        JM: 'Jamaika',
        JP: 'Japan',
        YE: 'Jemen',
        JE: 'Jersey',
        JO: 'Jordanien',
        KY: 'Kaimaninseln',
        KH: 'Kambodscha',
        CM: 'Kamerun',
        CA: 'Kanada',
        CV: 'Kap Verde',
        KZ: 'Kasachstan',
        QA: 'Katar',
        KE: 'Kenia',
        KG: 'Kirgisistan',
        KI: 'Kiribati',
        CC: 'Kokosinseln',
        CO: 'Kolumbien',
        KM: 'Komoren',
        CG: 'Kongo',
        CD: 'Kongo, Demokratische Republik ',
        HR: 'Kroatien',
        CU: 'Kuba',
        KW: 'Kuwait',
        LA: 'Laos',
        LS: 'Lesotho',
        LV: 'Lettland',
        LB: 'Libanon',
        LR: 'Liberia',
        LY: 'Libyen',
        LI: 'Liechtenstein',
        LT: 'Litauen',
        LU: 'Luxemburg',
        MO: 'Macau',
        MG: 'Madagaskar',
        MW: 'Malawi',
        MY: 'Malaysia',
        MV: 'Malediven',
        ML: 'Mali',
        MT: 'Malta',
        MA: 'Marokko',
        MH: 'Marshallinseln',
        MQ: 'Martinique',
        MR: 'Mauretanien',
        MU: 'Mauritius',
        YT: 'Mayotte',
        MX: 'Mexiko',
        FM: 'Mikronesien',
        MD: 'Moldau',
        MC: 'Monaco',
        MN: 'Mongolei',
        ME: 'Montenegro',
        MS: 'Montserrat',
        MZ: 'Mosambik',
        MM: 'Myanmar',
        NA: 'Namibia',
        NR: 'Nauru',
        NP: 'Nepal',
        NC: 'Neukaledonien',
        NZ: 'Neuseeland',
        NI: 'Nicaragua',
        NL: 'Niederlande',
        NE: 'Niger',
        NG: 'Nigeria',
        NU: 'Niue',
        KP: 'Nordkorea',
        MP: 'Nördliche Marianen',
        MK: 'Nordmazedonien',
        NF: 'Norfolkinsel',
        NO: 'Norwegen',
        OM: 'Oman',
        AT: 'Österreich',
        TL: 'Osttimor',
        PK: 'Pakistan',
        PS: 'Palästina',
        PW: 'Palau',
        PA: 'Panama',
        PG: 'Papua-Neuguinea',
        PY: 'Paraguay',
        PE: 'Peru',
        PH: 'Philippinen',
        PN: 'Pitcairninseln',
        PL: 'Polen',
        PT: 'Portugal',
        PR: 'Puerto Rico',
        RE: 'Réunion',
        RW: 'Ruanda',
        RO: 'Rumänien',
        RU: 'Russland',
        MF: 'Saint-Martin',
        SB: 'Salomonen',
        ZM: 'Sambia',
        WS: 'Samoa',
        SM: 'San Marino',
        ST: 'São Tomé und Príncipe',
        SA: 'Saudi-Arabien',
        SE: 'Schweden',
        CH: 'Schweiz',
        SN: 'Senegal',
        RS: 'Serbien',
        SC: 'Seychellen',
        SL: 'Sierra Leone',
        ZW: 'Simbabwe',
        SG: 'Singapur',
        SX: 'Sint Maarten',
        SK: 'Slowakei',
        SI: 'Slowenien',
        SO: 'Somalia',
        ES: 'Spanien',
        LK: 'Sri Lanka',
        BL: 'St. Barthélemy',
        SH: 'St. Helena, Ascension und Tristan da Cunha',
        KN: 'St. Kitts und Nevis',
        LC: 'St. Lucia',
        PM: 'Saint-Pierre und Miquelon',
        VC: 'St. Vincent und die Grenadinen',
        ZA: 'Südafrika',
        SD: 'Sudan',
        GS: 'Südgeorgien und die Südlichen Sandwichinseln',
        KR: 'Südkorea',
        SS: 'Südsudan',
        SR: 'Suriname',
        SY: 'Syrien',
        TJ: 'Tadschikistan',
        TW: 'Taiwan',
        TZ: 'Tansania',
        TH: 'Thailand',
        TG: 'Togo',
        TK: 'Tokelau',
        TO: 'Tonga',
        TT: 'Trinidad und Tobago',
        TD: 'Tschad',
        CZ: 'Tschechien',
        TN: 'Tunesien',
        TR: 'Türkei',
        TM: 'Turkmenistan',
        TC: 'Turks- und Caicosinseln',
        TV: 'Tuvalu',
        UG: 'Uganda',
        UA: 'Ukraine',
        HU: 'Ungarn',
        UY: 'Uruguay',
        UZ: 'Usbekistan',
        VU: 'Vanuatu',
        VA: 'Vatikanstadt',
        VE: 'Venezuela',
        AE: 'Vereinigte Arabische Emirate',
        US: 'Vereinigte Staaten',
        GB: 'Vereinigtes Königreich von Großbritannien und Nordirland',
        VN: 'Vietnam',
        WF: 'Wallis und Futuna',
        CX: 'Weihnachtsinsel',
        EH: 'Westsahara',
        CF: 'Zentralafrikanische Republik',
        CY: 'Zypern',
    };
    return countries;
}

export function getEnglishCountryMapping() {
    const countries = {
        AF: 'Afghanistan',
        AX: 'Åland',
        AL: 'Albania',
        DZ: 'Algeria',
        AS: 'American Samoa',
        AD: 'Andorra',
        AO: 'Angola',
        AI: 'Anguilla',
        AQ: 'Antarctica',
        AG: 'Antigua and Barbuda',
        AR: 'Argentina',
        AM: 'Armenia',
        AW: 'Aruba',
        AU: 'Australia',
        AT: 'Austria',
        AZ: 'Azerbaijan',
        BS: 'Bahamas',
        BH: 'Bahrain',
        BD: 'Bangladesh',
        BB: 'Barbados',
        BY: 'Belarus',
        BE: 'Belgium',
        BZ: 'Belize',
        BJ: 'Benin',
        BM: 'Bermuda',
        BT: 'Bhutan',
        BO: 'Bolivia',
        BQ: 'Bonaire, Saba, Sint Eustatius',
        BA: 'Bosnia and Herzegovina',
        BW: 'Botswana',
        BR: 'Brazil',
        IO: 'British Indian Ocean Territory',
        BN: 'Brunei Darussalam',
        BG: 'Bulgaria',
        BF: 'Burkina Faso',
        BI: 'Burundi',
        CV: 'Cabo Verde',
        KH: 'Cambodia',
        CM: 'Cameroon',
        CA: 'Canada',
        KY: 'Cayman Islands',
        CF: 'Central African Republic',
        TD: 'Chad',
        CL: 'Chile',
        CN: 'China',
        CX: 'Christmas Island',
        CC: 'Cocos Islands',
        CO: 'Colombia',
        KM: 'Comoros',
        CG: 'Congo',
        CD: 'Congo, the Democratic Republic of the',
        CK: 'Cook Islands',
        CR: 'Costa Rica',
        CI: "Côte d'Ivoire",
        HR: 'Croatia',
        CU: 'Cuba',
        CW: 'Curaçao',
        CY: 'Cyprus',
        CZ: 'Czechia',
        DK: 'Denmark',
        DJ: 'Djibouti',
        DM: 'Dominica',
        DO: 'Dominican Republic',
        EC: 'Ecuador',
        EG: 'Egypt',
        SV: 'El Salvador',
        GQ: 'Equatorial Guinea',
        ER: 'Eritrea',
        EE: 'Estonia',
        SZ: 'Eswatini',
        ET: 'Ethiopia',
        FK: 'Falkland Islands (Malvinas)',
        FO: 'Faroe Islands',
        FJ: 'Fiji',
        FI: 'Finland',
        FR: 'France',
        GF: 'French Guiana',
        PF: 'French Polynesia',
        TF: 'French Southern Territories',
        GA: 'Gabon',
        GM: 'Gambia',
        GE: 'Georgia',
        DE: 'Germany',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GR: 'Greece',
        GL: 'Greenland',
        GD: 'Grenada',
        GP: 'Guadeloupe',
        GU: 'Guam',
        GT: 'Guatemala',
        GG: 'Guernsey',
        GN: 'Guinea',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HT: 'Haiti',
        VA: 'Holy See',
        HN: 'Honduras',
        HK: 'Hong Kong',
        HU: 'Hungary',
        IS: 'Iceland',
        IN: 'India',
        ID: 'Indonesia',
        IR: 'Iran',
        IQ: 'Iraq',
        IE: 'Ireland',
        IM: 'Isle of Man',
        IL: 'Israel',
        IT: 'Italy',
        JM: 'Jamaica',
        JP: 'Japan',
        JE: 'Jersey',
        JO: 'Jordan',
        KZ: 'Kazakhstan',
        KE: 'Kenya',
        KI: 'Kiribati',
        KW: 'Kuwait',
        KG: 'Kyrgyzstan',
        LA: "Lao People's Democratic Republic",
        LV: 'Latvia',
        LB: 'Lebanon',
        LS: 'Lesotho',
        LR: 'Liberia',
        LY: 'Libya',
        LI: 'Liechtenstein',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        MO: 'Macao',

        MG: 'Madagascar',
        MW: 'Malawi',
        MY: 'Malaysia',
        MV: 'Maldives',
        ML: 'Mali',
        MT: 'Malta',
        MH: 'Marshall Islands',
        MQ: 'Martinique',
        MR: 'Mauritania',
        MU: 'Mauritius',
        YT: 'Mayotte',
        MX: 'Mexico',
        FM: 'Micronesia',
        MD: 'Moldovaf',
        MC: 'Monaco',
        MN: 'Mongolia',
        ME: 'Montenegro',
        MS: 'Montserrat',
        MA: 'Morocco',
        MZ: 'Mozambique',
        MM: 'Myanmar',
        NA: 'Namibia',
        NR: 'Nauru',
        NP: 'Nepal',
        NL: 'Netherlands',
        NC: 'New Caledonia',
        NZ: 'New Zealand',
        NI: 'Nicaragua',
        NE: 'Niger',
        NG: 'Nigeria',
        NU: 'Niue',
        NF: 'Norfolk Island',
        KP: 'North Korea',
        MK: 'North Macedonia',
        MP: 'Northern Mariana Islands',
        NO: 'Norway',
        OM: 'Oman',
        PK: 'Pakistan',
        PW: 'Palau',
        PS: 'Palestine, State of',
        PA: 'Panama',
        PG: 'Papua New Guinea',
        PY: 'Paraguay',
        PE: 'Peru',
        PH: 'Philippines',
        PN: 'Pitcairn',
        PL: 'Poland',
        PT: 'Portugal',
        PR: 'Puerto Rico',
        QA: 'Qatar',
        RE: 'Réunion',
        RO: 'Romania',
        RU: 'Russia',
        RW: 'Rwanda',
        BL: 'Saint Barthélemy',
        SH: 'Saint Helena, Ascension and Tristan da Cunha',
        KN: 'Saint Kitts and Nevis',
        LC: 'Saint Lucia',
        MF: 'Saint Martin (French part)',
        PM: 'Saint Pierre and Miquelon',
        VC: 'Saint Vincent and the Grenadines',
        WS: 'Samoa',
        SM: 'San Marino',
        ST: 'Sao Tome and Principe',
        SA: 'Saudi Arabia',
        SN: 'Senegal',
        RS: 'Serbia',
        SC: 'Seychelles',
        SL: 'Sierra Leone',
        SG: 'Singapore',
        SX: 'Sint Maarten (Dutch part)',
        SK: 'Slovakia',
        SI: 'Slovenia',
        SB: 'Solomon Islands',
        SO: 'Somalia',
        ZA: 'South Africa',
        GS: 'South Georgia and the South Sandwich Islands',
        KR: 'South Korea',
        SS: 'South Sudan',
        ES: 'Spain',
        LK: 'Sri Lanka',
        SD: 'Sudan',
        SR: 'Suriname',
        SE: 'Sweden',
        CH: 'Switzerland',
        SY: 'Syrian Arab Republic',
        TW: 'Taiwan',
        TJ: 'Tajikistan',
        TZ: 'Tanzania, United Republic of',
        TH: 'Thailand',
        TL: 'Timor-Leste',
        TG: 'Togo',
        TK: 'Tokelau',
        TO: 'Tonga',
        TT: 'Trinidad and Tobago',
        TN: 'Tunisia',
        TR: 'Turkey',
        TM: 'Turkmenistan',
        TC: 'Turks and Caicos Islands',
        TV: 'Tuvalu',
        UG: 'Uganda',
        UA: 'Ukraine',
        AE: 'United Arab Emirates',
        GB: 'United Kingdom of Great Britain and Northern Ireland',
        US: 'United States of America',
        UY: 'Uruguay',
        UZ: 'Uzbekistan',
        VU: 'Vanuatu',
        VE: 'Venezuela, Bolivarian Republic of',
        VN: 'Vietnam',
        VG: 'Virgin Islands (British)',
        VI: 'Virgin Islands (U.S.)',
        WF: 'Wallis and Futuna',
        EH: 'Western Sahara',
        YE: 'Yemen',
        ZM: 'Zambia',
        ZW: 'Zimbabwe',
    };
    return countries;
}

import {html} from 'lit';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as commonUtils from '@dbp-toolkit/common/utils';
import deAT from 'cldr-localenames-full/main/de-AT/territories.json';

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
    const countries = deAT.main["de-AT"].localeDisplayNames.territories;
    const countryCodes =
        ["AF","EG","AL","DZ","AD","AO","AG","GQ","AR","AM","AZ","ET","AU","BS","BH","BD","BB","BY","BE","BZ","BJ","BT","BO","BA","BW","BR","BN","BG","BF","BI","CL","CN","CR","CI","DK","DE","DM","DO","DJ","EC","SV","ER","EE","FJ","FI","FR","GA","GM","GE","GH","GD","GR","GT","GN","GW","GY","HT","HN","IN","ID","IQ","IR","IE","IS","IL","IT","JM","JP","YE","JO","KH","CM","CA","CV","KZ","QA","KE","KG","KI","CO","KM","CG","CD","KP","KR","XK","HR","CU","KW","LA","LS","LV","LB","LR","LY","LI","LT","LU","MG","MW","MY","MV","ML","MT","MA","MH","MR","MU","MK","MX","FM","MD","MC","MN","ME","MZ","MM","NA","NR","NP","NZ","NI","NL","NE","NG","NO","OM","AT","PK","PW","PA","PG","PY","PE","PH","PL","PT","RW","RO","RU","SB","ZM","WS","SM","ST","SA","SE","CH","SN","RS","SC","SL","ZW","SG","SK","SI","SO","ES","LK","KN","LC","VC","ZA","SR","SZ","SY","TJ","TZ","TH","TL","TG","TO","TT","TD","CZ","TN","TR","TM","TV","UG","UA","HU","UY","UZ","VU","VA","VE","AE","US","GB","VN","CF","CY","SS","SD"];
    let firstOption = document.createElement("option");
    selectElement.appendChild(firstOption);
    for (let countryCode of countryCodes)
    {
        let option = document.createElement("option");
        option.value = countryCode;
        option.text = countries[countryCode];
        selectElement.appendChild(option);
    }

    return selectElement;

    /*return html`
        <option value></option>
        <option value="AF">Afghanistan</option>
        <option value="EG">Ägypten</option>
        <option value="AX">Åland</option>
        <option value="AL">Albanien</option>
        <option value="DZ">Algerien</option>
        <option value="VI">Amerikanische Jungferninseln</option>
        <option value="AS">Amerikanisch-Samoa</option>
        <option value="AD">Andorra</option>
        <option value="AO">Angola</option>
        <option value="AI">Anguilla</option>
        <option value="AQ">Antarktis</option>
        <option value="AG">Antigua und Barbuda</option>
        <option value="GQ">Äquatorialguinea</option>
        <option value="AR">Argentinien</option>
        <option value="AM">Armenien</option>
        <option value="AW">Aruba</option>
        <option value="AZ">Aserbaidschan</option>
        <option value="ET">Äthiopien</option>
        <option value="AU">Australien</option>
        <option value="BS">Bahamas</option>
        <option value="BH">Bahrain</option>
        <option value="BD">Bangladesch</option>
        <option value="BB">Barbados</option>
        <option value="BY">Belarus</option>
        <option value="BE">Belgien</option>
        <option value="BZ">Belize</option>
        <option value="BJ">Benin</option>
        <option value="BM">Bermuda</option>
        <option value="BT">Bhutan</option>
        <option value="BO">Bolivien</option>
        <option value="BQ">Bonaire, Saba, Sint Eustatius</option>
        <option value="BA">Bosnien und Herzegovina</option>
        <option value="BW">Botswana</option>
        <option value="BR">Brasilien</option>
        <option value="VG">Britische Jungferninseln</option>
        <option value="IO">Britisches Territorium im Indischen Ozean</option>
        <option value="BN">Brunei</option>
        <option value="BG">Bulgarien</option>
        <option value="BF">Burkina Faso</option>
        <option value="BI">Burundi</option>
        <option value="CL">Chile</option>
        <option value="CN">China</option>
        <option value="CK">Cookinseln</option>
        <option value="CR">Costa Rica</option>
        <option value="CI">Côte d'Ivoire</option>
        <option value="CW">Curaçao</option>
        <option value="DK">Dänemark</option>
        <option value="DE">Deutschland</option>
        <option value="DM">Dominica</option>
        <option value="DO">Dominikanische Republik</option>
        <option value="DJ">Dschibuti</option>
        <option value="EC">Ecuador</option>
        <option value="SV">El Salvador</option>
        <option value="ER">Eritrea</option>
        <option value="EE">Estland</option>
        <option value="SZ">Eswatini</option>
        <option value="FK">Falklandinseln</option>
        <option value="FO">Färöer</option>
        <option value="FJ">Fidschi</option>
        <option value="FI">Finnland</option>
        <option value="FR">Frankreich</option>
        <option value="GF">Französisch-Guayana</option>
        <option value="PF">Französisch-Polynesien</option>
        <option value="GA">Gabun</option>
        <option value="GM">Gambia</option>
        <option value="GE">Georgien</option>
        <option value="GH">Ghana</option>
        <option value="GI">Gibraltar</option>
        <option value="GD">Grenada</option>
        <option value="GR">Griechenland</option>
        <option value="GL">Grönland</option>
        <option value="GP">Guadeloupe</option>
        <option value="GU">Guam</option>
        <option value="GT">Guatemala</option>
        <option value="GG">Guernsey</option>
        <option value="GN">Guinea</option>
        <option value="GW">Guinea-Bissau</option>
        <option value="GY">Guyana</option>
        <option value="HT">Haiti</option>
        <option value="HN">Honduras</option>
        <option value="HK">Hongkong</option>
        <option value="IN">Indien</option>
        <option value="ID">Indonesien</option>
        <option value="IM">Insel Man</option>
        <option value="IQ">Irak</option>
        <option value="IR">Iran</option>
        <option value="IE">Irland</option>
        <option value="IS">Island</option>
        <option value="IL">Israel</option>
        <option value="IT">Italien</option>
        <option value="JM">Jamaika</option>
        <option value="JP">Japan</option>
        <option value="YE">Jemen</option>
        <option value="JE">Jersey</option>
        <option value="JO">Jordanien</option>
        <option value="KY">Kaimaninseln</option>
        <option value="KH">Kambodscha</option>
        <option value="CM">Kamerun</option>
        <option value="CA">Kanada</option>
        <option value="CV">Kap Verde</option>
        <option value="KZ">Kasachstan</option>
        <option value="QA">Katar</option>
        <option value="KE">Kenia</option>
        <option value="KG">Kirgisistan</option>
        <option value="KI">Kiribati</option>
        <option value="CC">Kokosinseln</option>
        <option value="CO">Kolumbien</option>
        <option value="KM">Komoren</option>
        <option value="CG">Kongo</option>
        <option value="CD">Kongo, Demokratische Republik</option>
        <option value="HR">Kroatien</option>
        <option value="CU">Kuba</option>
        <option value="KW">Kuwait</option>
        <option value="LA">Laos</option>
        <option value="LS">Lesotho</option>
        <option value="LV">Lettland</option>
        <option value="LB">Libanon</option>
        <option value="LR">Liberia</option>
        <option value="LY">Libyen</option>
        <option value="LI">Liechtenstein</option>
        <option value="LT">Litauen</option>
        <option value="LU">Luxemburg</option>
        <option value="MO">Macau</option>
        <option value="MG">Madagaskar</option>
        <option value="MW">Malawi</option>
        <option value="MY">Malaysia</option>
        <option value="MV">Malediven</option>
        <option value="ML">Mali</option>
        <option value="MT">Malta</option>
        <option value="MA">Marokko</option>
        <option value="MH">Marshallinseln</option>
        <option value="MQ">Martinique</option>
        <option value="MR">Mauretanien</option>
        <option value="MU">Mauritius</option>
        <option value="YT">Mayotte</option>
        <option value="MX">Mexiko</option>
        <option value="FM">Mikronesien</option>
        <option value="MD">Moldau</option>
        <option value="MC">Monaco</option>
        <option value="MN">Mongolei</option>
        <option value="ME">Montenegro</option>
        <option value="MS">Montserrat</option>
        <option value="MZ">Mosambik</option>
        <option value="MM">Myanmar</option>
        <option value="NA">Namibia</option>
        <option value="NR">Nauru</option>
        <option value="NP">Nepal</option>
        <option value="NC">Neukaledonien</option>
        <option value="NZ">Neuseeland</option>
        <option value="NI">Nicaragua</option>
        <option value="NL">Niederlande</option>
        <option value="NE">Niger</option>
        <option value="NG">Nigeria</option>
        <option value="NU">Niue</option>
        <option value="KP">Nordkorea</option>
        <option value="MP">Nördlichen Marianen</option>
        <option value="MK">Nordmazedonien</option>
        <option value="NF">Norfolkinseln</option>
        <option value="NO">Norwegen</option>
        <option value="OM">Oman</option>
        <option value="AT" selected="selected">Österreich</option>
        <option value="TL">Osttimor</option>
        <option value="PK">Pakistan</option>
        <option value="PS">Palästina</option>
        <option value="PW">Palau</option>
        <option value="PA">Panama</option>
        <option value="PG">Papua-Neuguinea</option>
        <option value="PY">Paraguay</option>
        <option value="PE">Peru</option>
        <option value="PH">Philippinen</option>
        <option value="PN">Pitcairninseln</option>
        <option value="PL">Polen</option>
        <option value="PT">Portugal</option>
        <option value="PR">Puerto Rico</option>
        <option value="RE">Réunion</option>
        <option value="RW">Ruanda</option>
        <option value="RO">Rumänien</option>
        <option value="RU">Russland</option>
        <option value="MF">Saint-Martin</option>
        <option value="SB">Salomonen</option>
        <option value="ZM">Sambia</option>
        <option value="WS">Samoa</option>
        <option value="SM">San Marino</option>
        <option value="ST">São Tomé und Príncipe</option>
        <option value="SA">Saudi-Arabien</option>
        <option value="SE">Schweden</option>
        <option value="CH">Schweiz</option>
        <option value="SN">Senegal</option>
        <option value="RS">Serbien</option>
        <option value="SC">Seychellen</option>
        <option value="SL">Sierra Leone</option>
        <option value="ZW">Simbabwe</option>
        <option value="SG">Singapur</option>
        <option value="SX">Sint Maarten</option>
        <option value="SK">Slowakei</option>
        <option value="SI">Slowenien</option>
        <option value="SO">Somalia</option>
        <option value="ES">Spanien</option>
        <option value="LK">Sri Lanka</option>
        <option value="BL">St. Barthélemy</option>
        <option value="SH">St. Helena, Ascension und Tristan da Cunha</option>
        <option value="KN">St. Kitts und Nevis</option>
        <option value="LC">St. Lucia</option>
        <option value="PM">Saint-Pierre und Miquelon</option>
        <option value="VC">St. Vincent und die Grenadinen</option>
        <option value="ZA">Südafrika</option>
        <option value="SD">Sudan</option>
        <option value="GS">Südgeorgien und die Südlichen Sandwichinseln</option>
        <option value="KR">Südkorea</option>
        <option value="SS">Südsudan</option>
        <option value="SR">Suriname</option>
        <option value="SY">Syrien</option>
        <option value="TJ">Tadschikistan</option>
        <option value="TW">Taiwan</option>
        <option value="TZ">Tansania</option>
        <option value="TH">Thailand</option>
        <option value="TG">Togo</option>
        <option value="TK">Tokelau</option>
        <option value="TO">Tonga</option>
        <option value="TT">Trinidad und Tobago</option>
        <option value="TA">Tristan da Cunha</option>
        <option value="TD">Tschad</option>
        <option value="CZ">Tschechien</option>
        <option value="TN">Tunesien</option>
        <option value="TR">Türkei</option>
        <option value="TM">Turkmenistan</option>
        <option value="TC">Turks- und Caicosinseln</option>
        <option value="TV">Tuvalu</option>
        <option value="UG">Uganda</option>
        <option value="UA">Ukraine</option>
        <option value="HU">Ungarn</option>
        <option value="UY">Uruguay</option>
        <option value="UZ">Usbekistan</option>
        <option value="VU">Vanuatu</option>
        <option value="VA">Vatikanstadt</option>
        <option value="VE">Venezuela</option>
        <option value="AE">Vereinigte Arabische Emirate</option>
        <option value="US">Vereinigte Staaten</option>
        <option value="GB">Vereinigtes Königreich von Großbritannien und Nordirland</option>
        <option value="VN">Vietnam</option>
        <option value="WF">Wallis und Futuna</option>
        <option value="CX">Weihnachtsinsel</option>
        <option value="EH">Westsahara</option>
        <option value="CF">Zentralafrikanische Republik</option>
        <option value="CY">Zypern</option>
    `;*/
}

export function getEnglishCountryList() {
    return html`
        <option value></option>
        <option value="AF">Afghanistan</option>
        <option value="AX">Åland</option>
        <option value="AL">Albania</option>
        <option value="DZ">Algeria</option>
        <option value="AS">American Samoa</option>
        <option value="AD">Andorra</option>
        <option value="AO">Angola</option>
        <option value="AI">Anguilla</option>
        <option value="AQ">Antarctica</option>
        <option value="AG">Antigua and Barbuda</option>
        <option value="AR">Argentina</option>
        <option value="AM">Armenia</option>
        <option value="AW">Aruba</option>
        <option value="AU">Australia</option>
        <option value="AT" selected="selected">Austria</option>
        <option value="AZ">Azerbaijan</option>
        <option value="BS">Bahamas</option>
        <option value="BH">Bahrain</option>
        <option value="BD">Bangladesh</option>
        <option value="BB">Barbados</option>
        <option value="BY">Belarus</option>
        <option value="BE">Belgium</option>
        <option value="BZ">Belize</option>
        <option value="BJ">Benin</option>
        <option value="BM">Bermuda</option>
        <option value="BT">Bhutan</option>
        <option value="BO">Bolivia</option>
        <option value="BQ">Bonaire, Saba, Sint Eustatius</option>
        <option value="BA">Bosnia and Herzegovina</option>
        <option value="BW">Botswana</option>
        <option value="BR">Brazil</option>
        <option value="IO">British Indian Ocean Territory</option>
        <option value="BN">Brunei Darussalam</option>
        <option value="BG">Bulgaria</option>
        <option value="BF">Burkina Faso</option>
        <option value="BI">Burundi</option>
        <option value="CV">Cabo Verde</option>
        <option value="KH">Cambodia</option>
        <option value="CM">Cameroon</option>
        <option value="CA">Canada</option>
        <option value="KY">Cayman Islands</option>
        <option value="CF">Central African Republic</option>
        <option value="TD">Chad</option>
        <option value="CL">Chile</option>
        <option value="CN">China</option>
        <option value="CX">Christmas Island</option>
        <option value="CC">Cocos Islands</option>
        <option value="CO">Colombia</option>
        <option value="KM">Comoros</option>
        <option value="CG">Congo</option>
        <option value="CD">Congo, the Democratic Republic of the</option>
        <option value="CK">Cook Islands</option>
        <option value="CR">Costa Rica</option>
        <option value="CI">Côte d'Ivoire</option>
        <option value="HR">Croatia</option>
        <option value="CU">Cuba</option>
        <option value="CW">Curaçao</option>
        <option value="CY">Cyprus</option>
        <option value="CZ">Czechia</option>
        <option value="DK">Denmark</option>
        <option value="DJ">Djibouti</option>
        <option value="DM">Dominica</option>
        <option value="DO">Dominican Republic</option>
        <option value="EC">Ecuador</option>
        <option value="EG">Egypt</option>
        <option value="SV">El Salvador</option>
        <option value="GQ">Equatorial Guinea</option>
        <option value="ER">Eritrea</option>
        <option value="EE">Estonia</option>
        <option value="SZ">Eswatini</option>
        <option value="ET">Ethiopia</option>
        <option value="FK">Falkland Islands</option>
        <option value="FO">Faroe Islands</option>
        <option value="FJ">Fiji</option>
        <option value="FI">Finland</option>
        <option value="FR">France</option>
        <option value="GF">French Guiana</option>
        <option value="PF">French Polynesia</option>
        <option value="TF">French Southern Territories</option>
        <option value="GA">Gabon</option>
        <option value="GM">Gambia</option>
        <option value="GE">Georgia</option>
        <option value="DE">Germany</option>
        <option value="GH">Ghana</option>
        <option value="GI">Gibraltar</option>
        <option value="GR">Greece</option>
        <option value="GL">Greenland</option>
        <option value="GD">Grenada</option>
        <option value="GP">Guadeloupe</option>
        <option value="GU">Guam</option>
        <option value="GT">Guatemala</option>
        <option value="GG">Guernsey</option>
        <option value="GN">Guinea</option>
        <option value="GW">Guinea-Bissau</option>
        <option value="GY">Guyana</option>
        <option value="HT">Haiti</option>
        <option value="VA">Holy See</option>
        <option value="HN">Honduras</option>
        <option value="HK">Hong Kong</option>
        <option value="HU">Hungary</option>
        <option value="IS">Iceland</option>
        <option value="IN">India</option>
        <option value="ID">Indonesia</option>
        <option value="IR">Iran</option>
        <option value="IQ">Iraq</option>
        <option value="IE">Ireland</option>
        <option value="IM">Isle of Man</option>
        <option value="IL">Israel</option>
        <option value="IT">Italy</option>
        <option value="JM">Jamaica</option>
        <option value="JP">Japan</option>
        <option value="JE">Jersey</option>
        <option value="JO">Jordan</option>
        <option value="KZ">Kazakhstan</option>
        <option value="KE">Kenya</option>
        <option value="KI">Kiribati</option>
        <option value="KW">Kuwait</option>
        <option value="KG">Kyrgyzstan</option>
        <option value="LA">Lao People's Democratic Republic</option>
        <option value="LV">Latvia</option>
        <option value="LB">Lebanon</option>
        <option value="LS">Lesotho</option>
        <option value="LR">Liberia</option>
        <option value="LY">Libya</option>
        <option value="LI">Liechtenstein</option>
        <option value="LT">Lithuania</option>
        <option value="LU">Luxembourg</option>
        <option value="MO">Macao</option>
        <option value="MG">Madagascar</option>
        <option value="MW">Malawi</option>
        <option value="MY">Malaysia</option>
        <option value="MV">Maldives</option>
        <option value="ML">Mali</option>
        <option value="MT">Malta</option>
        <option value="MH">Marshall Islands</option>
        <option value="MQ">Martinique</option>
        <option value="MR">Mauritania</option>
        <option value="MU">Mauritius</option>
        <option value="YT">Mayotte</option>
        <option value="MX">Mexico</option>
        <option value="FM">Micronesia</option>
        <option value="MD">Moldova</option>
        <option value="MC">Monaco</option>
        <option value="MN">Mongolia</option>
        <option value="ME">Montenegro</option>
        <option value="MS">Montserrat</option>
        <option value="MA">Morocco</option>
        <option value="MZ">Mozambique</option>
        <option value="MM">Myanmar</option>
        <option value="NA">Namibia</option>
        <option value="NR">Nauru</option>
        <option value="NP">Nepal</option>
        <option value="NL">Netherlands</option>
        <option value="NC">New Caledonia</option>
        <option value="NZ">New Zealand</option>
        <option value="NI">Nicaragua</option>
        <option value="NE">Niger</option>
        <option value="NG">Nigeria</option>
        <option value="NU">Niue</option>
        <option value="NF">Norfolk Island</option>
        <option value="KP">North Korea</option>
        <option value="MK">North Macedonia</option>
        <option value="MP">Northern Mariana Islands</option>
        <option value="NO">Norway</option>
        <option value="OM">Oman</option>
        <option value="PK">Pakistan</option>
        <option value="PW">Palau</option>
        <option value="PS">Palestine, State of</option>
        <option value="PA">Panama</option>
        <option value="PG">Papua New Guinea</option>
        <option value="PY">Paraguay</option>
        <option value="PE">Peru</option>
        <option value="PH">Philippines</option>
        <option value="PN">Pitcairn</option>
        <option value="PL">Poland</option>
        <option value="PT">Portugal</option>
        <option value="PR">Puerto Rico</option>
        <option value="QA">Qatar</option>
        <option value="RE">Réunion</option>
        <option value="RO">Romania</option>
        <option value="RU">Russia</option>
        <option value="RW">Rwanda</option>
        <option value="BL">Saint Barthélemy</option>
        <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
        <option value="KN">Saint Kitts and Nevis</option>
        <option value="LC">Saint Lucia</option>
        <option value="MF">Saint Martin (French part)</option>
        <option value="PM">Saint Pierre and Miquelon</option>
        <option value="VC">Saint Vincent and the Grenadines</option>
        <option value="WS">Samoa</option>
        <option value="SM">San Marino</option>
        <option value="ST">Sao Tome and Principe</option>
        <option value="SA">Saudi Arabia</option>
        <option value="SN">Senegal</option>
        <option value="RS">Serbia</option>
        <option value="SC">Seychelles</option>
        <option value="SL">Sierra Leone</option>
        <option value="SG">Singapore</option>
        <option value="SX">Sint Maarten (Dutch part)</option>
        <option value="SK">Slovakia</option>
        <option value="SI">Slovenia</option>
        <option value="SB">Solomon Islands</option>
        <option value="SO">Somalia</option>
        <option value="ZA">South Africa</option>
        <option value="GS">South Georgia and the South Sandwich Islands</option>
        <option value="KR">South Korea</option>
        <option value="SS">South Sudan</option>
        <option value="ES">Spain</option>
        <option value="LK">Sri Lanka</option>
        <option value="SD">Sudan</option>
        <option value="SR">Suriname</option>
        <option value="SE">Sweden</option>
        <option value="CH">Switzerland</option>
        <option value="SY">Syrian Arab Republic</option>
        <option value="TW">Taiwan</option>
        <option value="TJ">Tajikistan</option>
        <option value="TZ">Tanzania, United Republic of</option>
        <option value="TH">Thailand</option>
        <option value="TL">Timor-Leste</option>
        <option value="TG">Togo</option>
        <option value="TK">Tokelau</option>
        <option value="TO">Tonga</option>
        <option value="TT">Trinidad and Tobago</option>
        <option value="TN">Tunisia</option>
        <option value="TR">Turkey</option>
        <option value="TM">Turkmenistan</option>
        <option value="TC">Turks and Caicos Islands</option>
        <option value="TV">Tuvalu</option>
        <option value="UG">Uganda</option>
        <option value="UA">Ukraine</option>
        <option value="AE">United Arab Emirates</option>
        <option value="GB">United Kingdom of Great Britain and Northern Ireland</option>
        <option value="US">United States of America</option>
        <option value="UY">Uruguay</option>
        <option value="UZ">Uzbekistan</option>
        <option value="VU">Vanuatu</option>
        <option value="VE">Venezuela, Bolivarian Republic of</option>
        <option value="VN">Vietnam</option>
        <option value="VG">Virgin Islands (British)</option>
        <option value="VI">Virgin Islands (U.S.)</option>
        <option value="WF">Wallis and Futuna</option>
        <option value="EH">Western Sahara</option>
        <option value="YE">Yemen</option>
        <option value="ZM">Zambia</option>
        <option value="ZW">Zimbabwe</option>
    `;
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

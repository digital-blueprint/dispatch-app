import {html} from 'lit';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import * as commonUtils from "@dbp-toolkit/common/utils";

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
                if (referenceNumber === null && annotation.contents.startsWith('dbp_annotation_bbe3a371=')) {
                    let contents = annotation.contents;
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
    return html`
        <option value></option>
        <option value="AF">Afghanistan</option>
        <option value="AX">Ålandinseln</option>
        <option value="AL">Albanien</option>
        <option value="DZ">Algerien</option>
        <option value="AS">Amerikanisch-Samoa</option>
        <option value="AD">Andorra</option>
        <option value="AO">Angola</option>
        <option value="AI">Anguilla</option>
        <option value="AQ">Antarktis</option>
        <option value="AG">Antigua und Barbuda</option>
        <option value="AR">Argentinien</option>
        <option value="AM">Armenien</option>
        <option value="AW">Aruba</option>
        <option value="AU">Australien</option>
        <option value="AZ">Aserbaidschan</option>
        <option value="EG">Ägypten</option>
        <option value="GQ">Äquatorialguinea</option>
        <option value="ET">Äthiopien</option>
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
        <option value="BO">Bolivien, Plurinationaler Staat</option>
        <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
        <option value="BA">Bosnien und Herzegovina</option>
        <option value="BW">Botsuana</option>
        <option value="BV">Bouvetinsel</option>
        <option value="BR">Brasilien</option>
        <option value="IO">Britisches Territorium im Indischen Ozean</option>
        <option value="BN">Brunei Darussalam</option>
        <option value="BG">Bulgarien</option>
        <option value="BF">Burkina Faso</option>
        <option value="BI">Burundi</option>
        <option value="KY">Cayman-Inseln</option>
        <option value="CL">Chile</option>
        <option value="CN">China</option>
        <option value="CD">Congo, Demokratische Republik</option>
        <option value="CK">Cook Inseln</option>
        <option value="CR">Costa Rica</option>
        <option value="CW">Curaçao</option>
        <option value="DK">Dänemark</option>
        <option value="LA">Demokratische Volksrepublik Laos</option>
        <option value="DE">Deutschland</option>
        <option value="DJ">Dschibuti</option>
        <option value="DM">Dominica</option>
        <option value="DO">die Dominikanische Republik</option>
        <option value="EC">Ekuador</option>
        <option value="SV">El Salvador</option>
        <option value="CI">Elfenbeinküste</option>
        <option value="ER">Eritrea</option>
        <option value="EE">Estland</option>
        <option value="FK">Falklandinseln (Malvinen)</option>
        <option value="FO">Färöer-Inseln</option>
        <option value="FJ">Fidschi</option>
        <option value="FI">Finnland</option>
        <option value="FR">Frankreic</option>
        <option value="GF">Französisch-Guayana</option>
        <option value="PF">Französisch-Polynesien</option>
        <option value="TF">Französische Süd- und Antarktisgebiete</option>
        <option value="GA">Gabun</option>
        <option value="GM">Gambia</option>
        <option value="GE">Georgien</option>
        <option value="GH">Ghana</option>
        <option value="GI">Gibraltar</option>
        <option value="GR">Griechenland</option>
        <option value="GL">Grönland</option>
        <option value="GD">Grenada</option>
        <option value="GP">Guadeloupe</option>
        <option value="GU">Guam</option>
        <option value="GT">Guatemala</option>
        <option value="GG">Guernsey</option>
        <option value="GN">Guinea</option>
        <option value="GW">Guinea-Bissau</option>
        <option value="GY">Guyana</option>
        <option value="HT">Haiti</option>
        <option value="HM">Heard und McDonaldinseln</option>
        <option value="VA">Heiliger Stuhl (Vatikanstadt)</option>
        <option value="HN">Honduras</option>
        <option value="HK">Hong Kong</option>
        <option value="IN">Indien</option>
        <option value="ID">Indonesien</option>
        <option value="IR">Iran, Islamische Republik </option>
        <option value="IQ">Ira</option>
        <option value="IE">Irland</option>
        <option value="IS">Island</option>
        <option value="IM">Isle of Man</option>
        <option value="IL">Israel</option>
        <option value="IT">Italien</option>
        <option value="JM">Jamaika</option>
        <option value="JP">Japan</option>
        <option value="YE">Jemen</option>
        <option value="JE">Jersey</option>
        <option value="JO">Jordanien</option>
        <option value="VG">Jungferninseln, Britische</option>
        <option value="VI">Jungferninseln, Amerikanische</option>
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
        <option value="KM">die Komoren</option>
        <option value="CG">der Kongo</option>
        <option value="KP">Korea, Demokratischen Volksrepublik</option>
        <option value="KR">Korea, Volksrepublik</option>
        <option value="HR">Kroatien</option>
        <option value="CU">Kuba</option>
        <option value="KW">Kuwait</option>
        <option value="LV">Lettland</option>
        <option value="LB">Libanon</option>
        <option value="LS">Lesotho</option>
        <option value="LR">Liberia</option>
        <option value="LY">Libyen</option>
        <option value="LI">Liechtenstein</option>
        <option value="LT">Litauen</option>
        <option value="LU">Luxemburg</option>
        <option value="MO">Macao</option>
        <option value="MG">Madagaskar</option>
        <option value="MW">Malawi</option>
        <option value="MY">Malaysia</option>
        <option value="MV">die Malediven</option>
        <option value="ML">Mali</option>
        <option value="MT">Malta</option>
        <option value="MA">Marokko</option>
        <option value="MH">Marshallinseln</option>
        <option value="MQ">Martinique</option>
        <option value="MR">Mauretanien</option>
        <option value="MU">Mauritius</option>
        <option value="YT">Mayotte</option>
        <option value="MX">Mexiko</option>
        <option value="FM">Mikronesien, Föderierte Staaten von </option>
        <option value="MD">Moldawien, Republik</option>
        <option value="MC">Monaco</option>
        <option value="MN">Mongolei</option>
        <option value="ME">Montenegro</option>
        <option value="MS">Montserrat</option>
        <option value="MZ">Mosambik</option>
        <option value="MM">Myanmar</option>
        <option value="NA">Namibia</option>
        <option value="NR">Nauru</option>
        <option value="NP">Nepal</option>
        <option value="NL">die Niederlande</option>
        <option value="NC">Neukaledonien</option>
        <option value="NZ">Neuseeland</option>
        <option value="NI">Nicaragua</option>
        <option value="NE">Niger</option>
        <option value="NG">Nigeria</option>
        <option value="NU">Niue</option>
        <option value="MK">Nordmazedonien</option>
        <option value="NF">Norfolkinseln</option>
        <option value="MP">Nördlichen Marianen</option>
        <option value="NO">Norwegen</option>
        <option value="OM">Oman</option>
        <option value="AT" selected="selected">Österreich</option>
        <option value="PK">Pakistan</option>
        <option value="PW">Palau</option>
        <option value="PS">Palästinensischen Autonomiegebiete</option>
        <option value="PA">Panama</option>
        <option value="PG">Papua-Neuguinea</option>
        <option value="PY">Paraguay</option>
        <option value="PE">Peru</option>
        <option value="PH">die Philippinen</option>
        <option value="PN">Pitcairn</option>
        <option value="PL">Polen</option>
        <option value="PT">Portugal</option>
        <option value="PR">Puerto Rico</option>
        <option value="RE">Réunion</option>
        <option value="RW">Ruanda</option>
        <option value="RO">Rumänien</option>
        <option value="RU">Russland</option>
        <option value="SB">die Salomonen</option>
        <option value="ZM">Sambia</option>
        <option value="WS">Samoa</option>
        <option value="SM">San Marino</option>
        <option value="BL">Sankt Barthélemy</option>
        <option value="SH">St. Helena, Ascension und Tristan da Cunha</option>
        <option value="KN">Sankt Kitts und Nevis</option>
        <option value="LC">Sankt Lucia</option>
        <option value="MF">Saint Martin (Französiches Gebiet)</option>
        <option value="PM">Sankt-Pierre und Miquelon</option>
        <option value="VC">St. Vincent und die Grenadinen</option>
        <option value="ST">Sao Tome und Principe</option>
        <option value="SA">Saudi-Arabien</option>
        <option value="SE">Schweden</option>
        <option value="CH">die Schweiz</option>
        <option value="SN">Senegal</option>
        <option value="RS">Serbien</option>
        <option value="SC">die Seychellen</option>
        <option value="SL">Sierra Leone</option>
        <option value="ZW">Simbabwe</option>
        <option value="SG">Singapur</option>
        <option value="SX">Sint Maarten (Niederländisches Gebiet)</option>
        <option value="SK">die Slowakei</option>
        <option value="SI">Slowenien</option>
        <option value="SO">Somalia</option>
        <option value="ES">Spanien</option>
        <option value="LK">Sri Lanka</option>
        <option value="SD">Sudan</option>
        <option value="SR">Suriname</option>
        <option value="ZA">Südafrika</option>
        <option value="GS">Südgeorgien und die Südlichen Sandwichinseln</option>
        <option value="SS">Südsuda</option>
        <option value="SJ">Svalbard und Jan Mayen</option>
        <option value="SZ">Swasiland</option>
        <option value="SY">Syrien Arabische Republik</option>
        <option value="TW">Taiwan, Provinz der Republik China</option>
        <option value="TJ">Tadschikistan</option>
        <option value="TZ">Tansania, Vereinigte Republik</option>
        <option value="TH">Thailand</option>
        <option value="TL">Timor-Leste</option>
        <option value="TG">Togo</option>
        <option value="TK">Tokelau</option>
        <option value="TO">Tonga</option>
        <option value="TT">Trinidad und Tobago</option>
        <option value="TD">Tschad</option>
        <option value="CZ">die Tschechische Republik</option>
        <option value="TN">Tunesien</option>
        <option value="TR">die Türkei</option>
        <option value="TM">Turkmenistan</option>
        <option value="TC">Turks- und Caicosinseln</option>
        <option value="TV">Tuvalu</option>
        <option value="UG">Uganda</option>
        <option value="UA">die Ukraine</option>
        <option value="HU">Ungarn</option>
        <option value="UM">United States Minor Outlying Islands</option>
        <option value="UY">Uruguay</option>
        <option value="UZ">Usbekistan</option>
        <option value="VU">Vanuatu</option>
        <option value="VE">Venezuela, Bolivarische Republik</option>
        <option value="AE">Vereinigte Arabische Emirate</option>
        <option value="GB">das Vereinigte Königreich</option>
        <option value="US">die Vereinigten Staaten</option>
        <option value="VN">VietNam</option>
        <option value="WF">Wallis nd Futuna</option>
        <option value="CX">Weihnachtsinsel</option>
        <option value="EH">Westsahara</option>
        <option value="CF">die Zentralafrikanische Republik</option>
        <option value="CY">Zypern</option>
    `;
}

export function getEnglishCountryList() {
    return html`
        <option value></option>
        <option value="AF">Afghanistan</option>
        <option value="AX">Åland Islands</option>
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
        <option value="BO">Bolivia, Plurinational State of</option>
        <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
        <option value="BA">Bosnia and Herzegovina</option>
        <option value="BW">Botswana</option>
        <option value="BV">Bouvet Island</option>
        <option value="BR">Brazil</option>
        <option value="IO">British Indian Ocean Territory</option>
        <option value="BN">Brunei Darussalam</option>
        <option value="BG">Bulgaria</option>
        <option value="BF">Burkina Faso</option>
        <option value="BI">Burundi</option>
        <option value="KH">Cambodia</option>
        <option value="CM">Cameroon</option>
        <option value="CA">Canada</option>
        <option value="CV">Cape Verde</option>
        <option value="KY">Cayman Islands</option>
        <option value="CF">Central African Republic</option>
        <option value="TD">Chad</option>
        <option value="CL">Chile</option>
        <option value="CN">China</option>
        <option value="CX">Christmas Island</option>
        <option value="CC">Cocos (Keeling) Islands</option>
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
        <option value="CZ">Czech Republic</option>
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
        <option value="ET">Ethiopia</option>
        <option value="FK">Falkland Islands (Malvinas)</option>
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
        <option value="HM">Heard Island and McDonald Islands</option>
        <option value="VA">Holy See (Vatican City State)</option>
        <option value="HN">Honduras</option>
        <option value="HK">Hong Kong</option>
        <option value="HU">Hungary</option>
        <option value="IS">Iceland</option>
        <option value="IN">India</option>
        <option value="ID">Indonesia</option>
        <option value="IR">Iran, Islamic Republic of</option>
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
        <option value="KP">Korea, Democratic People's Republic of</option>
        <option value="KR">Korea, Republic of</option>
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
        <option value="MK">North Macedonia</option>
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
        <option value="FM">Micronesia, Federated States of</option>
        <option value="MD">Moldova, Republic of</option>
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
        <option value="MP">Northern Mariana Islands</option>
        <option value="NO">Norway</option>
        <option value="OM">Oman</option>
        <option value="PK">Pakistan</option>
        <option value="PW">Palau</option>
        <option value="PS">Palestinian Territory, Occupied</option>
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
        <option value="RU">Russian Federation</option>
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
        <option value="SS">South Sudan</option>
        <option value="ES">Spain</option>
        <option value="LK">Sri Lanka</option>
        <option value="SD">Sudan</option>
        <option value="SR">Suriname</option>
        <option value="SJ">Svalbard and Jan Mayen</option>
        <option value="SZ">Swaziland</option>
        <option value="SE">Sweden</option>
        <option value="CH">Switzerland</option>
        <option value="SY">Syrian Arab Republic</option>
        <option value="TW">Taiwan, Province of China</option>
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
        <option value="GB">United Kingdom</option>
        <option value="US">United States</option>
        <option value="UM">United States Minor Outlying Islands</option>
        <option value="UY">Uruguay</option>
        <option value="UZ">Uzbekistan</option>
        <option value="VU">Vanuatu</option>
        <option value="VE">Venezuela, Bolivarian Republic of</option>
        <option value="VN">VietNam</option>
        <option value="VG">Virgin Islands, British</option>
        <option value="VI">Virgin Islands, U.S.</option>
        <option value="WF">Wallis and Futuna</option>
        <option value="EH">Western Sahara</option>
        <option value="YE">Yemen</option>
        <option value="ZM">Zambia</option>
        <option value="ZW">Zimbabwe</option>
    `;
}


export function getCountryMapping() {
    const countries =
    {
        AF: "Afghanistan",
        AX: "Åland Islands",
        AL: "Albania",
        DZ: "Algeria",
        AS: "American Samoa",
        AD: "Andorra",
        AO: "Angola",
        AI: "Anguilla",
        AQ: "Antarctica",
        AG: "Antigua and Barbuda",
        AR: "Argentina",
        AM: "Armenia",
        AW: "Aruba",
        AU: "Australia",
        AT: "Austria",
        AZ: "Azerbaijan",
        BS: "Bahamas",
        BH: "Bahrain",
        BD: "Bangladesh",
        BB: "Barbados",
        BY: "Belarus",
        BE: "Belgium",
        BZ: "Belize",
        BJ: "Benin",
        BM: "Bermuda",
        BT: "Bhutan",
        BO: "Bolivia, Plurinational State of",
        BQ: "Bonaire, Sint Eustatius and Saba",
        BA: "Bosnia and Herzegovina",
        BW: "Botswana",
        BV: "Bouvet Island",
        BR: "Brazil",
        IO: "British Indian Ocean Territory",
        BN: "Brunei Darussalam",
        BG: "Bulgaria",
        BF: "Burkina Faso",
        BI: "Burundi",
        KH: "Cambodia",
        CM: "Cameroon",
        CA: "Canada",
        CV: "Cape Verde",
        KY: "Cayman Islands",
        CF: "Central African Republic",
        TD: "Chad",
        CL: "Chile",
        CN: "China",
        CX: "Christmas Island",
        CC: "Cocos (Keeling) Islands",
        CO: "Colombia",
        KM: "Comoros",
        CG: "Congo",
        CD: "Congo, the Democratic Republic of the",
        CK: "Cook Islands",
        CR: "Costa Rica",
        CI: "Côte d'Ivoire",
        HR: "Croatia",
        CU: "Cuba",
        CW: "Curaçao",
        CY: "Cyprus",
        CZ: "Czech Republic",
        DK: "Denmark",
        DJ: "Djibouti",
        DM: "Dominica",
        DO: "Dominican Republic",
        EC: "Ecuador",
        EG: "Egypt",
        SV: "El Salvador",
        GQ: "Equatorial Guinea",
        ER: "Eritrea",
        EE: "Estonia",
        ET: "Ethiopia",
        FK: "Falkland Islands (Malvinas)",
        FO: "Faroe Islands",
        FJ: "Fiji",
        FI: "Finland",
        FR: "France",
        GF: "French Guiana",
        PF: "French Polynesia",
        TF: "French Southern Territories",
        GA: "Gabon",
        GM: "Gambia",
        GE: "Georgia",
        DE: "Germany",
        GH: "Ghana",
        GI: "Gibraltar",
        GR: "Greece",
        GL: "Greenland",
        GD: "Grenada",
        GP: "Guadeloupe",
        GU: "Guam",
        GT: "Guatemala",
        GG: "Guernsey",
        GN: "Guinea",
        GW: "Guinea-Bissau",
        GY: "Guyana",
        HT: "Haiti",
        HM: "Heard Island and McDonald Islands",
        VA: "Holy See (Vatican City State)",
        HN: "Honduras",
        HK: "Hong Kong",
        HU: "Hungary",
        IS: "Iceland",
        IN: "India",
        ID: "Indonesia",
        IR: "Iran, Islamic Republic of",
        IQ: "Iraq",
        IE: "Ireland",
        IM: "Isle of Man",
        IL: "Israel",
        IT: "Italy",
        JM: "Jamaica",
        JP: "Japan",
        JE: "Jersey",
        JO: "Jordan",
        KZ: "Kazakhstan",
        KE: "Kenya",
        KI: "Kiribati",
        KP: "Korea, Democratic People's Republic of",
        KR: "Korea, Republic of",
        KW: "Kuwait",
        KG: "Kyrgyzstan",
        LA: "Lao People's Democratic Republic",
        LV: "Latvia",
        LB: "Lebanon",
        LS: "Lesotho",
        LR: "Liberia",
        LY: "Libya",
        LI: "Liechtenstein",
        LT: "Lithuania",
        LU: "Luxembourg",
        MO: "Macao",
        MK: "North Macedonia",
        MG: "Madagascar",
        MW: "Malawi",
        MY: "Malaysia",
        MV: "Maldives",
        ML: "Mali",
        MT: "Malta",
        MH: "Marshall Islands",
        MQ: "Martinique",
        MR: "Mauritania",
        MU: "Mauritius",
        YT: "Mayotte",
        MX: "Mexico",
        FM: "Micronesia, Federated States of",
        MD: "Moldova, Republic of",
        MC: "Monaco",
        MN: "Mongolia",
        ME: "Montenegro",
        MS: "Montserrat",
        MA: "Morocco",
        MZ: "Mozambique",
        MM: "Myanmar",
        NA: "Namibia",
        NR: "Nauru",
        NP: "Nepal",
        NL: "Netherlands",
        NC: "New Caledonia",
        NZ: "New Zealand",
        NI: "Nicaragua",
        NE: "Niger",
        NG: "Nigeria",
        NU: "Niue",
        NF: "Norfolk Island",
        MP: "Northern Mariana Islands",
        NO: "Norway",
        OM: "Oman",
        PK: "Pakistan",
        PW: "Palau",
        PS: "Palestinian Territory, Occupied",
        PA: "Panama",
        PG: "Papua New Guinea",
        PY: "Paraguay",
        PE: "Peru",
        PH: "Philippines",
        PN: "Pitcairn",
        PL: "Poland",
        PT: "Portugal",
        PR: "Puerto Rico",
        QA: "Qatar",
        RE: "Réunion",
        RO: "Romania",
        RU: "Russian Federation",
        RW: "Rwanda",
        BL: "Saint Barthélemy",
        SH: "Saint Helena, Ascension and Tristan da Cunha",
        KN: "Saint Kitts and Nevis",
        LC: "Saint Lucia",
        MF: "Saint Martin (French part)",
        PM: "Saint Pierre and Miquelon",
        VC: "Saint Vincent and the Grenadines",
        WS: "Samoa",
        SM: "San Marino",
        ST: "Sao Tome and Principe",
        SA: "Saudi Arabia",
        SN: "Senegal",
        RS: "Serbia",
        SC: "Seychelles",
        SL: "Sierra Leone",
        SG: "Singapore",
        SX: "Sint Maarten (Dutch part)",
        SK: "Slovakia",
        SI: "Slovenia",
        SB: "Solomon Islands",
        SO: "Somalia",
        ZA: "South Africa",
        GS: "South Georgia and the South Sandwich Islands",
        SS: "South Sudan",
        ES: "Spain",
        LK: "Sri Lanka",
        SD: "Sudan",
        SR: "Suriname",
        SJ: "Svalbard and Jan Mayen",
        SZ: "Swaziland",
        SE: "Sweden",
        CH: "Switzerland",
        SY: "Syrian Arab Republic",
        TW: "Taiwan, Province of China",
        TJ: "Tajikistan",
        TZ: "Tanzania, United Republic of",
        TH: "Thailand",
        TL: "Timor-Leste",
        TG: "Togo",
        TK: "Tokelau",
        TO: "Tonga",
        TT: "Trinidad and Tobago",
        TN: "Tunisia",
        TR: "Turkey",
        TM: "Turkmenistan",
        TC: "Turks and Caicos Islands",
        TV: "Tuvalu",
        UG: "Uganda",
        UA: "Ukraine",
        AE: "United Arab Emirates",
        GB: "United Kingdom",
        US: "United States",
        UM: "United States Minor Outlying Islands",
        UY: "Uruguay",
        UZ: "Uzbekistan",
        VU: "Vanuatu",
        VE: "Venezuela, Bolivarian Republic of",
        VN: "VietNam",
        VG: "Virgin Islands, British",
        VI: "Virgin Islands, U.S.",
        WF: "Wallis and Futuna",
        EH: "Western Sahara",
        YE: "Yemen",
        ZM: "Zambia",
        ZW: "Zimbabwe"
    };
    return countries;
}
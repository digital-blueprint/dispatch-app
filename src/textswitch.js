import {html, LitElement, css} from 'lit';
import * as commonStyles from '@dbp-toolkit/common/styles';

const BUTTON1 = "button1";
const BUTTON2 = "button2";

/**
 * Attributes:
 *  value1/value2: The values of the buttons
 *  name1/name2: The names of the buttons
 *  name: The active name
 *  disabled: Disable the switch
 * 
 * Events:
 *  change: when button is clicked
 * 
 * Example:
 *  <my-tag name="one" name1="one" name2="two" value1="One", value2="Two"></my-tag>
 */
export class TextSwitch extends LitElement {
    constructor() {
        super();
        this.value1 = "";
        this.value2 = "";
        this.name1 = "";
        this.name2 = "";
        this.name = "";
        this.disabled = false;
        this._active = BUTTON1;
    }

    static get properties() {
        return {
            value1: { type: String },
            value2: { type: String },
            name1: { type: String },
            name2: { type: String },
            name: { type: String, reflect: true },
            disabled: { type: Boolean },
            _active: { type: Boolean },
        };
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getButtonCSS()}

            div {
                white-space: nowrap;
                display: flex;
            }

            #button1 {
                border-right-width: 0;
            }

            .active {
                background-color: black !important;
                color: var(--dbp-primary-text-color) !important;
            }

            .button {
                flex-grow: 1;
            }

            .button:hover {
                background-color: var(--dbp-secondary-bg-color) !important;
            }
        `;
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            if (propName === "name") {
                if (this[propName] === this.name1) {
                    this._active = BUTTON1;
                } else if (this[propName] === this.name2) {
                    this._active = BUTTON2;
                }
            }
        });

        super.update(changedProperties);
    }

    render() {
        const onClick = function (e) {
            this._active = e.target.id;
            this.name = this._active === BUTTON1 ? this.name1 : this.name2;

            // send event only when buttons are clicked
            const event = new CustomEvent("change", {
                bubbles: true,
                cancelable: false,
            });

            this.dispatchEvent(event);
        };

        return html`
            <div>
                <button @click="${onClick}" class="button ${this._active === BUTTON1 ? `active` : ``}" id="${BUTTON1}" ?disabled="${this.disabled}">
                    ${this.value1}
                </button><button @click="${onClick}" class="button ${this._active === BUTTON2 ? `active` : ``}" id="${BUTTON2}" ?disabled="${this.disabled}">
                    ${this.value2}
                </button>
            </div>
        `;
    }
}

import {css} from 'lit';

export function getDispatchRequestStyles() {
    // language=css
    return css`
        a {
            color: var(--dbp-content);
            cursor: pointer;
            text-decoration: none;
        }

        .activity-description {
            margin-top: 0;
        }

        h3 {
            font-weight: 300;
            margin-top: 1.3em;
            margin-bottom: 1.3em;
        }

        select:not(.select) {
            background-size: 13px;
            background-position-x: calc(100% - 0.4rem);
            padding-right: 1.3rem;
            height: 33px;
            width: 100%;
        }

        select:disabled {
            cursor: not-allowed;
            color: var(--dbp-muted);
        }

        .no-access-notification {
            margin-top: 1.3em;
            margin-bottom: 1.3em;
        }

        .country-select:not(.select) {
            width: 100%;
            border-color: var(--dbp-muted);
        }

        .country-select option {
            background: var(--dbp-background);
            color: var(--dbp-content);
        }

        .request-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 0.5em;
            margin-top: -1.5em;
            padding-bottom: 1.5em;
        }

        .edit-recipient-btn {
            margin-left: -1.5em;
            padding-bottom: 1em;
        }

        .request-item.details .recipients-data,
        .request-item.details .files-data {
            display: grid;
            gap: 1.5em;
            grid-template-columns: 1fr 1fr 1fr;
        }

        .request-item.details .files {
            padding-bottom: 2em;
        }

        .request-item.details .request-buttons {
            padding-top: 1.5em;
            border-top: 1px solid var(--dbp-muted);
        }

        .request-item.details .sender-data-btn {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .recipient-entry .border,
        .file-entry .border {
            margin-left: -1.5em;
            margin-bottom: 1em;
        }

        .edit-recipient-btn {
            margin-left: -1.5em;
            padding-bottom: 1em;
        }

        .recipient-entry .border,
        .file-entry .border {
            margin-left: -1.5em;
            margin-bottom: 1em;
        }

        .file-entry {
            display: flex;
            justify-content: space-between;
        }

        #add-file-2-btn {
            margin-top: 1em;
        }

        .delete-file-btn {
            margin-top: 0.5em;
        }

        .rec-2-btns {
            display: flex;
            flex-direction: row-reverse;
        }

        .selected-buttons {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .file-entry {
            display: flex;
            justify-content: space-between;
        }

        #add-file-2-btn {
            margin-top: 1em;
        }

        .delete-file-btn {
            margin-top: 0.5em;
        }

        .rec-2-btns {
            display: flex;
            flex-direction: row-reverse;
        }

        h2:first-child {
            margin-top: 0;
        }

        h2 {
            margin-bottom: 10px;
        }

        .muted {
            color: var(--dbp-muted);
        }

        .birthdate-input {
            display: flex;
            flex-direction: row;
            gap: 0.5em;
            width: 100%;
        }

        .line {
            border-right: 1px solid var(--dbp-muted);
        }

        .details.header {
            display: grid;
            grid-template-columns: 1fr 1px 1fr 1px 1fr;
            padding-bottom: 2em;
            border-bottom: 1px solid var(--dbp-muted);
            text-align: center;
        }

        .details.header.sub {
            padding-top: 2em;
        }

        .details.sender,
        .details.recipients {
            padding-top: 1.5em;
            padding-bottom: 1.5em;
            border-bottom: 1px solid var(--dbp-muted);
        }

        .details.files {
            padding-top: 1.5em;
        }

        .section-titles {
            font-size: 1.3em;
            color: var(--dbp-muted);
            text-transform: uppercase;
            padding-bottom: 0.5em;
            /* to align titles when they are editable */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 30px;
        }

        .header-btn {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .button-row {
            display: flex;
            flex-direction: row;
        }

        .card {
            display: grid;
            grid-template-columns: 4fr min-content;
            border: 1px solid var(--dbp-muted);
            min-width: 320px;
        }

        .left-side {
            margin: 18px;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .left-side div {
            word-break: break-all;
        }

        .file.card .left-side {
            padding-bottom: 1.4em;
        }

        .file.card .left-side div:first-child {
            padding-bottom: 0.2em;
            font-weight: 400;
        }

        .right-side {
            padding: 10px;
            color: var(--dbp-on-primary-surface);
            background-color: var(--dbp-primary-surface);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 10px;
            min-width: 40px;
        }

        .right-side dbp-icon {
            color: #ffffff;
        }

        .recipients-data,
        .files-data {
            margin-top: 1em;
        }

        .status-green {
            color: var(--dbp-success);
        }

        .status-orange {
            color: var(--dbp-warning-surface);
        }

        .status-red {
            color: var(--dbp-danger);
        }

        .delivery-status {
            padding-top: 0.5em;
            align-self: baseline;
            margin-top: auto;
        }

        .back-container {
            padding-top: 1em;
            /*padding-bottom: 0.5em;*/
        }

        .section-title-counts {
            font-style: italic;
        }

        input[type='date'] {
            width: 100%;
        }

        .dispatch-status {
            padding-top: 0.5em;
        }

        .dispatch-status .status-title {
            font-weight: 400;
        }

        .inline-label {
            display: inline-block;
            font-weight: 600;
            min-width: 230px;
        }

        @media only screen and (orientation: portrait) and (max-width: 768px) {
            .edit-selection-buttons {
                display: flex;
                flex-direction: column-reverse;
                gap: 1em;
            }

            .filter-buttons {
                width: calc(100% - 45px);
            }

            .mobile-hidden {
                display: none;
            }

            .btn-row-left {
                display: flex;
                justify-content: space-between;
                flex-direction: row;
                gap: 4px;
                height: 40px;
            }
        }

        @media only screen and (max-width: 859.9px) {
            .request-item.details .recipients-data,
            .request-item.details .files-data {
                gap: 1.5em;
                grid-template-columns: 1fr;
            }

            .details.header {
                grid-template-columns: unset;
                gap: 0.5em;
                text-align: left;
            }

            .section-titles {
                display: block;
                height: initial;
            }

            .header-btn {
                flex-direction: column;
                padding-bottom: 1em;
            }

            .request-buttons {
                flex-direction: column-reverse;
                gap: 1em;
            }

            .request-buttons .submit-button,
            .request-buttons .edit-buttons {
                display: flex;
                flex-direction: column;
            }

            .details.sender .header-btn {
                flex-direction: row;
                padding-bottom: 0;
            }

            .sender-data {
                margin-bottom: 0;
            }
        }

        @media only screen and (max-width: 369.9px) {
            .card {
                min-width: 30px;
                max-width: 320px;
            }
        }

        @media only screen and (min-width: 370px) and (max-width: 859.9px) {
            .card {
                min-width: 320px;
                max-width: unset;
            }
        }

        @media only screen and (min-width: 860px) and (max-width: 949.9px) {
            .request-item.details .recipients-data,
            .request-item.details .files-data {
                gap: 0.5em;
                grid-template-columns: 1fr 1fr;
            }
        }

        @media only screen and (min-width: 950px) and (max-width: 1250px) {
            .request-item.details .recipients-data,
            .request-item.details .files-data {
                gap: 1.5em;
                grid-template-columns: 1fr 1fr;
            }
        }
    `;
}

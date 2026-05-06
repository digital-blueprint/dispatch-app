import {css, html} from 'lit';
import {IconButton, Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {createInstance} from '../i18n.js';

function normalizeNewlines(text = '') {
    return String(text).replace(/\\n/g, '\n');
}

function convertToReadableDate(inputDate) {
    const d = Date.parse(inputDate);
    const timestamp = new Date(d);
    const year = timestamp.getFullYear();
    const month = ('0' + (timestamp.getMonth() + 1)).slice(-2);
    const date = ('0' + timestamp.getDate()).slice(-2);
    const hours = ('0' + timestamp.getHours()).slice(-2);
    const minutes = ('0' + timestamp.getMinutes()).slice(-2);
    return date + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
}

export class DispatchShowRecipientModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
        this.recipient = {};
    }

    static get scopedElements() {
        return {
            'dbp-icon-button': IconButton,
            'dbp-modal': Modal,
        };
    }

    static get properties() {
        return {
            lang: {type: String},
            recipient: {type: Object},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    open(recipient = this.recipient) {
        this.recipient = {...(recipient || {})};
        this.updateComplete.then(() => {
            this._('#modal').open();
        });
    }

    close() {
        this._('#modal').close();
    }

    _dispatchAction(name, statusChange, button) {
        this.dispatchEvent(
            new CustomEvent(name, {
                detail: {statusChange, button},
                bubbles: true,
                composed: true,
            }),
        );
    }

    _renderReturnReceiptButtons(statusChange) {
        const i18n = this._i18n;
        const dateLocal = i18n.language == 'de' ? 'de-AT' : 'en-US';

        if (statusChange.statusType !== 26 && statusChange.statusType !== 30) {
            return '';
        }

        return html`
            <div class="return-receipt-widget">
                <h4 class="return-receipt-widget__title">
                    ${i18n.t('show-requests.return-receipt.widget-label')}
                </h4>

                <span class="return-receipt-widget__upload-date">
                    ${statusChange.fileFormat && statusChange.fileIsUploadedManually
                        ? i18n.t('show-requests.return-receipt.uploaded-on') +
                          ' ' +
                          new Date(statusChange.fileDateAdded).toLocaleString(dateLocal, {})
                        : ''}
                </span>

                <span class="return-receipt__buttons">
                    ${!statusChange.fileFormat
                        ? html`
                              <dbp-icon-button
                                  class="upload-btn"
                                  @click="${(event) => {
                                      this._dispatchAction(
                                          'upload-return-receipt',
                                          statusChange,
                                          event.target,
                                      );
                                  }}"
                                  aria-label="${i18n.t(
                                      'show-requests.return-receipt.upload-button-text',
                                  )}"
                                  title="${i18n.t(
                                      'show-requests.return-receipt.upload-button-text',
                                  )}"
                                  icon-name="add-file"></dbp-icon-button>
                          `
                        : ''}
                    ${statusChange.fileFormat
                        ? html`
                              <dbp-icon-button
                                  class="download-btn"
                                  @click="${(event) => {
                                      this._dispatchAction(
                                          'download-return-receipt',
                                          statusChange,
                                          event.target,
                                      );
                                  }}"
                                  aria-label="${i18n.t('show-requests.download-button-text')}"
                                  title="${i18n.t('show-requests.download-button-text')}"
                                  icon-name="download"></dbp-icon-button>
                          `
                        : ''}
                    ${statusChange.fileFormat
                        ? html`
                              <dbp-icon-button
                                  class="view-btn"
                                  @click="${(event) => {
                                      this._dispatchAction(
                                          'view-return-receipt',
                                          statusChange,
                                          event.target,
                                      );
                                  }}"
                                  aria-label="${i18n.t(
                                      'show-requests.return-receipt.view-button-text',
                                  )}"
                                  title="${i18n.t('show-requests.return-receipt.view-button-text')}"
                                  icon-name="eye"></dbp-icon-button>
                          `
                        : ''}
                    ${statusChange.fileFormat && statusChange.fileIsUploadedManually
                        ? html`
                              <dbp-icon-button
                                  class="delete-btn"
                                  @click="${(event) => {
                                      this._dispatchAction(
                                          'delete-return-receipt',
                                          statusChange,
                                          event.target,
                                      );
                                  }}"
                                  aria-label="${i18n.t(
                                      'show-requests.return-receipt.delete-button-text',
                                  )}"
                                  title="${i18n.t(
                                      'show-requests.return-receipt.delete-button-text',
                                  )}"
                                  icon-name="trash"></dbp-icon-button>
                          `
                        : ''}
                </span>
            </div>
        `;
    }

    _renderField(label, value, first = false) {
        return html`
            <div class="element-left ${first ? 'first' : ''}">${label}:</div>
            <div class="element-right ${first ? 'first' : ''}">${value || ''}</div>
        `;
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}

            .element-left {
                background-color: var(--dbp-primary-surface);
                border: var(--dbp-border);
                border-color: var(--dbp-primary-surface-border-color);
                color: var(--dbp-on-primary-surface);
                padding: 0px 20px 12px 40px;
                text-align: right;
                white-space: nowrap;
            }

            .element-left.first,
            .element-right.first {
                padding-top: 12px;
            }

            .element-right {
                text-align: left;
                margin-left: 12px;
                padding: 0px 0px 12px;
            }

            .detailed-recipient-modal-content-wrapper {
                display: grid;
                grid-template-columns: min-content auto;
                grid-template-rows: auto;
                max-height: calc(100vh - 149px);
                overflow-y: auto;
                width: 100%;
            }

            .notification-container {
                margin-top: 12px;
            }

            .notification-container label {
                font-weight: bold;
            }

            .recipient-status {
                margin-bottom: 2em;
                display: flex;
                justify-content: space-between;
                gap: 10px;
            }

            .status-container {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }

            .recipient-status .status-detail {
                font-weight: bolder;
            }

            .return-receipt-widget {
                min-width: 220px;
                background-color: var(--dbp-background);
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }

            .return-receipt-widget__title {
                margin: 0;
            }

            .return-receipt-widget__upload-date {
                display: block;
                font-size: 14px;
                text-align: right;
            }

            .return-receipt__buttons {
                display: flex;
                flex-direction: row;
                margin-right: -11px;
            }

            .upload-btn {
                margin-left: -2px;
            }

            .download-btn {
                margin-top: auto;
                margin-bottom: auto;
            }

            .new-line-content {
                white-space: pre-line;
            }

            .scroll {
                overflow-y: auto;
                overflow-x: clip;
            }

            @media only screen and (orientation: portrait) and (max-width: 768px) {
                .detailed-recipient-modal-content-wrapper {
                    grid-template-columns: unset;
                    max-height: 100%;
                }

                .element-right {
                    border: 1px solid var(--dbp-muted);
                    padding: 5px;
                    margin: 0;
                }

                .element-right.first {
                    padding-top: 5px;
                }

                .element-left {
                    margin-top: 8px;
                    font-weight: bold;
                    text-align: left;
                    padding: 5px 5px 5px 0;
                    background: initial;
                    color: var(--dbp-content);
                    border: 0 none;
                }

                .element-left.first {
                    padding-top: 5px;
                }
            }

            @media only screen and (max-width: 859.9px) {
                .return-receipt-widget__upload-date {
                    max-width: 180px;
                }
            }

            @media only screen and (max-width: 650px) {
                .recipient-status {
                    flex-direction: column;
                }

                .return-receipt-widget {
                    align-items: flex-start;
                }

                .return-receipt-widget__upload-date {
                    text-align: left;
                }

                .return-receipt__buttons {
                    margin-left: -8px;
                }
            }
        `;
    }

    render() {
        const i18n = this._i18n;
        const recipient = this.recipient || {};
        const hasBirthDate =
            recipient.birthDateDay &&
            recipient.birthDateMonth &&
            recipient.birthDateYear &&
            recipient.birthDateDay !== '' &&
            recipient.birthDateMonth !== '' &&
            recipient.birthDateYear !== '';

        return html`
            <dbp-modal
                id="modal"
                modal-id="show-recipient-modal"
                title="${i18n.t('show-requests.show-recipient-dialog-title')}"
                style="
                    --dbp-modal-width: 90vw;
                    --dbp-modal-max-width: 800px;
                    --dbp-modal-min-width: 320px;
                    --dbp-modal-min-height: auto;
                    --dbp-modal-content-overflow-y: auto;
                "
                lang="${this.lang}">
                <div slot="content">
                    <div class="detailed-recipient-modal-content-wrapper">
                        ${this._renderField(
                            i18n.t('show-requests.edit-recipient-gn-dialog-label'),
                            recipient.givenName,
                            true,
                        )}
                        ${this._renderField(
                            i18n.t('show-requests.edit-recipient-fn-dialog-label'),
                            recipient.familyName,
                        )}
                        ${hasBirthDate
                            ? this._renderField(
                                  i18n.t('show-requests.add-recipient-birthdate-dialog-label'),
                                  recipient.birthDateYear +
                                      '-' +
                                      recipient.birthDateMonth +
                                      '-' +
                                      recipient.birthDateDay,
                              )
                            : ''}
                        ${recipient.streetAddress
                            ? this._renderField(
                                  i18n.t('show-requests.edit-recipient-sa-dialog-label'),
                                  recipient.streetAddress,
                              )
                            : ''}
                        ${recipient.postalCode
                            ? this._renderField(
                                  i18n.t('show-requests.edit-recipient-pc-dialog-label'),
                                  recipient.postalCode,
                              )
                            : ''}
                        ${recipient.addressLocality
                            ? this._renderField(
                                  i18n.t('show-requests.edit-recipient-al-dialog-label'),
                                  recipient.addressLocality,
                              )
                            : ''}
                        ${recipient.addressCountry
                            ? this._renderField(
                                  i18n.t('show-requests.edit-recipient-ac-dialog-label'),
                                  recipient.addressCountry,
                              )
                            : ''}
                        ${this._renderField(
                            i18n.t('show-requests.delivery-service-dialog-label'),
                            recipient.electronicallyDeliverable
                                ? i18n.t('show-requests.electronically-deliverable')
                                : recipient.postalDeliverable
                                  ? i18n.t('show-requests.only-postal-deliverable')
                                  : i18n.t('show-requests.not-deliverable-1') +
                                    '. ' +
                                    i18n.t('show-requests.not-deliverable-2'),
                        )}
                        ${recipient.deliveryEndDate
                            ? this._renderField(
                                  i18n.t('show-requests.delivery-end-date'),
                                  convertToReadableDate(recipient.deliveryEndDate),
                              )
                            : ''}
                        ${this._renderField(
                            i18n.t('show-requests.recipient-id'),
                            recipient.identifier,
                        )}
                        ${recipient.appDeliveryId
                            ? this._renderField(
                                  i18n.t('show-requests.app-delivery-id'),
                                  recipient.appDeliveryId,
                              )
                            : ''}
                    </div>

                    ${recipient.statusChanges && recipient.statusChanges.length > 0
                        ? html`
                              <h3>${i18n.t('show-requests.delivery-status-changes')}:</h3>
                              <div class="scroll">
                                  ${recipient.statusChanges.map(
                                      (statusChange) => html`
                                          <div class="recipient-status">
                                              <div class="status-container">
                                                  <div class="status-date">
                                                      ${convertToReadableDate(
                                                          statusChange.dateCreated,
                                                      )}
                                                  </div>
                                                  <div class="status-detail">
                                                      <span class="new-line-content">
                                                          ${normalizeNewlines(
                                                              statusChange.description,
                                                          )}
                                                      </span>
                                                      <span>
                                                          (StatusType ${statusChange.statusType})
                                                      </span>
                                                  </div>
                                              </div>

                                              ${this._renderReturnReceiptButtons(statusChange)}
                                          </div>
                                      `,
                                  )}
                              </div>
                          `
                        : ''}
                    ${recipient.addressCountry &&
                    recipient.addressCountry.length > 0 &&
                    recipient.addressCountry !== 'AT'
                        ? html`
                              <div class="notification-container">
                                  <label>Info:</label>
                                  ${i18n.t('create-request.add-recipient-country-warning')}
                              </div>
                          `
                        : ''}
                </div>
            </dbp-modal>
        `;
    }
}

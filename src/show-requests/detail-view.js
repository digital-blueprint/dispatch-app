import {css, html, LitElement} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {Icon, IconButton, LoadingButton, ScopedElementsMixin} from '@dbp-toolkit/common';
import * as commonStyles from '@dbp-toolkit/common/styles';
import * as dispatchStyles from '../styles.js';

export class ShowRequestsDetailView extends ScopedElementsMixin(LitElement) {
    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-icon-button': IconButton,
            'dbp-loading-button': LoadingButton,
        };
    }

    static get properties() {
        return {
            controller: {attribute: false},
        };
    }

    static get styles() {
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getButtonCSS()}
            ${dispatchStyles.getDispatchRequestStyles()}

            a {
                color: var(--dbp-override-content);
                cursor: pointer;
                text-decoration: none;
            }

            h3 {
                font-weight: 300;
                margin-top: 1.3em;
                margin-bottom: 1.3em;
            }

            .request-item:first-child {
                border-top: none;
                padding-top: 0;
                margin-top: 0;
            }

            .sender-data {
                margin: 0 0 0.5em 1px;
                line-height: 1.5;
            }

            .card .button.is-icon dbp-icon,
            .header-btn .button.is-icon dbp-icon {
                font-size: 1.3em;
            }
        `;
    }

    render() {
        if (!this.controller) {
            return html``;
        }

        const c = this.controller;
        const i18n = c._i18n;

        if (!c.showDetailsView) {
            return html``;
        }

        return html`
            <div class="back-container">
                <span
                    class="back-navigation ${classMap({
                        hidden:
                            !c.isLoggedIn() ||
                            c.isLoading() ||
                            c.loadingTranslations ||
                            c.showListView,
                    })}">
                    <a
                        href="#"
                        title="${i18n.t('show-requests.back-to-list')}"
                        @click="${(event) => {
                            event.preventDefault();
                            c.returnToList();
                        }}">
                        <dbp-icon name="chevron-left"></dbp-icon>
                        ${i18n.t('show-requests.back-to-list')}
                    </a>
                </span>
            </div>

            <h3
                class="${classMap({
                    hidden:
                        !c.isLoggedIn() || c.isLoading() || c.loadingTranslations || c.showListView,
                })}">
                ${
                    (c.currentItem && c.currentItem.dateSubmitted) || !c.mayWrite
                        ? i18n.t('show-requests.show-detailed-dispatch-order', {
                              id: c.currentItem.identifier,
                          })
                        : i18n.t('show-requests.detailed-dispatch-order', {
                              id: c.currentItem.identifier,
                          })
                }:
            </h3>

            <div
                class="${classMap({
                    hidden:
                        !c.isLoggedIn() || c.isLoading() || c.loadingTranslations || c.showListView,
                })}">
                ${
                    c.currentItem && !c.currentItem.dateSubmitted
                        ? html`
                              <div class="request-buttons">
                                  <div class="edit-buttons">
                                      <dbp-loading-button
                                          id="delete-btn"
                                          ?disabled="${
                                              c.loading ||
                                              c.currentItem.dateSubmitted ||
                                              !c.mayWrite
                                          }"
                                          value="${i18n.t('show-requests.delete-button-text')}"
                                          @click="${(event) => {
                                              c.deleteRequest(c.currentTable, event, c.currentItem);
                                          }}"
                                          title="${i18n.t('show-requests.delete-button-text')}">
                                          <dbp-icon name="trash" aria-label="hidden"></dbp-icon>
                                          ${i18n.t('show-requests.delete-button-text')}
                                      </dbp-loading-button>
                                  </div>
                                  <div class="submit-button">
                                      <dbp-loading-button
                                          type="is-primary"
                                          id="submit-btn"
                                          ?disabled="${
                                              c.loading ||
                                              c.currentItem.dateSubmitted ||
                                              !c.mayWrite
                                          }"
                                          value="${i18n.t('show-requests.submit-button-text')}"
                                          @click="${(event) => {
                                              c.submitRequest(c.currentTable, event, c.currentItem);
                                          }}"
                                          title="${i18n.t('show-requests.submit-button-text')}">
                                          <dbp-icon
                                              name="send-diagonal"
                                              aria-label="hidden"></dbp-icon>
                                          ${i18n.t('show-requests.submit-button-text')}
                                      </dbp-loading-button>
                                  </div>
                              </div>
                          `
                        : ``
                }
                ${
                    c.currentItem
                        ? html`
                              <div class="request-item details">
                                  <div class="details header">
                                      <div>
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.id')}
                                              ${
                                                  !c.currentItem.dateSubmitted
                                                      ? html`
                                                            <dbp-icon-button
                                                                id="edit-subject-btn"
                                                                ?disabled="${
                                                                    c.loading ||
                                                                    c.currentItem.dateSubmitted ||
                                                                    !c.mayWrite
                                                                }"
                                                                @click="${(event) => {
                                                                    c.subject = c.currentItem.name
                                                                        ? c.currentItem.name
                                                                        : '';
                                                                    c._('#edit-subject-modal').open(
                                                                        c.subject,
                                                                    );
                                                                }}"
                                                                aria-label="${i18n.t(
                                                                    'show-requests.edit-subject-button-text',
                                                                )}"
                                                                title="${i18n.t(
                                                                    'show-requests.edit-subject-button-text',
                                                                )}"
                                                                icon-name="pencil"></dbp-icon-button>
                                                        `
                                                      : ``
                                              }
                                          </div>
                                          <div>
                                              ${
                                                  c.currentItem.name
                                                      ? html`
                                                            ${c.currentItem.name}
                                                        `
                                                      : html`
                                                            ${
                                                                c.mayReadMetadata &&
                                                                !c.mayRead &&
                                                                !c.mayWrite
                                                                    ? i18n.t(
                                                                          'show-requests.metadata-subject-text',
                                                                      )
                                                                    : i18n.t(
                                                                          'show-requests.no-subject-found',
                                                                      )
                                                            }
                                                        `
                                              }
                                          </div>
                                      </div>
                                      <div class="line"></div>
                                      <div>
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.submit-status')}
                                          </div>
                                          <div>
                                              ${
                                                  c.currentItem.dateSubmitted
                                                      ? html`
                                                            ${
                                                                c.checkRecipientStatus(
                                                                    c.currentItem.recipients,
                                                                )[0]
                                                            }
                                                        `
                                                      : html`
                                                            <span class="status-orange">●</span>
                                                            ${i18n.t('show-requests.empty-date-submitted')}
                                                        `
                                              }
                                          </div>
                                      </div>
                                      <div class="line"></div>
                                      <div>
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.reference-number')}
                                              ${
                                                  !c.currentItem.dateSubmitted
                                                      ? html`
                                                            <dbp-icon-button
                                                                id="edit-reference-number-btn"
                                                                ?disabled="${
                                                                    c.loading ||
                                                                    c.currentItem.dateSubmitted ||
                                                                    !c.mayWrite
                                                                }"
                                                                @click="${(event) => {
                                                                    c._(
                                                                        '#edit-reference-number-modal',
                                                                    ).open(
                                                                        c.currentItem
                                                                            .referenceNumber ?? ``,
                                                                    );
                                                                }}"
                                                                aria-label="${i18n.t(
                                                                    'show-requests.edit-reference-number-button-text',
                                                                )}"
                                                                title="${i18n.t(
                                                                    'show-requests.edit-reference-number-button-text',
                                                                )}"
                                                                icon-name="pencil"></dbp-icon-button>
                                                        `
                                                      : ``
                                              }
                                          </div>
                                          <div>
                                              ${
                                                  c.currentItem.referenceNumber
                                                      ? html`
                                                            ${c.currentItem.referenceNumber}
                                                        `
                                                      : html`
                                                            ${i18n.t(
                                                                'show-requests.empty-reference-number',
                                                            )}
                                                        `
                                              }
                                          </div>
                                      </div>
                                  </div>

                                  ${c.addSubHeader()} ${c.addSenderDetails()}

                                  <div class="details recipients">
                                      <div class="header-btn">
                                          <div class="section-titles">
                                              ${i18n.t('show-requests.recipients')}
                                              <span class="section-title-counts">
                                                  ${
                                                      c.currentItem.recipients.length !== 0
                                                          ? `(` +
                                                            c.currentItem.recipients.length +
                                                            `)`
                                                          : ``
                                                  }
                                              </span>
                                          </div>
                                          ${
                                              !c.currentItem.dateSubmitted
                                                  ? html`
                                                        <dbp-loading-button
                                                            id="add-recipient-btn"
                                                            ?disabled="${
                                                                c.loading ||
                                                                c.currentItem.dateSubmitted ||
                                                                !c.mayWrite
                                                            }"
                                                            value="${i18n.t(
                                                                'show-requests.add-recipient-button-text',
                                                            )}"
                                                            @click="${(event) => {
                                                                c.currentRecipient = {};
                                                                c._('#add-recipient-modal').open(
                                                                    {},
                                                                );
                                                            }}"
                                                            title="${i18n.t(
                                                                'show-requests.add-recipient-button-text',
                                                            )}">
                                                            <dbp-icon
                                                                name="user"
                                                                aria-hidden="true"></dbp-icon>
                                                            ${i18n.t(
                                                                'show-requests.add-recipient-button-text',
                                                            )}
                                                        </dbp-loading-button>
                                                    `
                                                  : ``
                                          }
                                      </div>

                                      <div class="recipients-data">
                                          ${c.sortRecipients(c.currentItem.recipients).map(
                                              (recipient) => html`
                                                  <div class="recipient card">
                                                      ${c.addRecipientCardLeftSideContent(recipient)}

                                                      <div class="right-side">
                                                          <dbp-icon-button
                                                              id="show-recipient-btn"
                                                              @click="${(event) => {
                                                                  let button = event.target;
                                                                  button.start();
                                                                  c.currentRecipient = recipient;
                                                                  try {
                                                                      c.fetchDetailedRecipientInformation(
                                                                          recipient.identifier,
                                                                      ).then(() => {
                                                                          c._(
                                                                              '#show-recipient-modal',
                                                                          ).open(
                                                                              c.currentRecipient,
                                                                          );
                                                                          c.button = button;
                                                                      });
                                                                  } catch {
                                                                      button.stop();
                                                                  } finally {
                                                                      button.stop();
                                                                  }
                                                              }}"
                                                              aria-label="${i18n.t(
                                                                  'show-requests.show-recipient-button-text',
                                                              )}"
                                                              title="${i18n.t(
                                                                  'show-requests.show-recipient-button-text',
                                                              )}"
                                                              icon-name="keyword-research"></dbp-icon-button>
                                                          ${
                                                              !c.currentItem.dateSubmitted
                                                                  ? html`
                                                                        <dbp-icon-button
                                                                            id="edit-recipient-btn"
                                                                            ?disabled="${
                                                                                c.loading ||
                                                                                c.currentItem
                                                                                    .dateSubmitted ||
                                                                                !c.mayWrite ||
                                                                                (recipient.personIdentifier &&
                                                                                    (recipient.electronicallyDeliverable ||
                                                                                        recipient.postalDeliverable))
                                                                            }"
                                                                            @click="${(event) => {
                                                                                let button =
                                                                                    event.target;
                                                                                button.start();
                                                                                c.currentRecipient =
                                                                                    recipient;
                                                                                try {
                                                                                    c.fetchDetailedRecipientInformation(
                                                                                        recipient.identifier,
                                                                                    ).then(() => {
                                                                                        c._(
                                                                                            '#edit-recipient-modal',
                                                                                        ).open(
                                                                                            c.currentRecipient,
                                                                                        );
                                                                                        c.button =
                                                                                            button;
                                                                                    });
                                                                                } finally {
                                                                                    button.stop();
                                                                                }
                                                                            }}"
                                                                            aria-label="${i18n.t(
                                                                                'show-requests.edit-recipients-button-text',
                                                                            )}"
                                                                            title="${i18n.t(
                                                                                'show-requests.edit-recipients-button-text',
                                                                            )}"
                                                                            icon-name="pencil"></dbp-icon-button>
                                                                        <dbp-icon-button
                                                                            id="delete-recipient-btn"
                                                                            ?disabled="${
                                                                                c.loading ||
                                                                                c.currentItem
                                                                                    .dateSubmitted ||
                                                                                !c.mayWrite
                                                                            }"
                                                                            @click="${(event) => {
                                                                                c.deleteRecipient(
                                                                                    event,
                                                                                    recipient,
                                                                                );
                                                                            }}"
                                                                            aria-label="${i18n.t(
                                                                                'show-requests.delete-recipient-button-text',
                                                                            )}"
                                                                            title="${i18n.t(
                                                                                'show-requests.delete-recipient-button-text',
                                                                            )}"
                                                                            icon-name="trash"></dbp-icon-button>
                                                                    `
                                                                  : ``
                                                          }
                                                      </div>
                                                  </div>
                                              `,
                                          )}
                                          <div
                                              class="no-recipients ${classMap({
                                                  hidden:
                                                      !c.isLoggedIn() ||
                                                      c.currentItem.recipients.length !== 0,
                                              })}">
                                              ${i18n.t('show-requests.no-recipients-text')}
                                          </div>
                                      </div>
                                  </div>

                                  ${c.addDetailedFilesView()}
                              </div>
                          `
                        : ``
                }
            </div>
        `;
    }
}

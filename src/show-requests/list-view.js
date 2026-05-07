import {css, html, LitElement} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {
    DBPSelect,
    IconButton,
    InlineNotification,
    LoadingButton,
    MiniSpinner,
    ScopedElementsMixin,
} from '@dbp-toolkit/common';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {ResourceSelect} from '@dbp-toolkit/resource-select';
import {TabulatorTable} from '@dbp-toolkit/tabulator-table';
import * as dispatchStyles from '../styles.js';

export class ShowRequestsListView extends ScopedElementsMixin(LitElement) {
    static get scopedElements() {
        return {
            'dbp-select': DBPSelect,
            'dbp-icon-button': IconButton,
            'dbp-inline-notification': InlineNotification,
            'dbp-loading-button': LoadingButton,
            'dbp-mini-spinner': MiniSpinner,
            'dbp-resource-select': ResourceSelect,
            'dbp-tabulator-table': TabulatorTable,
        };
    }

    static get properties() {
        return {
            controller: {attribute: false},
            options: {attribute: false},
        };
    }

    static get styles() {
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getButtonCSS()}
            ${commonStyles.getNotificationCSS()}
            ${dispatchStyles.getDispatchRequestStyles()}

            :host {
                display: block;
                width: 100%;
            }

            .control.table {
                padding-top: 1.5rem;
                font-size: 1.5rem;
                text-align: center;
            }

            .choose-and-create-btns {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .choose-and-create-btns dbp-resource-select {
                flex: 1;
                min-width: 250px;
            }

            .choose-and-create-btns dbp-select {
                margin-left: 10px;
            }

            #search-operator,
            #search-select,
            .dropdown-menu {
                background-color: var(--dbp-secondary-surface);
                color: var(--dbp-on-secondary-surface);
                border-color: var(--dbp-secondary-surface-border-color);
                background-size: auto 45%;
                padding-bottom: calc(0.375em - 1px);
                padding-left: 0.75em;
                padding-right: 1.5rem;
                padding-top: calc(0.375em - 1px);
                cursor: pointer;
                background-position-x: calc(100% - 0.4rem);
                box-sizing: content-box;
            }

            #search-select,
            #search-operator {
                margin-bottom: 10px;
                box-sizing: border-box;
                text-align: left;
            }

            .extended-menu.hidden {
                display: none !important;
            }

            #extendable-searchbar .extended-menu {
                list-style: none;
                border: var(--dbp-border);
                background-color: var(--dbp-background);
                z-index: 1000;
                border-radius: var(--dbp-border-radius);
                width: 100%;
                position: absolute;
                right: 0px;
                padding: 10px;
                box-sizing: border-box;
                top: 33px;
                margin: 0px;
                border-top: unset;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .search-wrapper {
                display: flex;
                justify-content: center;
                min-width: 300px;
            }

            .table-wrapper {
                display: flex;
                flex-direction: column;
                gap: 1em;
                align-items: stretch;
            }

            .selected-buttons {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1em;
                width: 100%;
            }

            .container,
            dbp-tabulator-table {
                display: block;
                width: 100%;
            }

            #extendable-searchbar {
                display: flex;
                flex-grow: 1;
                position: relative;
                width: 320px;
            }

            #searchbar {
                width: 100%;
                box-sizing: border-box;
                border: var(--dbp-border);
                padding: calc(0.375em - 1px) 10px;
                border-radius: var(--dbp-border-radius);
                min-height: 33px;
                background-color: var(--dbp-background);
                color: var(--dbp-content);
            }

            #search-button {
                margin-left: -40px;
                font-size: 1rem;
            }

            .edit-selection-buttons {
                display: flex;
                gap: 1em;
                margin-left: 1em;
            }

            #search-button dbp-icon,
            #open-settings-btn dbp-icon {
                top: -4px;
            }

            @media only screen and (max-width: 1150px) {
                .table-wrapper {
                    gap: 1em;
                }

                .selected-buttons,
                .filter-buttons {
                    width: 100%;
                }

                #extendable-searchbar {
                    width: 100%;
                }

                .edit-selection-buttons {
                    margin-left: 0;
                    width: 100%;
                }

                .edit-selection-buttons dbp-loading-button {
                    flex-grow: 1;
                    flex-shrink: 1;
                }
            }

            @media only screen and (max-width: 800px) {
                .edit-selection-buttons {
                    gap: 6px;
                }
            }

            @media only screen and (orientation: portrait) and (max-width: 768px) {
                .edit-selection-buttons {
                    display: flex;
                    gap: 1em;
                    width: 100%;
                }

                #searchbar {
                    width: 100%;
                    height: 40px;
                }

                #extendable-searchbar {
                    width: calc(-30px + 100vw);
                }

                #search-button {
                    position: absolute;
                    right: 0px;
                    top: 0px;
                    height: 40px;
                    box-sizing: border-box;
                }

                #search-button dbp-icon {
                    top: 0px;
                }

                #open-settings-btn {
                    margin-top: 0;
                }

                .table-wrapper {
                    flex-direction: column;
                    gap: 1em;
                }

                .filter-buttons {
                    width: calc(100% - 45px);
                }
            }
        `;
    }

    render() {
        if (!this.controller) {
            return html``;
        }

        const c = this.controller;
        const i18n = c._i18n;
        const options = this.options;

        return html`
            <div class="${classMap({hidden: c.showDetailsView})}">
                ${i18n.t('show-requests.organization-select-description')}
                <div class="choose-and-create-btns">
                    <dbp-resource-select
                        id="show-resource-select"
                        subscribe="lang,entry-point-url,auth"
                        lang="${c.lang}"
                        resource-path="dispatch/groups"
                        value="${c.groupValue}"
                        @change=${(event) => {
                            if (c.isLoggedIn() && !c.isLoading()) {
                                c.processSelectedOrganization(event).then(() => {});
                            }
                        }}></dbp-resource-select>
                    ${c.mayReadMetadata
                        ? html`
                              <dbp-select
                                  id="export-dropdown"
                                  label="${i18n.t('show-requests.export')}"
                                  @change="${c.handleExportSelection}"></dbp-select>
                          `
                        : ``}
                </div>
            </div>

            <div class="no-access-notification">
                <dbp-inline-notification
                    class="${classMap({
                        hidden:
                            !c.isLoggedIn() ||
                            c.isLoading() ||
                            c.loadingTranslations ||
                            c.mayWrite ||
                            !c.organizationSet,
                    })}"
                    type="${c.mayRead || c.mayReadMetadata ? 'warning' : 'danger'}"
                    body="${c.mayRead || c.mayReadMetadata
                        ? i18n.t('error-no-writes')
                        : i18n.t('error-no-read')}"></dbp-inline-notification>
            </div>

            <h3
                class="${classMap({
                    hidden:
                        !c.isLoggedIn() ||
                        c.isLoading() ||
                        c.showDetailsView ||
                        !c.organizationSet ||
                        c.loadingTranslations,
                })}">
                ${i18n.t('show-requests.dispatch-orders')}
            </h3>

            <div
                class="${classMap({
                    hidden:
                        !c.isLoggedIn() ||
                        c.isLoading() ||
                        c.loadingTranslations ||
                        c.showDetailsView ||
                        !c.organizationSet ||
                        (!c.mayRead && !c.mayReadMetadata),
                })}">
                <div class="table-wrapper">
                    <div class="selected-buttons">
                        <div
                            class="filter-buttons ${classMap({
                                hidden:
                                    !c.isLoggedIn() ||
                                    c.isLoading() ||
                                    c.loadingTranslations ||
                                    c.showDetailsView ||
                                    !c.organizationSet,
                            })}">
                            <div class="search-wrapper ">
                                <div id="extendable-searchbar">
                                    <input
                                        type="text"
                                        id="searchbar"
                                        placeholder="${i18n.t('show-requests.search-box-text')}"
                                        @click="${() => {
                                            c.toggleSearchMenu();
                                        }}" />
                                    <dbp-icon-button
                                        id="search-button"
                                        title="${i18n.t('show-requests.search-box-text')}"
                                        icon-name="search"
                                        aria-label="${i18n.t('show-requests.search-box-text')}"
                                        @click="${() => {
                                            c.filterTable();
                                        }}"></dbp-icon-button>
                                    <ul class="extended-menu hidden" id="searchbar-menu">
                                        <label for="search-select">
                                            ${i18n.t('show-requests.search-in')}:
                                        </label>
                                        <select
                                            id="search-select"
                                            class="button dropdown-menu"
                                            title="${i18n.t('show-requests.search-in-column')}:">
                                            ${c.getTableHeaderOptions()}
                                        </select>

                                        <label for="search-operator">
                                            ${i18n.t('show-requests.search-operator')} :
                                        </label>
                                        <select id="search-operator" class="button dropdown-menu">
                                            <option value="like">
                                                ${i18n.t('show-requests.search-operator-like')}
                                            </option>
                                            <option value="=">
                                                ${i18n.t('show-requests.search-operator-equal')}
                                            </option>
                                            <option value="!=">
                                                ${i18n.t('show-requests.search-operator-notequal')}
                                            </option>
                                            <option value="starts">
                                                ${i18n.t('show-requests.search-operator-starts')}
                                            </option>
                                            <option value="ends">
                                                ${i18n.t('show-requests.search-operator-ends')}
                                            </option>
                                            <option value="<">
                                                ${i18n.t('show-requests.search-operator-less')}
                                            </option>
                                            <option value="<=">
                                                ${i18n.t(
                                                    'show-requests.search-operator-lessthanorequal',
                                                )}
                                            </option>
                                            <option value=">">
                                                ${i18n.t('show-requests.search-operator-greater')}
                                            </option>
                                            <option value=">=">
                                                ${i18n.t(
                                                    'show-requests.search-operator-greaterorequal',
                                                )}
                                            </option>
                                            <option value="regex">
                                                ${i18n.t('show-requests.search-operator-regex')}
                                            </option>
                                            <option value="keywords">
                                                ${i18n.t('show-requests.search-operator-keywords')}
                                            </option>
                                        </select>
                                    </ul>
                                </div>
                            </div>

                            <dbp-icon-button
                                class="hidden ${classMap({
                                    hidden:
                                        !c.isLoggedIn() ||
                                        c.isLoading() ||
                                        c.loadingTranslations ||
                                        c.showDetailsView,
                                })}"
                                id="open-settings-btn"
                                ?disabled="${c.loading}"
                                @click="${() => {}}"
                                title="TODO"
                                icon-name="iconoir_settings"></dbp-icon-button>
                        </div>
                        <div
                            class="edit-selection-buttons ${classMap({
                                hidden:
                                    !c.isLoggedIn() ||
                                    c.isLoading() ||
                                    c.loadingTranslations ||
                                    c.showDetailsView,
                            })}">
                            ${c.mayWrite
                                ? html`
                                      <dbp-loading-button
                                          id="select-all-btn"
                                          class="${classMap({hidden: c.allSelected})}"
                                          value="${i18n.t('show-requests.select-all')}"
                                          @click="${() => {
                                              c.allSelected = true;
                                              const table = c._('#tabulator-table-orders');
                                              table.selectAllVisibleRows();
                                              c.toggleDeleteAndSubmitButtons(
                                                  '#tabulator-table-orders',
                                              );
                                          }}"
                                          title="${i18n.t('show-requests.select-all')}">
                                          ${i18n.t('show-requests.select-all')}
                                      </dbp-loading-button>
                                      <dbp-loading-button
                                          id="deselect-all-btn"
                                          class="${classMap({hidden: !c.allSelected})}"
                                          value="${i18n.t('show-requests.deselect-all')}"
                                          @click="${() => {
                                              c.allSelected = false;
                                              const table = c._('#tabulator-table-orders');
                                              table.deselectAllRows();
                                              c.toggleDeleteAndSubmitButtons(
                                                  '#tabulator-table-orders',
                                              );
                                          }}"
                                          title="${i18n.t('show-requests.deselect-all')}">
                                          ${i18n.t('show-requests.deselect-all')}
                                      </dbp-loading-button>
                                      <dbp-loading-button
                                          id="expand-all-btn"
                                          class="${classMap({hidden: c.expanded})}"
                                          ?disabled="${c.loading}"
                                          value="${i18n.t('show-requests.expand-all')}"
                                          @click="${() => {
                                              c.expandAll();
                                          }}"
                                          title="${i18n.t('show-requests.expand-all')}">
                                          ${i18n.t('show-requests.expand-all')}
                                      </dbp-loading-button>
                                      <dbp-loading-button
                                          id="collapse-all-btn"
                                          class="${classMap({hidden: !c.expanded})}"
                                          ?disabled="${c.loading}"
                                          value="${i18n.t('show-requests.collapse-all')}"
                                          @click="${() => {
                                              c.collapseAll();
                                          }}"
                                          title="${i18n.t('show-requests.collapse-all')}">
                                          ${i18n.t('show-requests.collapse-all')}
                                      </dbp-loading-button>
                                      <dbp-loading-button
                                          id="delete-all-btn"
                                          disabled
                                          value="${i18n.t('show-requests.delete-button-text')}"
                                          @click="${async (event) => {
                                              await c.deleteSelected();
                                              c.toggleDeleteAndSubmitButtons(
                                                  '#tabulator-table-orders',
                                              );
                                          }}"
                                          title="${i18n.t('show-requests.delete-button-text')}">
                                          ${i18n.t('show-requests.delete-button-text')}
                                      </dbp-loading-button>
                                      <dbp-loading-button
                                          id="submit-all-btn"
                                          disabled
                                          type="is-primary"
                                          value="${i18n.t('show-requests.submit-button-text')}"
                                          @click="${async (event) => {
                                              await c.submitSelected();
                                              c.toggleDeleteAndSubmitButtons(
                                                  '#tabulator-table-orders',
                                              );
                                          }}"
                                          title="${i18n.t('show-requests.submit-button-text')}">
                                          ${i18n.t('show-requests.submit-button-text')}
                                      </dbp-loading-button>
                                  `
                                : ``}
                        </div>
                    </div>

                    <div class="container">
                        <dbp-tabulator-table
                            lang="${c.lang}"
                            class="tabulator-table"
                            id="tabulator-table-orders"
                            identifier="orders-table"
                            collapse-enabled
                            pagination-size="10"
                            pagination-enabled
                            select-rows-enabled
                            sticky-header
                            .options=${options}></dbp-tabulator-table>
                    </div>
                    <div
                        class="control table ${classMap({
                            hidden: !c.initialRequestsLoading && !c.tableLoading,
                        })}">
                        <span class="loading">
                            <dbp-mini-spinner
                                text=${i18n.t(
                                    'show-requests.loading-table-message',
                                )}></dbp-mini-spinner>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}

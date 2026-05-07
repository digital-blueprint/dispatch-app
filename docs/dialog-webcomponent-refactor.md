# Dialog Web Component Refactor Plan

## Goal

Split modal dialogs out of the large dispatch activity classes into focused Lit web components in separate files. Modal dialogs should use `dbp-modal` from `@dbp-toolkit/common` instead of the local MicroModal wrapper.

## Current State

- `src/dbp-dispatch-lit-element.js` contains shared API/business logic and most dialog render methods.
- `src/dbp-create-request.js` and `src/dbp-show-requests.js` render the main activities and open dialogs directly with `MicroModal.show(...)`.
- Dialog forms are tightly coupled to parent components through hard-coded IDs and `this._(...)` queries into the parent shadow root.
- Modal-specific CSS in `src/styles.js` targets MicroModal DOM and specific modal IDs.

## Target Shape

- Each dialog lives in its own file under `src/dialogs/`.
- Each dialog is a Lit web component and wraps `dbp-modal` internally.
- Parent activities open dialogs through explicit component methods such as `open(...)` and `close()`.
- Dialogs emit semantic events such as `confirm`, `cancel`, `view-return-receipt`, or `delete-return-receipt`.
- Parent/base classes keep API calls, table updates, notifications, and global state updates.
- Dialog-internal layout styles move into the dialog component. Parent styles keep only activity/page layout.

## Dialog Migration Order

1. `edit-subject-modal`
2. `edit-reference-number-modal`
3. `add-subject-modal`
4. `file-viewer-modal`
5. `edit-sender-modal`
6. `edit-recipient-modal`
7. `add-recipient-modal`
8. `show-recipient-modal`

The first three are intentionally small and establish the API/event pattern before moving the more coupled recipient dialogs.

## API Pattern

Example parent usage:

```js
this._('#edit-subject-modal').open(this.currentItem.name ?? '');
```

Example parent render:

```html
<dbp-dispatch-edit-subject-modal
    id="edit-subject-modal"
    lang="${this.lang}"
    @confirm="${this.handleEditSubjectConfirm}"></dbp-dispatch-edit-subject-modal>
```

Example event detail:

```js
new CustomEvent('confirm', {
    detail: {subject},
    bubbles: true,
    composed: true,
});
```

## `dbp-modal` Notes

- Import `Modal` from `@dbp-toolkit/common` and register it as scoped element `dbp-modal`.
- Use the slots `content` and `footer`; use the `title` attribute for the normal title.
- Use `open()` and `close()` instead of `MicroModal.show(...)` and `MicroModal.close(...)`.
- Use the `dbp-modal-closed` event for cleanup formerly handled by MicroModal `onClose`.
- Configure dimensions with CSS variables such as `--dbp-modal-max-width`, `--dbp-modal-min-height`, and `--dbp-modal-content-overflow-y`.
- Prefer the built-in `dbp-modal` title instead of a custom `slot="title"` unless a dialog needs special title markup. This preserves the toolkit heading style and avoids font-size drift.
- Do not add dialog-wide font-size overrides unless needed. The old MicroModal dialogs inherited the activity typography, for example the edit-subject title computed to `18.72px`.
- Be careful with `sticky-footer`: it changes the modal grid behavior and can create large vertical gaps. Use it only when the old dialog had a fixed bottom footer.
- Dialog-specific content/footer layout should live in the extracted dialog component and mirror the old selector behavior from `src/styles.js` before removing those selectors.
- For compact form dialogs, use the old MicroModal dimensions as the baseline: `--dbp-modal-min-width: 320px`, the old max width, old min height, and `--dbp-modal-content-overflow-y: unset`.

## Styling Lessons From `edit-subject-modal`

- Avoid guessing from screenshots, especially high-DPI screenshots. Verify computed styles when possible.
- The old `edit-subject-modal` title was the global `h3` size, not a custom modal-specific large title.
- The extracted dialog now relies on the built-in `dbp-modal` title and only styles the content/footer slots.
- The footer uses `justify-content: space-between` so the cancel button stays on the left and the confirm button stays on the right.
- A top margin on the footer (`1em`) creates the vertical distance from the input for both buttons.
- Keep input and button font sizes inherited unless there is a concrete computed-size mismatch.

## Validation Strategy

- Run `npm run build` after each migration slice.
- Run `npm test` after dialog wiring changes.
- For each dialog, manually verify open, close, confirm, validation, and cleanup behavior in both `dbp-create-request` and `dbp-show-requests` if shared.

## Progress

- Extracted `edit-subject-modal` into `src/dialogs/edit-subject-modal.js`.
- Replaced edit-subject `MicroModal.show(...)` calls in `dbp-create-request` and `dbp-show-requests` with the dialog component `open(...)` API.
- Removed obsolete edit-subject MicroModal CSS selectors from `src/styles.js`.
- Restored the old edit-subject visual behavior after extraction: inherited typography, compact modal dimensions, cancel button on the left, confirm button on the right, and consistent vertical spacing below the input.
- Extracted `edit-reference-number-modal` into `src/dialogs/edit-reference-number-modal.js` using the same compact `dbp-modal` pattern as `edit-subject-modal`.
- Replaced edit-reference-number direct input queries and `MicroModal.show(...)` calls in `dbp-create-request` and `dbp-show-requests` with the dialog component `open(...)` API and `confirm` event.
- Updated `confirmEditReferenceNumber(...)` to receive the reference number from the dialog event instead of querying the parent shadow DOM.
- Removed obsolete edit-reference-number MicroModal CSS selectors from `src/styles.js`.
- Extracted `add-subject-modal` into `src/dialogs/add-subject-modal.js` using the same compact `dbp-modal` layout pattern, including the subject description text.
- Replaced the inline add-subject MicroModal markup in `dbp-create-request` with the dialog component and a `confirm` event.
- Updated `confirmAddSubject(...)` to receive the subject value from the dialog event instead of querying parent shadow DOM inputs/buttons.
- Removed obsolete add-subject MicroModal CSS selectors from `src/styles.js`.
- Extracted `file-viewer-modal` into `src/dialogs/file-viewer-modal.js` with the `dbp-pdf-viewer` owned by the dialog component.
- Replaced parent `#file-viewer` shadow DOM queries with a `showPDF(file)` method on the file-viewer dialog component.
- Removed obsolete file-viewer MicroModal CSS selectors from `src/styles.js`.
- Extracted `edit-sender-modal` into `src/dialogs/edit-sender-modal.js` with local form validation and country selection.
- Replaced parent sender field queries and `MicroModal.show(...)` calls with the dialog component `open(currentItem)` API and `confirm` event.
- Updated `confirmEditSender(...)` to receive sender form data from the dialog event instead of querying parent shadow DOM fields.
- Removed obsolete edit-sender MicroModal CSS selectors from `src/styles.js`.
- Extracted `edit-recipient-modal` into `src/dialogs/edit-recipient-modal.js` with local form validation, birthdate inputs, and country selection.
- Replaced parent recipient field queries and `MicroModal.show(...)` calls with the dialog component `open(currentRecipient)` API and `confirm` event.
- Updated `confirmEditRecipient(...)` to merge recipient form data from the dialog event before calling the existing `updateRecipient()` flow.
- Removed obsolete edit-recipient MicroModal CSS selectors from `src/styles.js`.
- Extracted `add-recipient-modal` into `src/dialogs/add-recipient-modal.js` with `dbp-person-select`, manual-entry state, local validation, reset behavior, birthdate inputs, and country selection owned by the dialog.
- Replaced parent add-recipient field queries, `recipient-selector` access, and `MicroModal.show(...)` calls with the dialog component `open({})` API and `confirm` event.
- Updated `addRecipientToRequest(...)` to receive recipient form data from the dialog event instead of querying parent shadow DOM fields.
- Removed obsolete add-recipient MicroModal CSS selectors and unused add-recipient helper methods from `src/dbp-dispatch-lit-element.js` / `src/styles.js`.
- Extracted `show-recipient-modal` into `src/dialogs/show-recipient-modal.js` with recipient detail rendering and return-receipt buttons owned by the dialog.
- Replaced parent `MicroModal.show(...)` calls with the dialog component `open(currentRecipient)` API.
- Replaced return-receipt button callbacks with semantic dialog events: `upload-return-receipt`, `download-return-receipt`, `view-return-receipt`, and `delete-return-receipt`.
- Removed obsolete show-recipient MicroModal CSS selectors from `src/styles.js` and moved the detail/status/return-receipt styles into the dialog component.
- Removed the now-unused local `src/micromodal.es.js` implementation after all app dialogs were migrated to `dbp-modal`.
- Removed leftover active MicroModal-era CSS from `src/styles.js`, including the unused `.modal-overlay`, `#add-sender-modal-*`, and `.modal-content-*` selectors.

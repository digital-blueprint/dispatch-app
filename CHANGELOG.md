# Changelog

## v1.6.3

- Improve UTF-8 detection for recipient CSV exports in Excel
- Replace the custom person selector with the resource selector and reset it when reopening the add-recipient dialog
- Use the toolkit login-required component for login notifications
- Pin to production version of esign activities
- Rename and update the Rolldown configuration
- Update toolkit, package dependencies, development tooling and CI actions

## v1.6.2

- Fix --dbp-selected variable in dark mode

## v1.6.1

- Fixed broken show-requests page when there was an error

## v1.6.0

- Lots of [changes](https://github.com/digital-blueprint/dispatch-app/compare/fd00a8eb3fcf6f5e4fbe83846cf45faf62f50fc8...564783d8e7c99d1b8073eeb4eec97ddac8c26e05)
- Migrate dialogs from MicroModal to dbp-modal and split them into dedicated web components
- Split the show requests page into list and detail web components and integrate routing-url
- Add recipient metadata export with localized column headers, additional request/status/delivery fields,
  Excel-friendly CSV output, a loading spinner and warning/error notifications
- Add icons and translations to buttons and align button styling with the new dbp UI guidelines
- Add real-time submit eligibility checks for requests
- Fix recipient and sender country selection, add-recipient reset/validation/person-selector behavior,
  tabulator language handling, select handling, URL encoding and ISO birth date submission
- Keep error and danger notifications visible until dismissed
- Normalize newlines in status descriptions and update their styling
- Update toolkit, signature, pdf.js, app templates, development tooling, CI and package dependencies

## v1.5.1

- App menu accessibility improvements

## v1.5.0

- Add download button to request attachments
- Replace deprecate 'queryLocal' by 'filter' query parameter for person-select
- Update toolkit and adapt to new PersonSelect signature
- New app shell/menu layout

## v1.4.0

- Update toolkit/esign and update pdf.js to v4; remove unsafe-eval from the CSP
- Allow adding address to recipients without electronic or postal delivery option
- Increase request count per page from 999 to 9999 for show request list
- Re-enable birthdate validation in add/edit recipient form
- Re-enable person selector after submitting the add recipient form
- Fix row selection with tabulator table
- Various UI, translation and a11y improvements

## v1.3.1

- Show special text for non-Austrian countries in the recipient-status
- Enable displaying and editing of sender in the UI
- Fix: `personIdentifer` is the actual identifier not an IRI
- Add return receipt upload/download/delete/view functionality

## v1.3.0

- Adjust for bundle API changes (PUT -> PATCH)

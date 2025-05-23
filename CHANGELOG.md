# Changelog

## Unreleased

- Add download button to request attachments

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

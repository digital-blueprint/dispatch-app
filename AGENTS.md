# Agents Instructions

## Important Notes for AI Assistants

- Only use English variables and comments in the code.
- Always write clear and concise comments for complex logic, start comments with uppercase letters.
- Don't try to open the webpage, the page is behind an SSO login, so you won't be able to access it.
- If you can use existing dbp-icons, use them instead of creating new icons.
    - Always loon at `./vendor/toolkit/packages/common/src/demo/icon-names.js` for existing icons.
- Everything needs to be properly translated with i18next.
- For dialogs always use dbp-modal.
- Don't update files in `dist/` as they are generated from the source files in `src/`
- If you need to update the `CHANGELOG.md`, make sure to follow the existing format and include the version number and a clear description of the changes made
- For building the whitelabel app the folder `assets/` is used for configuration and assets
- For building the TU Graz app the folder `assets_custom/` is used for configuration and assets
- For metadata changes you probably need to update files in `app-templates/`, `assets/` and `assets_custom/`
- Never use the every-word-capitalization form of writing because it's not consistent with the rest of the code!

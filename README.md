# Dual Delivery Application

[GitLab Repository](https://gitlab.tugraz.at/dbp/dual-delivery/dualdelivery) |
[npmjs package](https://www.npmjs.com/package/@dbp-topics/dualdelivery) |
[Unpkg CDN](https://unpkg.com/browse/@dbp-topics/dualdelivery/)

## Local development

```bash
# get the source
git clone git@gitlab.tugraz.at:dbp/topics/dualdelivery.git
cd dualdelivery
git submodule update --init

# install dependencies
yarn install

# constantly build dist/bundle.js and run a local web-server on port 8001 
yarn run watch

# run tests
yarn test
```

Jump to <http://localhost:8001> and you should get a Single Sign On login page.

To use the Nextcloud functionality you need a running Nextcloud server with the
[webapppassword](https://gitlab.tugraz.at/DBP/Middleware/Nextcloud/webapppassword) Nextcloud app like this
[Nextcloud Development Environment](https://gitlab.tugraz.at/DBP/Middleware/Nextcloud/webapppassword/-/tree/master/docker).

## Using this app as pre-built package

### Install app

If you want to install the DBP Dualdelivery App in a new folder `dualdelivery-app` with a path prefix `/` you can call:

```bash
npx @digital-blueprint/cli install-app dualdelivery dualdelivery-app /
```

Afterwards you can point your Apache web-server to `dualdelivery-app/public`.

Make sure you are allowing `.htaccess` files in your Apache configuration.

Also make sure to add all of your resources you are using (like your API and Keycloak servers) to the
`Content-Security-Policy` in your `dualdelivery-app/public/.htaccess`, so the browser allows access to those sites.

You can also use this app directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/dualdelivery/)
for example like this: [dbp-dualdelivery/index.html](https://gitlab.tugraz.at/dbp/dual-delivery/dualdelivery/-/tree/master/examples/dbp-dualdelivery/index.html)

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

### Update app

If you want to update the DBP Dualdelivery App in the current folder you can call:

```bash
npx @digital-blueprint/cli update-app dualdelivery
```

## Using a single activity as pre-built package

You can also use a single activity directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/dualdelivery/)
for example the `dbp-qualified-dualdelivery-pdf-upload` activity to qualifiedly sign PDF documents like this:
[dbp-qualified-dualdelivery-pdf-upload/index.html](https://gitlab.tugraz.at/dbp/dual-delivery/dualdelivery/-/tree/master/examples/dbp-qualified-dualdelivery-pdf-upload/index.html)

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

## Exposed CSS variables

- `--dbp-override-image-nextcloud` is used to override the cloud image on the connection screen of the Nextcloud file picker
    - example CSS: `html { --dbp-override-image-nextcloud: url(/icons/nextcloud.svg); }`

## "dbp-greenlight" Slots

These are common slots for the appshell. You can find the documentation of these slot in the `README.md` of the appshell webcomponent.

## Design Note

To ensure a uniform and responsive design the activity should occupy 100% of the window width when the activity width is less than 768 px.

## Mandatory attributes

If you are not using the `provider-root` attribute to "terminate" all provider attributes
you need to manually add these attributes so that the topic will work properly:

```html
<dbp-dualdelivery
    auth
    requested-login-status
    analytics-event
    initial-file-handling-state
    clipboard-files
>
</dbp-dualdelivery>
```

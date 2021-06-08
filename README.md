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

Not only you can use this app as pre-built package installed from [npmjs](https://www.npmjs.com/package/@dbp-topics/dualdelivery) via:

```bash
npm install @dbp-topics/dualdelivery
```

But you can also use this app directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/dualdelivery/)
for example like this: [dbp-dualdelivery/index.html](https://gitlab.tugraz.at/dbp/dual-delivery/dualdelivery/-/tree/master/examples/dbp-dualdelivery/index.html)

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

## Using a single activity as pre-built package

You can also use a single activity directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/dualdelivery/)
for example the `dbp-qualified-signature-pdf-upload` activity to qualifiedly sign PDF documents like this:
[dbp-qualified-signature-pdf-upload/index.html](https://gitlab.tugraz.at/dbp/dual-delivery/dualdelivery/-/tree/master/examples/dbp-qualified-signature-pdf-upload/index.html)

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

## Exposed CSS variables

- `--dbp-override-image-nextcloud` is used to override the cloud image on the connection screen of the Nextcloud file picker
    - example CSS: `html { --dbp-override-image-nextcloud: url(/icons/nextcloud.svg); }`

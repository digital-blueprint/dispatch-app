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
for example like this:

```html
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicons -->
    <link rel="shortcut icon" type="image/x-icon" href="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/favicon.ico">
    <link rel="icon" type="image/svg+xml" href="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/favicon.svg" sizes="any">

    <!-- PWA manfiest file -->
    <link rel="manifest" href="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/dbp-dualdelivery.manifest.json">

    <!-- Loading spinner -->
    <script type="module">
        import {Spinner} from 'https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/spinner.js';
        customElements.define('dbp-loading-spinner', Spinner);
    </script>

    <!-- App bundles-->
    <script type="module" src="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/dbp-dualdelivery.js"></script>

    <!-- Prevent Chrome/Edge from suggesting to translate the page -->
    <meta name="google" content="notranslate">

    <!-- Font related CSS -->
    <style>
        @import "https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/fonts/source-sans-pro/300.css";
        @import "https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/fonts/source-sans-pro/400.css";
        @import "https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/fonts/source-sans-pro/600.css";

        body {
            font-family: 'Source Sans Pro', 'Calibri', 'Arial', 'sans-serif';
            font-weight: 300;
            margin: 0;
        }

        /* TU-Graz style override */
        html {
            --dbp-override-primary-bg-color: #245b78;
            --dbp-override-primary-button-border: solid 1px #245b78;
            --dbp-override-info-bg-color: #245b78;
            --dbp-override-danger-bg-color: #e4154b;
            --dbp-override-warning-bg-color: #ffe183;
            --dbp-override-warning-text-color: black;
            --dbp-override-success-bg-color: #259207;
        }
    </style>

    <!-- Preloading/Preconnecting -->
    <link rel="preconnect" href="https://mw-dev.tugraz.at">
    <link rel="preconnect" href="https://auth-dev.tugraz.at/auth">
</head>
<body>
    <dbp-dualdelivery
        lang="de" entry-point-url="https://mw-dev.tugraz.at"
        show-nextcloud-file-picker
        show-clipboard
        allow-annotating
        nextcloud-web-app-password-url="https://nc-dev.tugraz.at/pers/index.php/apps/webapppassword"
        nextcloud-webdav-url="https://nc-dev.tugraz.at/pers/remote.php/dav/files"
        nextcloud-name="TU Graz cloud"
        nextcloud-file-url="https://nc-dev.tugraz.at/pers/index.php/apps/files/?dir="
        initial-file-handling-state
        clipboard-files
        auth requested-login-status analytics-event
        src="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/dbp-dualdelivery.topic.metadata.json"
        base-path="/"
        keycloak-config='{"url": "https://auth-dev.tugraz.at/auth", "realm": "tugraz", "clientId": "auth-dev-mw-frontend-local", "silentCheckSsoRedirectUri": "/silent-check-sso.html"}'
        matomo-url='https://analytics.tugraz.at/'
        matomo-site-id='131'
    ><dbp-loading-spinner></dbp-loading-spinner></dbp-dualdelivery>
    
    <!-- Error handling for too old browsers -->
    <script src="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/browser-check.js" defer></script>
    <noscript>Diese Applikation benötigt Javascript / This application requires Javascript</noscript>
</body>
</html>
```

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

## Using a single activity as pre-built package

You can also use a single activity directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/dualdelivery/)
for example the `dbp-qualified-signature-pdf-upload` activity to qualifiedly sign PDF documents like this:

```html
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Package bundles-->
    <script type="module" src="https://unpkg.com/@dbp-toolkit/provider@0.2.2/dist/dbp-provider.js"></script>
    <script type="module" src="https://unpkg.com/@dbp-toolkit/auth@0.2.2/dist/dbp-auth.js"></script>
    <script type="module" src="https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/dbp-qualified-signature-pdf-upload.js"></script>

    <!-- Prevent Chrome/Edge from suggesting to translate the page -->
    <meta name="google" content="notranslate">

    <!-- Font related CSS -->
    <style>
        @import "https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/fonts/source-sans-pro/300.css";
        @import "https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/fonts/source-sans-pro/400.css";
        @import "https://unpkg.com/@dbp-topics/dualdelivery@1.0.8/dist/local/@dbp-topics/dualdelivery/fonts/source-sans-pro/600.css";

        body {
            font-family: 'Source Sans Pro', 'Calibri', 'Arial', 'sans-serif';
            font-weight: 300;
            margin: 0;
        }

        /* TU-Graz style override */
        html {
            --dbp-override-primary-bg-color: #245b78;
            --dbp-override-primary-button-border: solid 1px #245b78;
            --dbp-override-info-bg-color: #245b78;
            --dbp-override-danger-bg-color: #e4154b;
            --dbp-override-warning-bg-color: #ffe183;
            --dbp-override-warning-text-color: black;
            --dbp-override-success-bg-color: #259207;
        }
    </style>

    <!-- Preloading/Preconnecting -->
    <link rel="preconnect" href="https://mw-dev.tugraz.at">
    <link rel="preconnect" href="https://auth-dev.tugraz.at/auth">
</head>

<body>

<dbp-provider auth requested-login-status analytics-event lang="de" entry-point-url="https://mw-dev.tugraz.at">
    <dbp-auth-keycloak client-id="auth-dev-mw-frontend-local" idp-hint=""
                       load-person="" realm="tugraz" scope=""
                       silent-check-sso-redirect-uri="/silent-check-sso.html"
                       subscribe="requested-login-status,entry-point-url,lang"
                       try-login=""
                       url="https://auth-dev.tugraz.at/auth"
    ></dbp-auth-keycloak>
    <dbp-login-button subscribe="auth,lang"></dbp-login-button>
    <dbp-qualified-signature-pdf-upload subscribe="lang,entry-point-url,auth"></dbp-qualified-signature-pdf-upload>
</dbp-provider>

</body>
</html>
```

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

# Dual Delivery Application

[GitLab Repository](https://gitlab.tugraz.at/dbp/topics/dualdelivery)

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

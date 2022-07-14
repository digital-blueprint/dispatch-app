# Dual delivery activities

Here you can find the individual activities of the `dual delivery` app.
If you want to use the whole app look at [dual delivery documentation](https://gitlab.tugraz.at/dbp/dual-delivery/dispatch).

## Usage of an activity

You can use every activity alone. Take a look at our examples [here](https://gitlab.tugraz.at/dbp/dual-delivery/dispatch/-/tree/master/examples).

## Activities

### Shared Attributes

These attributes are available for all activities listed here:

- `lang` (optional, default: `de`): set to `de` or `en` for German or English
    - example `lang="de"`
- `entry-point-url` (optional, default is the TU Graz entry point url): entry point url to access the api
    - example `entry-point-url="https://api-dev.tugraz.at"`
- `auth` object: you need to set that object property for the auth token
    - example auth property: `{token: "THE_BEARER_TOKEN"}`
    - note: most often this should be an attribute that is not set directly, but subscribed at a provider

### dbp-dd-activity

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

#### Attributes
See [shared attributes](#shared-attributes).


### dbp-qualified-signature-pdf-upload

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

#### Attributes

See [shared attributes](#shared-attributes).

### dbp-official-signature-pdf-upload

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.


#### Attributes

See [shared attributes](#shared-attributes).


## Design Note

To ensure a uniform and responsive design these activities should occupy 100% width of the window when the activities' width are under 768 px.


## Mandatory attributes

If you are not using the `provider-root` attribute to "terminate" all provider attributes
you need to manually add these attributes so that the topic will work properly:

```html
<dbp-dispatch
        auth
        requested-login-status
        analytics-event
        initial-file-handling-state
        clipboard-files
>
</dbp-dispatch>
```

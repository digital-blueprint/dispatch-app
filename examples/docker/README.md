# Docker Example

- <http://dbp-web.localhost:8100>
- <http://keycloak.localhost:8100>
- <http://api-demo.localhost:8100>

## Setup

- Install Docker and docker-compose
- Run `docker-compose up`
- Run `docker-compose exec keycloak /bin/bash -c 'cd /opt/keycloak/bin && ./kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin && ./kcadm.sh set-password -r dbp --username demo --new-password demo'`
  - If you have "make" installed you can also run `make keycloak-set-password` instead
- Now you should be able to open <http://dbp-web.localhost:8100> and login with `demo`/`demo`

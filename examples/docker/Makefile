keycloak-reset:
	docker-compose down
	docker volume rm dispatch-example_postgres_data

web-bash:
	docker-compose exec web bash

postgres-bash:
	docker-compose exec postgres bash

keycloak-set-password:
	docker-compose exec keycloak /bin/bash -c 'cd /opt/keycloak/bin && ./kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin && ./kcadm.sh set-password -r dbp --username demo --new-password demo'

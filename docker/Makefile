.PHONY: bash show-log

bash:
	docker-compose exec nextcloud su -c "bash" www-data

root-bash:
	docker-compose exec nextcloud bash

maintenance-mode-off:
	docker-compose exec nextcloud su -c "./occ maintenance:mode --off" www-data

fulltextsearch-index:
	docker-compose exec nextcloud su -c "./occ fulltextsearch:index" www-data

fulltextsearch-live:
	docker-compose exec nextcloud su -c "./occ fulltextsearch:live" www-data

fulltextsearch-stop:
	docker-compose exec nextcloud su -c "./occ fulltextsearch:stop" www-data

show-log:
	docker-compose exec nextcloud tail -f /var/www/html/data/nextcloud.log

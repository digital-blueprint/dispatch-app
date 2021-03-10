.PHONY: bash show-log

bash:
	docker-compose exec nextcloud su -c "bash" www-data

maintenance-mode-off:
	docker-compose exec nextcloud su -c "./occ maintenance:mode --off" www-data

fulltextsearch-index:
	docker-compose exec nextcloud su -c "./occ fulltextsearch:index" www-data
	#docker-compose run --rm nextcloud su -c "./occ fulltextsearch:index" www-data

fulltextsearch-live:
	docker-compose exec nextcloud su -c "./occ fulltextsearch:live" www-data
#	docker-compose run --rm nextcloud su -c "./occ fulltextsearch:live" www-data

show-log:
	docker-compose exec nextcloud tail -f /var/www/html/data/nextcloud.log

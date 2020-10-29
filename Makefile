deploy:
	yarn export
	rsync out/ -av root@116.62.217.57:/var/www/html/next-blog

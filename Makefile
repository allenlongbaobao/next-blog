deploy:
	yarn export
	rsync out/ -av root@116.62.217.57:/var/www/html/next-blog


deploy-node:
	rm -rf ./deploy
	mkdir deploy
	cd deploy && git init . && git remote add origin root@116.62.217.57:/root/aogante/next-blog-bare.git && cd ../
	cp `ls |grep -v node_modules|xargs` ./deploy 
	cd deploy && git add -A && git commit -am "deploy" && git push origin master -f
	rm -rf ./deploy

deploy:
	yarn export
	rsync out/ -av root@116.62.217.57:/var/www/html/next-blog

# 需要重新编译
deploy-node:
	rm -rf ./.deploy
	mkdir .deploy
	yarn build
	yarn postbuild
	cd .deploy && git init . && git remote add origin root@116.62.217.57:/root/aogante/next-blog-bare.git && cd ../
	cp -r `ls |grep -v node_modules|xargs` ./.deploy 
	cp .npmrc ./.deploy
	cd .deploy && rm -rf node_modules && git add -A && git commit -am "deploy" && git push origin master -f
	rm -rf ./.deploy

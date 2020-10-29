# 林克的博客

部署：
  目标服务器：阿里云（116）  
  方式：git hooks + node + nginx 反向代理  
  命令： `make deploy-node`


注意：
  next 也支持静态文件输出，运行 `next build && next export` 即可，这样只需要用 nginx 起静态服务即可，但是有个弊端，没有 ssr 渲染了
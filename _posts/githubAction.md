---
title: '如何借助GitHub Action 做自动部署'
excerpt: '如何借助GitHub Action 做自动部署'
coverImage: '/assets/blog/dynamic-routing/cover.jpg'
date: '2020-10-29'
author:
  name: 林克 
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: '/assets/blog/dynamic-routing/cover.jpg'
---

## 参考链接：
https://didiheng.com/front/2019-12-11.html#github-action%E9%85%8D%E7%BD%AE
http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html

## 目的
  前端项目（尤其是单页应用）发布相对简单，可以直接在 Makefile 中集合 `yarn build` + `rsync`，便可以将编译后的文件传到服务器，但这样的硬核操作不利于项目的持续集成，一是部署和编译没有对应关系，二是不利于部署后的回滚，因为没有版本的概念
  基于以上的认识，我们更希望项目能稳定迭代，有迹可循，出了问题可以方便地回退。要做到以上几点，我们需要在部署和 git 之间建立联系，github actions 可以帮助我们做到这一点。
  下面，我们就围绕 `代码合到 master 分支后，自动将应用发布到线上（服务器）` 这一目的展开讨论。

## 核心概念
  actions 基于 `yml` 编排文件执行命令, 下面是某个前端单页项目的自动部署文件

  ```yml
  # main.yml
  name: deploy to server
  on:
    push:
      branches:
        - master
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        # 切换分支
        - name: Checkout
          uses: actions/checkout@master
        # 下载 git submodule
        - uses: srt32/git-actions@v0.0.3
          with:
            args: git submodule update --init --recursive
        # 使用 node:10
        - name: use Node.js 10
          uses: actions/setup-node@v1
          with:
            node-version: '10.x'
        # 缓存依赖项
        - name: Cache node modules
          uses: actions/cache@v1
          env:
            cache-name: cache-node-modules
          with:
            # npm 缓存文件存储在 Linux/macOS 上的 `~/.npm` 中
            # yarn 需要自定义缓存目录
            path: ~/.yarn
            key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/yarn.lock') }}
            restore-keys: |
              ${{ runner.os }}-build-${{ env.cache-name }}-
              ${{ runner.os }}-build-
              ${{ runner.os }}-
        # yarn install
        - name: yarn and build
          # 声明缓存目录
          run: |
            yarn --cache-folder ~/.yarn
            yarn build
          env:
            CI: true
        # Deploy
        - name: Deploy
          uses: easingthemes/ssh-deploy@v2.0.7
          env:
            SSH_PRIVATE_KEY: ${{ secrets.SERVER_ACCESS_TOKEN }}
            ARGS: '-av --delete'
            SOURCE: dist/
            REMOTE_HOST: "[REMOTE_HOST]"
            REMOTE_USER: "[REMOTE_USER]"
            TARGET: "[TARGET]"
  ```

  简单名词解释：

    1. name, 本 workflow 的名称  
    2. on，触发 workflow 的条件  
    3. jobs 任务，可以声明多个子 job，各个job 之间可以声明依赖关系  
    4. run-on: 指定运行环境  
    5. steps: 该 job 中的各个步骤  

## 说明
  其他 `steps` 没有太多问题，按照说明进行即可。需要注意的两步
  
  1. cache，node_module 通常很大，耗时较长，并且项目稳定迭代后，大部分发布是不需要去修改了。因此可以作为 cache 项，从而减少每次发布的时间。 借助官方的插件即可，包管理工具是 npm 的直接使用文档中的配置即可，npm 缓存文件存储在 Linux/macOS 上的 `~/.npm` 中。而使用 yarn 的需要自定义声明缓存路径, 即在安装时声明 `yarn --cache-folder ~/.yarn`
  2. `deploy`, 它的本质是将 `build` 之后的文件 `rsync` 到服务器指定目录下，因此需要配置公私钥。SSH_PRIVATE_KEY 指的是 ssh 的私钥，需要在服务器上运行： `ssh-keygen -m PEM -t rsa -b 4096`, 将私钥保存到 项目的 secrets 中, 公钥放在服务器的 `~/.ssh/authorized_keys` 文件中
  详情可见 [Github Action ssh deploy](https://github.com/marketplace/actions/ssh-deploy#configuration)

  第二个在另一个项目中再次使用 private-key，一直报 rsync 失败的错误。重新生成之后就可以了。备忘!!

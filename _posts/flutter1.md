---
title: '【Flutter系列之一】mac + vscode 环境安装篇'
excerpt: 'flutter mac + vscode 环境安装篇，对其中可能的坑做了记录'
coverImage: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/Needed-to-Know-About-Flutter-Interact-2020-1.jpg'
date: '2020-11-01'
author:
  name: 林克
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: '/assets/blog/dynamic-routing/cover.jpg'
---

如题，讲讲安装中遇到的坑，并没有放弃，谢谢!
由于本文是由我在入手 Flutter 过程中的记录整理而成，所以有些流水账，请多担待!

首先，flutter 的文档很翔实，但有些配置不够精准，有可能是需要适配的编辑器、编译环境太多，众口难调。

我是一名 web 前端开发，所以编辑器更习惯用 `vscode`，os 环境为 macOS，参考官网的 [安装指引](https://flutter.dev/docs/get-started/install/macos)，如果是其他的编辑器或者 os，对不起，可能本文对你并没有帮助

首先下载安装包没有问题

解压包也没有问题

路径指定这边需要小心，上一步解压的路径和指定路径需要一致 (记得 source 一下)

结束后测试一下： flutter 命令是否正常执行

flutter 安装好之后，安装vs code 插件：

* flutter
* Dart

完成后执行一下 `flutter doctor -v`
`android` 我们暂时不考虑，`xcode` 相关如果版本号达不到最低版本，那就需要升级到最新的 `xcode`,然后按提示安装相关模块，这里没有遇到坑。

然后起一个demo项目 `flutter create myapp`，此时会惊喜地发现 `vscode` 中 `main.dart` 文件中所有关键字都报错了。
试着运行一下: `flutter packages get` 原因可能是一些关键包是通过外部更新的方式，需要手动执行下载

最后我们来启动一下这个示例项目，我们发现 devices 那里什么都没有。试着理解一下，我们需要先提供一个模拟器或者真机，vscode 才能检测到，去连接，因此，如果你想在模拟器上调试一番，那么就运行一下： `open -a Simulator`，打开模拟器后，devices 中应该检测到了设备，F5 即可

以上我们便可以启动一个示例项目，并完成了安装到放弃的全过程。

接下去，我会从

  * from f2e to dart- 从前端出发学习 Dart  
  * 样式和布局  
  * 路由和页面管理  
  * 接口和通信  
  * 应用发布  

几个章节来完成这个系列。

Thanks for you reading!

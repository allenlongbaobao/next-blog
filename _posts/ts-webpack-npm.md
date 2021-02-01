---
title: 'TS + Webpack 打包一个 NPM 包'
excerpt: '使用 Typescript 和 webpack 打包一个自己的 npm 包'
coverImage: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/npm-package-manager-for-node-js.jpg'
date: '2021-02-01'
author:
  name: 林克
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: ''
---
## TS + Webpack 打包一个 NPM 包

  本文写于2021年初，用到的主要库的版本的文末有统一注明。
  
  日常开发中我们会有一些统一的模块可以抽象出来，其中一个选择就是将其打包为 npm 包，便于在其他项目中引入和使用。这里我想以 ts + webpack 打包一个有 ts 和 scss 样式文件的包为例，简单聊一下如何来打一个包，以及其中可能会遇到的问题以及对应的解决方案

  ### 期望产物
  我们希望这个包能被引入到 TS、ES6 以及 ES5 项目中，同时可以使用 cdn 的方式加载到 html 中

  ### 打包为 commonJS 和 ES Module

  TS 提供了 tsc 编译工具，可以将 TS 编译成 commonJS 以及 ES6 代码，无法其他的打包工具。

  安装 `typescript`，配置 `tsconfig.json`

  tsconfig.json:
  ```js
  {
    "compilerOptions": {
      "allowSyntheticDefaultImports": true,
      "noImplicitAny": true,
      "module": "commonjs",
      "target": "es5",
      "lib": ["es2015", "DOM"],
      "allowJs": true,
      "declaration": true, // 生成 .d.ts 文件
      "declarationMap": false,
      "baseUrl": ".",
      "outDir": "./lib",
      "downlevelIteration": true
    },
    "files": ["src/index.ts"],
    "exclude": ["node_modules"]
  }
  ```

  以上是生成 commonJS 的配置，直接运行 `tsc` 即可在 `lib` 文件夹中生成相关代码 如果需要生成 `ES6` 模块，可以运行： `tsc -m es6 --outDir lib-esm`

  ### 打包为 universal

  部分的库可能不仅包含了 js/ts，还有一些样式文件也是它功能的一部分。tsc 仅仅只能打包 ts 代码，对于样式文件等非ts文件束手无策。对于这些库，引入 webpack/rollup 这类打包工具就是必要的了，对于上面上述两个工具孰优孰劣不再这边讨论。这里我选择 webpack@5.x 进行打包。

  首先，安装 `webpack`: yarn add -D webpack webpack-cli

  初始化项目： webpack init，按照提示选择对应的配置

  目的：这里我使用 webpack 打包主要有两个目的：一是生成 umd 代码，可以用于 cdn 加载，而是将 scss 文件打包成 css 文件，同样用于 cdn

  出于以上的目的，我们的 output 配置为

  ```js
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '_bundles'),
    library: 'short-cut',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  ```

  module: 

  ```js
    module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [{ loader: 'awesome-typescript-loader' }],
        include: [path.resolve(__dirname, 'src')],
        exclude: [/node_modules/],
      },
      {
        test: /.(scss|css)$/,

        use: [
          /** 分离 css */
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',

            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',

            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  ```

  plugins:

  ```js
  plugins: [
    new MiniCssExtractPlugin({ filename: 'index.css' }),
  ],
  ```

  ### d.ts 文件如何存放
  对于 ts 项目的类型定义文件，有两种解决方案，一是随项目定义，tsc 中通过配置可以将 每个 ts 文件中的定义抽离到对应的 d.ts 文件中。这些文件可以帮助调用方拥有代码提示。
  另外一种解决方案是将所有的 定义文件单独放在一个目录中，然后以 PR 的方式上传到下面的项目中
  [@types](https://github.com/DefinitelyTyped/DefinitelyTyped)
  我们在开发用到的很多老库采用的就是这种方式。

  ### CDN
  [unpkg](https://unpkg.com/) 会收录所有发布到 npm 的静态资源，对于发布到公有 npm 平台的包，可以直接使用。

  ### 单元测试

  测试 TS 项目，建议使用 [ts-jest](https://github.com/kulshekhar/ts-jest)
  它可以帮我们忽略编译打包这个过程，也无需选择使用 babel 还是 tsc 来打包，并且有完整的定义提示，很适合使用 ts 来写的的 npm 包单元测试，因为业务代码是 ts， 测试代码也是 ts，语言的统一是极大有利于测试逻辑的编写的。
  美中不足的是，由于使用了 ts，一些属性会被隐藏，比如 类中的私有属性。对于想要进行深入的测试，这类属性可能无法作为测试的考量。解决方法也有，比如将 private 调整为 protected，但终究是需要做一些调整。所以我会同时使用两个方案：ts-jest 和 tsc -> commonJS + jest
  前者用来测试 浅层的 测试，后者用来测试一些私有变量变化

---
  遇到问题: 样式文件无法被 jest 识别，该怎么办？

  解决方法：利用 moduleNameMapper 将样式文件映射到一个可识别的文件。推荐：

  ```js
    yarn add --dev identity-obj-proxy
  ```

  ```js
    // -- jest.config.js
    "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
  ```

  ### 过程中出现的问题
  1. 打包后 type.d.ts 在项目中无法被加载，或者加载后并不能被正确打包  


  2. 我们期望打包成那些模块，各自分别适用于哪些项目  
    这里我们打包成了三种模块：UMD、commonJS、es6。分别对应了 浏览器、node 以及 es6 项目。进一步说，UMD 打包结果可以直接用于 cdn 资源，在 script 标签中加载可以直接使用

    commonJS 是 node 的默认模块机制，如果一个 npm 需要用于 node 项目，那么建议支持 commonJS 模块

    es6 则是现在大部分前端项目使用的模块机制，因此对于前端 npm 包而言是必要的。
  3. tsc -m es6 打包会报错，node_modules/@types/ 中的模块路径错误  


  ### 结尾
  使用到的主要库版本说明：  

  * typescript: 4.1.3   
  * webpack: 5.18.0  
  * jest: 26.6.3  

  最终的打包结果可以在 [git 项目](https://github.com/allenlongbaobao/short-cut) 中可以看到。

  ### 参考链接
  
  * [short-cutting npm 包](https://github.com/allenlongbaobao/short-cut)
  * [publish-ts-modules-npm](https://moduscreate.com/blog/publishing-typescript-modules-npm/)


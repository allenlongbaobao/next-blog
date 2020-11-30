---
title: '【CSS 定义系列】之 Width, Height'
excerpt: 'css 官方定义，width，height, line-height, 宽度、高度、行高'
coverImage: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/css-2189148_640.png'
date: '2020-11-30'
author:
  name: 林克
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/css-2189148_640.png'
---

[原文链接](https://www.w3.org/TR/WD-CSS2-971104/flowobj2.html#h-11.1.1)

译者注：该文档是 css 官方文档，很多知识点都是潜移默化在大部分前端开发者脑海中，但知道官方是怎么定义这些属性对我们解决一些疑难杂症能提供一些思路

### 11.1 `width` 宽度属性

一个盒子元素的宽度不是由它的子元素或者自身的内容决定的，而是由 `width` 这个属性决定

width:  
  属性名：`width`  
  值：length | percentage | auto  
  初始值: auto  
  适用于：块状元素和 replaced 元素（值得是内容是外部资源的元素，比如 img, iframe, video, audio, embeded 等）  
  百分比的值：父元素的 width   

这个属性可以应用于文本元素，但它最有用的是那些 replaced 元素，比如图片。负值是不被允许的

举个例子：

```
IMG.icon { width: 100px }
```

如果一个 replaced 元素的 width 和 height 都设为 auto，那么 这些属性会被设为元素的自身属性

#### 11.1.1 `width` 相关

可以到 [图解](https://www.w3.org/TR/WD-CSS2-971104/box.html#box-model) 查看盒模型对象渲染图解

一个块状元素的宽度被 7 个属性决定：
  * `margin-left`
  * `border-left`
  * `padding-left`
  * `width`
  * `padding-right`
  * `border-right`
  * `margin-right`

对于在文档流的元素，这七个元素之盒等于父元素的内容宽度 （也就是说文档流中的元素就是砖块一样，一层包一层，没有额外的空隙）

对于一个内联或者浮动元素而言，这七个属性中每个属性如果被设置为 `auto`, 那么它就会被当作是 0。

横向的 margins 不会产生坍塌（纵向的 多个margin 之间，如果没有其他元素，那么就会发生坍塌）

### 11.1.2 浮动 和 replaced 元素的 `width`

对于 浮动或者 replaced 元素而言，width 的计算是这样的：  
  1. 上面提到的七个属性中的三个可以被设为 `auto`: 'margin-left`, 'width', 'margin-right'. 对于 replaced 元素而言，width 值为 auto， 那么它会被自身的width 值所替代  
  2. 如果 `margin-left`, `width`, `margin-right` 中有且只有一个被设为 `auto`，那么 UA 会被这个属性设一个值，使得那七个元素之和依然等于父元素的宽度   
  3. 如果没有一个元素被设为 `auto`, 那么 `margin-right` 的值会被设置为 `auto`   
  4. 如果超过一个元素被设为 `auto`, 并且其中有一个是 `width`，那么另外的元素（margin-left 且/或 margin-right） 会被设置为 0，并且 `width` 会被赋值，使得七个元素之和等于父元素之和   
  5. 否则，如果 `margin-left` 和 `margin-right` 为 auto，那么他们会被设为相同值，这会让元素水平居中   

### 11.1.3 绝对定位元素的宽度

绝对定位元素的盒模型宽度由 `width` 这一个属性决定 !!!

但是，如果 `width` 属性是 `auto`, 那么盒模型的宽度由 `left` 和 `right` 属性决定。注意它们替代了 `margin-left` 和 `margin-right` 两个属性， 这两个属性对绝对定位的元素无效。

如果三个属性都是 `auto`， 那么元素的宽度就继承父元素的宽度。

### 11.1.4 最小宽度和最大宽度: `min-width` 和 `max-width`
它们在某些场景下对于限制元素宽度在某个范围内很有用。这两个属性提供以下功能：

`min-width`  
  属性名：'min-width'  
  值： `<length>` | `<percentage>`  
  初始值： 0  
  应用于：所有  
  是否继承： 否  
  百分比的值： 父元素的 `width`  

`max-width`  
  属性名：'max-width'  
  值： `<length>` | `<percentage>`  
  初始值：100%  
  应用于：所有  
  是否继承：否  
  百分比的值：父元素的 width  

  ---

  以下算法描述了这两个属性是如何影响宽度计算的：  
    1. 正常计算 width (不考虑 `min-width` 和 `max-width`),并计算出一个 `width`  
    2. 如果 `min-width` 的值 比 `max-width` 要大，那么 `max-width` 应该设为和 `min-width` 相同的值 (这意味着两者存在一个优先级，min-width > max-width)  
    3. 如果计算出来的 `width` 比 `max-width` 要大，那么 `width` 的值被设置为和 `max-width` 相同，返回1  
    4. 如果计算出来的 `width` 比 `min-width` 要小，那么 `width` 的值被设置为和 `min-width` 相同，返回1  
    5. 终止

  如果算法终止，那么使用最终计算得到的 `width` 作为元素的 `width`

  ### 11.2 盒模型高度计算：`height` 属性
     
  一个盒模型元素的高度指的是它所需要的最小高度去包含垂直方向的内容以及它的文档流子元素。这是不考虑任何子元素偏移量的必要高度

  但是，一个元素的高度也可以被明确设置，通过 `height` 属性

  `height`  
    属性名：'height'  
    值：`<length>` | `auto`  
    初始值：`auto`  
    应用于: 块状元素和 replaced 元素  
    是否继承：否  
    百分比的值：父元素的宽度  

  这个属性可以设置给文本，但它最有用的还是设置 replaced 元素，比如 图片

  如果一个 replaced 元素的 `width` 和 `height` 都是 `auto`, 那么这两个属性会被设置为 元素自身的属性值  

  如果height 应用在一个文本元素上，那么高度会被用户操作所强制（比如，出现了进度条）

  高度不可以被设置为负值 

  浏览器有可能忽视 `height` 属性 （比如，将其视为 auto）如果元素不是一个 replaced 元素

  ##### 11.2.1 replaced 元素的高度

  replaced 元素的高度计算类似于它的 width 计算

  #### 11.2.2 绝对定位元素的高度

  一个绝对定位元素的高度由 `height` 属性声明。`height` 属性的百分比值通过它的父元素的高度值计算得出。但是，当父元素的高度值为 `auto` 时，百分比高度值会失效 

  如果高度值为 `auto`，那么元素的高度由 `top` 和 `bottom` 决定。注意  它们替代了 `top-margin` 和 `bottom-margin` 属性，这两个属性不应用于绝对定位元素

  如果这三个属性都是 `auto`，那么元素的高度就是继承元素的高度

  #### 11.2.3 最小和最大高度：`min-height` 和 `max-height`

  类似于 min-width 和 max-width

  #### 11.2.4 margin 坍塌

  两个及以上的垂直方向的 margin（比如，没有 border,padding 和 content 在它们之间） 会被坍塌，即只使用最大的 margin 值。在大部分场景下，坍塌之后的 margin 计算会更接近设计师的期望 

  至于 负数的 margins,负数的 margin 会扣除相邻的margins 中最大的正数 margins。如果没有正数 margins，那么负数的margins 会被视为 0

  ### 11.3 行高计算：`line-height` 和 `vertical-align` 属性


  行盒子高度由以下方式决定。所有的元素都有 `line-height` 属性，它们有以下意义：
  
  * 如果设置在块状元素中，它表明这个元素中所有的 文本行的最小行高
  * 如果设置在内联元素中，它就表示这个元素自身的行高

  由于多个内联元素可能在同一行中生成内联box，所在行的最终行高为父块状元素声明的最小行高和所有内联元素的行高中的最大值。  
  replaced 元素创建的内联盒子（比如，内联图片）同样影响行的高度，但是是通过 `height` 和 `vertical-align` 属性，而不是 `line-height` 属性。  
  如果，replaced 元素的顶部超过了最高的文字区域，或者底部 低于 文字区域的底部，replaced 元素会增加行盒子的高度。  

  如果一行中的文字小于行高，那么文字的顶部和底部会被填充空间。比如，如果文本的字号是 12pt,所在行的行高是 14pt, 那么 2pt 的多余空间会被增加，1pt 在顶部，1pt 在底部。空元素的计算和这些有内容的元素计算方式相同

  字号 和 行高的差成为 `leading`，`leading` 的一半成为 `half-leading`。如果一行文字中包含了不同的行高值，那么每一个内联元素都拥有自己的 `half-leading` 在顶部和底部

  注意：一个内联盒子的顶部和底部并不一定参考最高的元素，因为元素在垂直方向上可以被 `vertical-align` 属性影响。

  非 replaced 元素顶部和底部的 padding、borders、margins 并不会影响行的高度。换句话说，如果 对于某个元素，`line-height` 属性值相对于 `padding` 或者 `border` 太小了，这一行的文字会覆盖在其他行的文本上

  正常情况下，一个段落只会有一个 `line-height` 值，并且没有 图片。上面的定义会保证这些行的基线会和 `line-height` 匹配。这对于不同行的文本，字号也不同，但需要对齐的情况非常重要，比如说在表格中。

  注意这并不能避免相邻行覆盖的情况。`line-height` 可能小于文本的真实高度，在这种情况下，leading 会是个负值。This is useful if you know that the text will contain no descenders (e.g., because it only contains uppercase), so the lines can be put closer together.


  `line-height`  
    属性名：`line-height`  
    值： `normal` | `<number>` | `<length>` | `<percentage>`    
    默认：`normal`    
    适用于：所有元素   
    是否继承: 是    
    百分比值：自身的字号  

  这是属性设置了相邻行基线之间的距离

  当行高是个数字时，行高的值等于 自身的 font-size * line-height，这个和 百分号不同，当子元素继承时，会继承这个数字值，而百分号，则会继承最后的计算结果

  同样，这个值不能是负值。

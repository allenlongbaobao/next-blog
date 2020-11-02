---
title: 'Javascript 中的 this 指向性问题'
excerpt: 'Javascript 中的 this 指向性问题'
coverImage: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/aonaotu-download-3.png'
date: '2020-10-30'
author:
  name: 林克
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: ''
---
一直以来，`this` 这个关键字困扰着 JS 开发者，很多使用了 JS 多年的开发者也可能在这上面栽跟头。

首先，用一张思维导图来概括一下：
![思维导图](https://linke-blog.oss-cn-shanghai.aliyuncs.com/aonaotu-download-3.png)

`this` 的使用有四种场景 

> 1、 指向全局  
> 2、 函数调用  
> 3、 方法调用  
> 4、 构造函数  
> 5、 自定义环境变量，call、apply、bind  

## 全局
当在全局环境中运行代码，this指向的就是全局变量，如在浏览器中是window对象

```js
var a = 10
console.log(this.a)
// 10
```
## 函数调用
关于函数调用，很多博文都说是指向全局： 如[阮老师的博文](http://www.ruanyifeng.com/blog/2010/04/using_this_keyword_in_javascript.html)，和[秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/#function.this)

我们在chrome的控制台中测试一下：

![](https://user-gold-cdn.xitu.io/2018/3/4/161f0f6a0086587e?w=1524&h=446&f=png&s=68572)
我们发现，在函数中，this对象的确指向了全局

## 方法调用
当作为方法调用时，this对象指向的是调用者对象

```
var isage = 10
var test = {
	age: 11,
	a: function () {
		console.log(this.age)
	}
}
test.a()
// 11
```
我们可以看到，this指向的是test对象

## 构造函数
在构造函数中，this指向的构造函数创建的新对象

```
function func (){
	this.dog = 'dog'
}

var animal = new func()
console.log(animal.dog)
// dog
```

## 自定义环境变量
`call`、 `apply`、`bind`三个函数都可以传入环境变量，不同的是call中第二个参数是参数值， apply传入的是数组，bind是返回新函数

```
function foo (){
	var a = 1
	console.log(this.a)
}
var obj1 = {
    a:2
};
var obj2 ={
    a:3
};
foo.call(obj1)

// 2
```

# 不正常情况
讲完了这些 「正常」的使用场景，下面开始「不正常」场景，所谓的不正常其实是因为加入了函数调用、箭头函数特性这些其他干扰因素。

> 1、 箭头函数中的this 是外部函数的this，本身并没有this，调用时不会影响其上下文
> 2、 高阶函数调用可以分布进行，这样上下文一目了然

先上一道在掘金上很有名的关于this辨析题：

```
var name = 'window'

var person1 = {
  name: 'person1',
  show1: function () {
    console.log(this.name)
  },
  show2: () => {
  	console.log(this.name)
  },
  show3: function () {
    return function () {
      console.log(this.name)
    }
  },
  show4: function () {
    return () => console.log(this.name)
  }
}
var person2 = { name: 'person2' }
person1.show1()
person1.show1.call(person2)

person1.show2()
person1.show2.call(person2)

person1.show3()()
person1.show3().call(person2)
person1.show3.call(person2)()

person1.show4()()
person1.show4().call(person2)
person1.show4.call(person2)()
```
我们试着用上面总结的各种技巧来分析这个怪物：

### person1.show1()
show1 是一个正常函数，属于方法调用，很显然，this指向person1对象，输出 `person1`

### person1.show1.call(person2)
环境变量自定义，this指向person2，输出 `person2`

### person1.show2()
show2是一个箭头函数，是es6新属性，箭头函数有个特性，它没有this值，它保存的是外部函数的this，所以我理解的show2等价于: 

```
var name = 'window'
var self = this
var person1 = {
	show2: function () {
		console.log(self.name)
	}
}
```
所以输出的是 `window`
### person1.show2.call(person2)

结合上面的理解，this值都没了，你传个person2进去也没有用，所以输出的是`window`

### person1.show3()()
show3 是一个多次调用函数，等价于： 

```
var temp = person1.show3()
temp()
```
这样一来，执行环境就是全局了，输出的是 `window`

### person1.show3().call(person2)
好，这个就有点大魔王的意思了。我们还是一样，一点点分析，这个方法是不是等价于这个：

```
var temp = person1.show3()
temp.call(person2)
```
这样一来，执行环境就是person2， 输出的是 `person2`
### person1.show3.call(person2)()
这个和上面的不太一样，分析一下是这样的：

```
var temp = person1.show3.call(person2)
temp()
```
所以执行环境还是全局，输出`window`

### person1.show4()()
show4 返回一个箭头函数，做一个下转化是这样的: 

```
var person1 = {
	name: 'person1',
	show4: function (){
		var self = this
		return function (){
			console.log(self.name)
		}
	}
}

var temp = person1.show4()
temp()
```
我们看到，在person1.show4(),执行时，self = this 指向就是person1,之后再执行temp()，时，self是不会再改变了，所以输出的是 `person1`

### person1.show4().call(person2)

结合上一题分析： 

```
var temp = person1.show4()
temp.call(person2)
```
所以， 还是输出 `person1`

### person1.show4.call(person2)()

结合上上题分析：
 
```
var temp = person1.show4.call(person2)
temp()
```
这次不一样了，self = this 指向的是person2
所以输出的是 `person2`

综上，这道题的最终答案是： 

```
person1
person2

window
window

window
person2
window

person1
person1
person2
```

### 加点其他的，这几个函数中，吸引我的是show1 和 show3，如果说，show3中我定义一个name结果会是怎么样呢？


```
var name = 'window'
var person1 = {
	name: 'person1',
	show3: function (){
		var name = 'show3'
		return function (){
			console.log(this.name)
		}
	}
}

person1.show3()()
```

答案还是 `window`

那么如果我在show1中再加一个函数呢？ 

```
	var name = 'window'
	var person1 = {
		name: 'person1',
		show1: function (){
			console.log(this.name)
			function test (){
				console.log（this.name）
			}
			test()
		}
	}
	person1.show1()
```
输出的是 `person1 window`

可以这里的test 指向的是全局，也应证了前面的第二条：函数调用指向全局
如果想改写的话，只需要用 `var self = this` 来保存当前的上下文即可，这个应用场景很多，如果常见的`setTimtout(fn, o)`

END.
参考链接：   
[阮老师的博文](http://www.ruanyifeng.com/blog/2010/04/using_this_keyword_in_javascript.html)   
[秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/#function.this)    
[从这两套题，重新认识JS的this、作用域、闭包、对象](https://juejin.im/post/6844903493845647367)  
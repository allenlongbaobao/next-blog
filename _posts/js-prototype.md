---
title: 'Javascript 中实现对象原型继承的三种方式'
excerpt: 'Javascript 中实现对象原型继承的三种方式'
coverImage: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/aonaotu-download-4.png'
date: '2020-10-30'
author:
  name: 林克
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/aonaotu-download-3.png'
---

Javascript 中有一个思想：万物皆对象，几个基础类型（String, Number, Boolean, Null, Undefined, Symbol），几个引用类型（Array, Date, Function, Object, Regexp）本质上都是对象。

![img](https://linke-blog.oss-cn-shanghai.aliyuncs.com/aonaotu-download-4.png)

那么对象之间如何实现关联（也就是OO里面的继承）呢？js中通过prototype(原型)来实现。每个对象都有一个__proto__指针，指向上一个原型，这就像是一个链表。最顶端的object的原型指向null, 代表终结。
所以，当我们定义一个变量：

```
let name = new String('allen')
//let name = 'allen'
console.log('name:', name)
console.log('name.__proto__:', name.__proto__)
console.log('name.__proto__.__proto__:',name.__proto__.__proto__)	
console.log('name.__proto__.__proto__.__proto__:', name.__proto__.__proto__.__proto__)
```

输出：

```
name: [String: 'allen']
name.__proto__: [String: '']
name.__proto__.__proto__: {}
name.__proto__.__proto__.__proto__: null
[Finished in 0.1s]
```

我们要实现继承（至少看上去是继承的样子）有三种方法: 

> 1. Object.create(), 
> 2. Function.prototype={},
> 3. class extend

## 1. Object.create()

看例子： 

```
let dog = {
	name: 'dog'
	}
	
let mardDog = Object.create(dog)
``` 
这里 `mardDog` 是一个新的空对象，存有一个指针`__proto__`，指向的是 `dog` 对象, `dog`对象中也有一个`__proto__`,指向的是`Object`，`Object`中也有一个`__proto__`,指向的是`null`。
这就是原型链。利用Object.create()，我们可以创建多个对象，`dog`对象都是他们的原型，那么他们可不可以改变dog里面的属性呢。答案是可以 的，但不建议。代码如下：

```
mardDog.name = 'mardDog'

/*
dog ====> {name: 'dog'}
mardDog ====> {name: 'mardDog'}
*/
```
可以看到，我们并没有能改变原型中的属性。而下面这种方式：

```
mardDog.__proto__.name = 'xxxDog'

/*
	dog ====> {name: 'xxxDog'}
	mardDog ====> {name: 'mardDog'}
*/
```
我们成功改变了上一层的属性。
那么，为什么我们不推荐使用__proto__去改变原型中的共有属性呢？因为这种方法非常慢，并且会严重影响进程。事实上，__proto__从来没有被写进规范，但是浏览器厂商都实现了它。

## 2. Function.prototype = {}

这个方法其实是利用构造函数来实现
先看例子：

```
function dog (){
	this.name = 'dog'
	this.age = 1
}

let dog1 = new dog()

function mardDog (){
	this.yiel = function (){
		console.log(this.name)
	}
}

mardDog.prototype = new dog()

let mardDog1 = new mardDog()
mardDog1.yiel()
```
输出： 

```
dog
[Finished in 0.1s]
```
可以看到，我们成功实现了mardDog 对 dog的继承

## 3. class extend

es6中实现了 `class` 这个关键字，虽然只是语法糖，本质上是方法二的封装，但这种思路对熟悉OO的开发者是很友好的，并且把js中令人迷惑的原型封装了起来，使它变得更容易开发。

例子：

```js
class dog {
   constructor () {
   	this.name = 'dog'
   	this.age = 1
   }
}

class mardDog extends dog {
	constructor () {
		super()
	}
	yiel () {
		console.log(this.name)
	}
}
let mardDog1 = new mardDog()
mardDog1.yiel()
``` 
输出： 

```
dog
```
这样我们成功地实现了继承

## 总结

由于es6 是大势所趋，建议在工程环境中使用clas来实现对象的继承。当然原型以及原型链的原理是必须掌握的。es6中还有一些方法也是十分有用。以下：

> Object.getPrototypeOf(childobj) 顾名思义，该方法得到childobj的prototype,也可以理解为父类。  
> ***  
> Object.setPrototypeOf(childObj, obj）这个方法是将childObj设为obj的继承类。由于前面提到过，对prototype的操作十分微妙，所以这个方法还是能不用就不用，可以用Object.create(obj)来代替  
> ***  
> 其他方法参照[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)上的解释  

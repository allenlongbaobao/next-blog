---
title: 'WebSocket + Go 实现双向通信'
excerpt: 'webSocket + go + vue，实现双向数据通信'
coverImage: 'https://linke-blog.oss-cn-shanghai.aliyuncs.com/golang.png'
date: '2021-01-18'
author:
  name: 林克
  picture: '/assets/blog/authors/allen.jpeg'
ogImage:
  url: '/assets/blog/dynamic-routing/cover.jpg'
---
## WebSocket + Go 实现双向通信

  在做 aoki 时，因为消息推送需要服务端主动发起，因此有机会走了一遍这个流程。前端用的 vue， 不过是相通的，可以使用任意框架来实现。


### 准备
在前后端需要主动发送信息的场景下， webSocket 是其中一个解决方案。在 go 中，我们选用 [gorilla/websocket](https://pkg.go.dev/github.com/gorilla/websocket) 这个包来实现前后端双向通信的基本功能


### 直入主题
重点问题：

1. 如何实现有状态  
2. 如何处理客户端 close 事件   

### 前端
首先，我们先贴上前端的代码

```js
export default class WsController {
  static toRememberList = []

  static interval = null

  socket = null

  vue = null

  constructor(vue) {
    this.vue = vue
    this.startConnect()
    this.initEvent()
  }

  /**
   * 初始化事件，主要是在浏览器窗口关闭、页面重载时，关闭 socket 连接，这是浏览器端比较特殊
   */
  initEvent() {
    window.onclose = () => {
      this.disConnect()
    }
    window.onbeforeunload = () => {
      this.disConnect()
    }
  }

  /**
   * 初始化 webSocket
   */
  initWebSocket() {
    const host = window.location.protocol === 'https:' ? process.env.VUE_APP_WS_HOST_SSL : process.env.VUE_APP_WS_HOST

    this.socket = new WebSocket(`${host}/ws`)

    this.socket.onopen = () => {
      console.log('ws连接成功')
    }
    this.socket.onmessage = (event) => {
      // handle with event.data
    }

    this.socket.onclose = () => {
      console.log('已经与服务器断开连接')
      this.socket = null
    }

    this.socket.onerror = () => {
      if (this.socket) {
        this.socket.close()
      }
      console.log('WebSocket异常！')
    }
  }

  /**
   * 监听重连
   */
  watch() {
    WsController.interval = setInterval(() => {
      if (!this.socket) {
        this.redirect()
      }
    }, 5000)
  }

  /**
   * 重连
   */
  async redirect() {
    if (this.vue.user && this.vue.user.username) {
      console.log('重连')
      this.initWebSocket()
    } else {
      clearInterval(WsController.interval)
    }
  }

  /**
   * 断开连接
   */
  disConnect() {
    if (this.socket) {
      console.log('断开连接')
      this.socket.onclose = () => {} // 重置 onclose 监听事件
      this.socket.close(1000, '用户登出')
    }
  }

  /**
   * 开始连接
   */
  startConnect() {
    this.initWebSocket()
    this.watch()
  }
}
```

围绕的关键点：

  * 建立连接  
  * 断线重连  
  * 发送消息 (前端暂时没有用到这一功能，其实也很简单 socket.send() 即可)  
  * 接受消息  
  * 断开连接  

### 后端

  双向连接，意味着两端都需要处理以上这些关键点，可能前端因为平台机制的原因，需要处理的场景多一些，但关键点两端应该基本是一致的。

使用到的类库:

```go
  import (
    "github.com/gorilla/websocket"
    "log"
    "net/http"
  )
```

监听连接：

```go
  func StartWebSocket() {
    http.HandleFunc("/ws", wsHandler)
    http.ListenAndServe(":3335", nil)
    http.ListenAndServeTLS(":3335", cert_pem, cert_key, nil)
  }
```

维护整个 socket 管理：

```go
  var manager = ClientManager{
    broadcast:  make(chan []byte),
    register:   make(chan *Client),
    unregister: make(chan *Client),
    clients:    make(map[int]*Client),
  }

  var (
    upgrader = websocket.Upgrader {
      // 读取存储空间大小
      ReadBufferSize:1024,
      // 写入存储空间大小
      WriteBufferSize:1024,
      // 允许跨域
      CheckOrigin: func(r *http.Request) bool {
        return true
      },
    }
  )
```

wsHandler 处理核心：

```go
  var wsHandler = func(w http.ResponseWriter, r *http.Request) {
    // 连接
    log.Print("有客户端连接了")
    var token, cookieErr = r.Cookie("token")
    if cookieErr != nil {
      log.Print("连接失败，用户未登录")
      return
    }
    var user, userErr = web.GetUserByToken(token.Value)

    if userErr != nil {
      log.Print(userErr)
      return
    }

    var (
      wbsCon *websocket.Conn
      err error
    )
    // 完成http应答，在httpheader中放下如下参数
    if wbsCon, err = upgrader.Upgrade(w, r, nil);err != nil {
      return // 获取连接失败直接返回
    }

    // 断连的处理方法
    wbsCon.SetCloseHandler(func (code int, text string) error {
      log.Print("客户端断开连接 ->", text)
      manager.clients[user.ID] = nil
      return nil
    })

    var client = &Client{
      id: user.ID,
      socket: wbsCon,
      send:   nil,
    }
    manager.clients[user.ID] = client

    // 持续监听
    readLoop(wbsCon)
  }

  func readLoop(c *websocket.Conn) {
    for {
      if _, _, err := c.NextReader(); err != nil {
        // 错误信息，关闭连接
        c.Close()
        break
      }
    }
  }

  // 发送数据
  func Send(userId int, card *models.Flashcard) bool {
    var client = manager.clients[userId]
    if client == nil {
      log.Print("客户端没有连接，推送无效")
      return false
    }

    if err := client.socket.WriteJSON(card); err != nil {
      client.socket.Close()
      return false
    }
    return true
  }

```

这里重点是一个问题：  
  `状态管理`，也可以理解为如何识别用户。因为请求进来后，我们需要知道是哪个用户建立了连接，之后才能将正确的内容发送给对的人。我在这里使用的 token，因为 websocket 在连接时，会带上 cookie，我们可以根据 cookie 中的 token 来判断该用户是否已登录，如果已登录，那么就认为它是正常的连接，并将该用户的 socket 存储起来。

  这样又会带来新的问题：一是 cookie 不能跨域，当域名不一致时，cookie 就不会携带；二是连接的存储不应该放在内存中，而是应该放在数据库中，比如 redis，这样服务重启后已在使用的用户不会丢失连接（当然，这一点也可以放在客户端做，客户端有断线重联机制）

参考链接：
  https://www.gorillatoolkit.org/pkg/websocket

  https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket/send

  https://tools.ietf.org/html/rfc6455#section-7.1
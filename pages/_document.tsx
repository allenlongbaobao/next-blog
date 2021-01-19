import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <script defer src="https://hm.baidu.com/hm.js?1d2bb1da3654d9c3c8d42546c6e8691e"></script>
        <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.5.0/styles/atom-one-dark.min.css" />

        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
        <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.5.0/highlight.min.js"></script>
        <script>hljs.initHighlightingOnLoad();</script>
      </Html>
    )
  }
}

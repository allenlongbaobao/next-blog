import markdownStyles from './markdown-styles.module.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css';
import { useEffect, useRef } from 'react';

type Props = {
  content: string
}

const PostBody = ({ content }: Props) => {
  const ref = useRef(null)
  useEffect(() => {
    if (!!ref && !!ref.current) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block as HTMLElement);
      });
    }
  }, [ref])
  return (
    <div className="max-w-6xl mx-auto">
      <div
        ref={ref}
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

export default PostBody

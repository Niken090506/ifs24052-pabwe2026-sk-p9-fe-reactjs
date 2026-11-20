import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownViewer({ content, theme }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const viewer = new Viewer({
      el: rootRef.current,
      initialValue: content,
      theme: theme === 'dark' ? 'dark' : 'light',
    })
    return () => viewer.destroy()
  }, [content, theme])

  return <div ref={rootRef} data-testid="markdown-viewer" />
}

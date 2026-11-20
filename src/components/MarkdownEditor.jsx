import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ value, onChange, theme }) {
  const rootRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: rootRef.current,
      height: '420px',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      initialValue: value,
      theme: theme === 'dark' ? 'dark' : 'light',
      usageStatistics: false,
      events: { change: () => onChangeRef.current(editor.getMarkdown()) },
    })
    editorRef.current = editor
    return () => editor.destroy()
    // Editor dibuat ulang hanya saat tema berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    const editor = editorRef.current
    if (editor.getMarkdown() !== value) editor.setMarkdown(value)
  }, [value])

  return <div ref={rootRef} data-testid="markdown-editor" />
}

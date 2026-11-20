import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const editorInstances = []
vi.mock('@toast-ui/editor', () => ({
  default: class {
    constructor(options) {
      this.options = options
      this.value = options.initialValue
      options.el.textContent = 'editor'
      this.destroy = vi.fn()
      editorInstances.push(this)
    }
    getMarkdown() {
      return this.value
    }
    setMarkdown(v) {
      this.value = v
    }
  },
}))
const viewerInstances = []
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: class {
    constructor(options) {
      options.el.textContent = options.initialValue
      this.options = options
      this.destroy = vi.fn()
      viewerInstances.push(this)
    }
  },
}))

import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'
import Modal from './Modal'
import AppLink from './AppLink'

describe('MarkdownViewer', () => {
  it('merender konten dan tema, lalu destroy saat unmount', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="# Hai" theme="dark" />)
    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('# Hai')
    expect(viewerInstances.at(-1).options.theme).toBe('dark')
    const first = viewerInstances.at(-1)
    rerender(<MarkdownViewer content="baru" theme="light" />)
    expect(first.destroy).toHaveBeenCalled()
    expect(viewerInstances.at(-1).options.theme).toBe('light')
    unmount()
  })
})

describe('MarkdownEditor', () => {
  it('menginisialisasi editor dan meneruskan perubahan', () => {
    const onChange = vi.fn()
    render(<MarkdownEditor value="isi" onChange={onChange} theme="dark" />)
    const editor = editorInstances.at(-1)
    expect(editor.options.theme).toBe('dark')
    expect(editor.options.usageStatistics).toBe(false)
    editor.value = 'ketik'
    editor.options.events.change()
    expect(onChange).toHaveBeenCalledWith('ketik')
  })

  it('menyinkronkan value dari luar dan membuat ulang saat tema berubah', () => {
    const { rerender, unmount } = render(<MarkdownEditor value="a" onChange={() => {}} theme="light" />)
    const first = editorInstances.at(-1)
    expect(first.options.theme).toBe('light')
    rerender(<MarkdownEditor value="b" onChange={() => {}} theme="light" />)
    expect(first.value).toBe('b')
    rerender(<MarkdownEditor value="b" onChange={() => {}} theme="dark" />)
    expect(first.destroy).toHaveBeenCalled()
    unmount()
  })
})

describe('Modal', () => {
  it('menampilkan judul, footer, dan menutup via tombol & Escape', async () => {
    const onClose = vi.fn()
    const { unmount } = render(
      <Modal title="Judul" titleId="t" onClose={onClose} footer={<button>Simpan</button>}>
        <p>isi</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Judul' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    await userEvent.click(screen.getByRole('button', { name: 'Tutup dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(document, { key: 'a' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('AppLink', () => {
  it('klik biasa melakukan navigasi SPA', async () => {
    render(<AppLink href="/author">Ke</AppLink>)
    await act(async () => {
      await userEvent.click(screen.getByRole('link', { name: 'Ke' }))
    })
    expect(window.location.pathname).toBe('/author')
  })

  it('ctrl+klik dibiarkan membuka tab baru', () => {
    render(<AppLink href="/admin">Ke</AppLink>)
    const link = screen.getByRole('link', { name: 'Ke' })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link, { ctrlKey: true })
    expect(window.location.pathname).toBe('/')
  })
})

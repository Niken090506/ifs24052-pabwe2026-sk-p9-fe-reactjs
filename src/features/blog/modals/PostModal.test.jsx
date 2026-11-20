import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({ createPost: vi.fn(), updatePost: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))
vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange, theme }) => (
    <textarea aria-label="editor" data-theme={theme} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))
import { createPost, updatePost } from '../api/blogApi'
import { showError, showSuccess } from '../../../helpers/toolsHelper'
import PostModal from './PostModal'

describe('PostModal', () => {
  it('validasi judul dan isi wajib', async () => {
    render(<PostModal post={{}} theme="light" onClose={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Tambah Artikel' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul dan isi artikel wajib diisi.')
    expect(createPost).not.toHaveBeenCalled()
  })

  it('membuat artikel baru', async () => {
    createPost.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<PostModal post={{}} theme="dark" onClose={vi.fn()} onSaved={onSaved} />)
    await userEvent.type(screen.getByLabelText('Judul'), ' Judul Baru ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.type(screen.getByLabelText('Ringkasan (excerpt)'), ' Ringkas ')
    await userEvent.click(screen.getByLabelText('Publikasikan artikel'))
    expect(await screen.findByLabelText('editor')).toHaveAttribute('data-theme', 'dark')
    await userEvent.type(screen.getByLabelText('editor'), 'isi')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({
      title: 'Judul Baru',
      category: 'Bisnis',
      excerpt: 'Ringkas',
      content: 'isi',
      is_published: true,
    })
    expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil dibuat.')
  })

  it('mengedit artikel yang ada', async () => {
    updatePost.mockResolvedValue({})
    const onSaved = vi.fn()
    const post = { id: 9, title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c', is_published: true }
    render(<PostModal post={post} theme="light" onClose={vi.fn()} onSaved={onSaved} />)
    expect(screen.getByRole('dialog', { name: 'Edit Artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(updatePost).toHaveBeenCalledWith(9, { title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c', is_published: true })
    expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil diperbarui.')
  })

  it('menampilkan error saat simpan gagal dan Batal menutup modal', async () => {
    createPost.mockRejectedValue(new Error('Gagal simpan'))
    const onClose = vi.fn()
    render(<PostModal post={{ title: 'T', content: 'C' }} theme="light" onClose={onClose} onSaved={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Gagal simpan'))
    expect(screen.getByRole('button', { name: 'Simpan' })).not.toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})

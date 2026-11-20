import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({
  getMyPosts: vi.fn(),
  getStats: vi.fn(),
  getMyPost: vi.fn(),
  togglePublish: vi.fn(),
  deletePost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  confirmAction: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))
vi.mock('../modals/PostModal', () => ({
  default: ({ post, onClose, onSaved }) => (
    <div role="dialog" aria-label="post-modal">
      <span>{`post:${post.title || 'baru'}`}</span>
      <button onClick={onClose}>tutup-post</button>
      <button onClick={onSaved}>saved-post</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ onClose, onApply }) => (
    <div role="dialog" aria-label="ai-modal">
      <button onClick={onClose}>tutup-ai</button>
      <button onClick={() => onApply({ title: 'Draf AI' })}>apply-ai</button>
    </div>
  ),
}))
import { deletePost, getMyPost, getMyPosts, getStats, togglePublish } from '../api/blogApi'
import { confirmAction, showError, showSuccess } from '../../../helpers/toolsHelper'
import AuthorDashboard from './AuthorDashboard'

const posts = [
  { id: 1, slug: 'satu', title: 'Satu', category: 'Teknologi', is_published: true, updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, slug: 'dua', title: 'Dua', category: 'Bisnis', is_published: false, updated_at: '2026-01-02T00:00:00Z' },
]

const setup = async (list = posts) => {
  getMyPosts.mockResolvedValue(list)
  getStats.mockResolvedValue({ total_posts: 2, total_published: 1, total_draft: 1 })
  render(<AuthorDashboard theme="light" />)
  await screen.findByRole('heading', { name: 'Artikel Saya' })
}

describe('AuthorDashboard', () => {
  it('menampilkan statistik dan tabel artikel', async () => {
    getMyPosts.mockResolvedValue(posts)
    getStats.mockResolvedValue({ total_posts: 2, total_published: 1, total_draft: 1 })
    render(<AuthorDashboard theme="light" />)
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
    expect(await screen.findByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Terbitkan artikel Satu' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Terbitkan artikel Dua' })).toHaveAttribute('aria-checked', 'false')
  })

  it('menampilkan pesan error', async () => {
    getMyPosts.mockRejectedValue(new Error('Gagal memuat'))
    getStats.mockResolvedValue({})
    render(<AuthorDashboard theme="light" />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat')
  })

  it('menampilkan keadaan kosong', async () => {
    await setup([])
    expect(screen.getByText(/Belum ada artikel/)).toBeInTheDocument()
  })

  it('toggle publikasi sukses & gagal', async () => {
    await setup()
    togglePublish.mockResolvedValue({})
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan artikel Dua' }))
    expect(togglePublish).toHaveBeenCalledWith(2)
    await waitFor(() => expect(getMyPosts).toHaveBeenCalledTimes(2))
    togglePublish.mockRejectedValue(new Error('toggle gagal'))
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan artikel Dua' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('toggle gagal'))
  })

  it('menu kebab: buka/tutup, Lihat hanya untuk artikel terbit', async () => {
    await setup()
    const kebab1 = screen.getByRole('button', { name: /Aksi untuk Satu/ })
    await userEvent.click(kebab1)
    expect(kebab1).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: /Lihat/ })).toHaveAttribute('href', '/posts/satu')
    await userEvent.click(kebab1)
    expect(screen.queryByRole('menu')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /Aksi untuk Dua/ }))
    expect(screen.queryByRole('menuitem', { name: /Lihat/ })).toBeNull()
  })

  it('edit artikel membuka modal dengan data lengkap; gagal menampilkan error', async () => {
    await setup()
    getMyPost.mockResolvedValue({ id: 1, title: 'Satu Lengkap' })
    await userEvent.click(screen.getByRole('button', { name: /Aksi untuk Satu/ }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Edit/ }))
    expect(await screen.findByText('post:Satu Lengkap')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'tutup-post' }))
    expect(screen.queryByRole('dialog')).toBeNull()

    getMyPost.mockRejectedValue(new Error('edit gagal'))
    await userEvent.click(screen.getByRole('button', { name: /Aksi untuk Satu/ }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Edit/ }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('edit gagal'))
  })

  it('hapus artikel: batal, sukses, dan gagal', async () => {
    await setup()
    const openDelete = async () => {
      await userEvent.click(screen.getByRole('button', { name: /Aksi untuk Satu/ }))
      await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    }
    confirmAction.mockResolvedValueOnce(false)
    await openDelete()
    expect(deletePost).not.toHaveBeenCalled()

    confirmAction.mockResolvedValueOnce(true)
    deletePost.mockResolvedValueOnce({})
    await openDelete()
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil dihapus.'))

    confirmAction.mockResolvedValueOnce(true)
    deletePost.mockRejectedValueOnce(new Error('hapus gagal'))
    await openDelete()
    await waitFor(() => expect(showError).toHaveBeenCalledWith('hapus gagal'))
  })

  it('Tambah Artikel membuka modal baru & menyimpan memuat ulang data', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    expect(screen.getByText('post:baru')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'saved-post' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(getMyPosts).toHaveBeenCalledTimes(2))
  })

  it('AI Generator: batal dan terapkan ke editor', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByRole('button', { name: 'tutup-ai' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByRole('button', { name: 'apply-ai' }))
    expect(within(screen.getByRole('dialog')).getByText('post:Draf AI')).toBeInTheDocument()
  })
})

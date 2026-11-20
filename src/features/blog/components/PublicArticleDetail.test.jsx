import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({ getPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content, theme }) => <div data-testid="viewer">{`${theme}:${content}`}</div>,
}))
import { getPublicPost } from '../api/blogApi'
import PublicArticleDetail from './PublicArticleDetail'

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap dan memperbarui meta halaman', async () => {
    getPublicPost.mockResolvedValue({
      title: 'Judul X',
      category: 'Teknologi',
      excerpt: 'Ringkasan X',
      content: '# isi',
      author: { username: 'ani' },
      published_at: '2026-02-01T00:00:00Z',
      reading_time: 2,
      cover_image_path: '/cover.png',
    })
    render(<PublicArticleDetail slug="judul-x" theme="dark" />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Judul X' })).toBeInTheDocument()
    expect(await screen.findByTestId('viewer')).toHaveTextContent('dark:# isi')
    expect(screen.getByAltText('Sampul artikel Judul X')).toBeInTheDocument()
    expect(document.title).toBe('Judul X | Delcom Blog')
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('Ringkasan X')
    expect(getPublicPost).toHaveBeenCalledWith('judul-x')
  })

  it('memakai judul sebagai deskripsi bila excerpt kosong & tanpa sampul', async () => {
    getPublicPost.mockResolvedValue({ title: 'Tanpa Ringkasan', category: 'Umum', excerpt: '', content: 'x' })
    render(<PublicArticleDetail slug="a" theme="light" />)
    await screen.findByRole('heading', { level: 1, name: 'Tanpa Ringkasan' })
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('Tanpa Ringkasan')
    expect(document.querySelector('img')).toBeNull()
  })

  it('menampilkan error saat artikel tidak ditemukan', async () => {
    getPublicPost.mockRejectedValue(new Error('Artikel tidak ada'))
    render(<PublicArticleDetail slug="hilang" theme="light" />)
    expect(await screen.findByText('Artikel tidak ada')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Artikel tidak ditemukan' })).toBeInTheDocument()
  })
})

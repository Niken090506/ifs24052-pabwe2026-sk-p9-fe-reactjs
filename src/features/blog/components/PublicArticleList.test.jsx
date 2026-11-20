import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({ getPublicPosts: vi.fn() }))
import { getPublicPosts } from '../api/blogApi'
import PublicArticleList from './PublicArticleList'

const posts = [
  { id: 1, slug: 'satu', title: 'Artikel Satu', category: 'Teknologi', excerpt: 'Ringkas', author: { username: 'ani' }, published_at: '2026-01-02T00:00:00Z', reading_time: 3, cover_image_path: '/img.png' },
  { id: 2, slug: 'dua', title: 'Artikel Dua', category: 'Bisnis', excerpt: 'Ringkas 2', author_name: 'budi', published_at: '2026-01-03T00:00:00Z', content: 'a b c' },
]

describe('PublicArticleList', () => {
  it('menampilkan artikel, sampul, dan metadata', async () => {
    getPublicPosts.mockResolvedValue(posts)
    render(<PublicArticleList />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: 'Artikel Satu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Artikel Dua' })).toHaveAttribute('href', '/posts/dua')
    expect(screen.getByText(/3 menit baca/)).toBeInTheDocument()
    expect(document.querySelectorAll('img')).toHaveLength(1)
  })

  it('pencarian real-time & filter kategori memanggil API', async () => {
    getPublicPosts.mockResolvedValue(posts)
    render(<PublicArticleList />)
    await screen.findByText('Artikel Satu')
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'ai')
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'ai', category: '' })
    await userEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'ai', category: 'Teknologi' })
    expect(screen.getByRole('button', { name: 'Teknologi' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'ai', category: '' })
  })

  it('menampilkan pesan kosong', async () => {
    getPublicPosts.mockResolvedValue([])
    render(<PublicArticleList />)
    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
  })

  it('menampilkan pesan error', async () => {
    getPublicPosts.mockRejectedValue(new Error('Server mati'))
    render(<PublicArticleList />)
    expect(await screen.findByText('Server mati')).toBeInTheDocument()
  })
})

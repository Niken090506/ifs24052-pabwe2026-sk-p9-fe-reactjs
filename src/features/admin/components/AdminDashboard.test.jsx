import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/adminApi', () => ({ getUsers: vi.fn(), getAllPosts: vi.fn(), getUserPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showError: vi.fn(),
}))
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'
import { showError } from '../../../helpers/toolsHelper'
import AdminDashboard from './AdminDashboard'

const users = [
  { id: 1, username: 'ani', email: 'a@x.id', role: 'member', total_posts: 3, total_published: 2 },
  { id: 2, username: 'budi', email: 'b@x.id', role: 'admin', posts_count: 1, published_posts: 1 },
  { id: 3, username: 'cici', email: 'c@x.id', role: 'member' },
]
const posts = [
  { id: 10, title: 'P1', author: { username: 'ani' }, category: 'Umum', is_published: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 11, title: 'P2', author: { username: 'budi' }, category: 'Opini', is_published: false, created_at: '2026-01-02T00:00:00Z' },
]

describe('AdminDashboard', () => {
  it('menampilkan ringkasan, pengguna, dan arsip artikel', async () => {
    getUsers.mockResolvedValue(users)
    getAllPosts.mockResolvedValue(posts)
    render(<AdminDashboard />)
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
    expect(await screen.findByText('Total Pengguna')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('4')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('3')
    expect(screen.getByRole('heading', { name: 'Arsip Seluruh Artikel' })).toBeInTheDocument()
    expect(screen.getByText('P2')).toBeInTheDocument()
    expect(screen.getAllByText('Terbit').length).toBeGreaterThan(1)
    expect(screen.getByText('Draf')).toBeInTheDocument()
  })

  it('filter artikel per pengguna dan kembali ke semua', async () => {
    getUsers.mockResolvedValue(users)
    getAllPosts.mockResolvedValue(posts)
    getUserPosts.mockResolvedValue([posts[0]])
    render(<AdminDashboard />)
    await screen.findByText('Total Pengguna')
    await userEvent.click(screen.getByRole('button', { name: 'Lihat artikel ani' }))
    expect(await screen.findByRole('heading', { name: 'Artikel oleh ani' })).toBeInTheDocument()
    expect(getUserPosts).toHaveBeenCalledWith(1)
    expect(screen.queryByText('P2')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua artikel' }))
    expect(await screen.findByText('P2')).toBeInTheDocument()
  })

  it('error saat memfilter / memuat ulang', async () => {
    getUsers.mockResolvedValue(users)
    getAllPosts.mockResolvedValueOnce(posts)
    getUserPosts.mockRejectedValueOnce(new Error('filter gagal'))
    render(<AdminDashboard />)
    await screen.findByText('Total Pengguna')
    await userEvent.click(screen.getByRole('button', { name: 'Lihat artikel ani' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('filter gagal'))

    getUserPosts.mockResolvedValueOnce([])
    await userEvent.click(screen.getByRole('button', { name: 'Lihat artikel budi' }))
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
    getAllPosts.mockRejectedValueOnce(new Error('muat gagal'))
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua artikel' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('muat gagal'))
  })

  it('menampilkan error pemuatan awal', async () => {
    getUsers.mockRejectedValue(new Error('akses ditolak'))
    getAllPosts.mockResolvedValue([])
    render(<AdminDashboard />)
    expect(await screen.findByRole('alert')).toHaveTextContent('akses ditolak')
  })
})

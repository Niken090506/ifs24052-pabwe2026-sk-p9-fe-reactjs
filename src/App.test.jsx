import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./features/auth/api/authApi', () => ({
  getProfile: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: () => <h1>Beranda Mock</h1> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <h1>Detail {slug}</h1> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: () => <h1>Author Mock</h1> }))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <h1>Admin Mock</h1> }))
import { getProfile, login, logout } from './features/auth/api/authApi'
import { AUTH_EXPIRED_EVENT, getToken, setToken } from './helpers/apiHelper'
import App from './App'

const member = { username: 'ani', role: 'member' }
const admin = { username: 'root', role: 'admin' }

describe('App', () => {
  it('beranda publik untuk tamu dengan meta SEO', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Beranda Mock' })).toBeInTheDocument()
    expect(document.title).toMatch(/Delcom Blog/)
    expect(screen.getByRole('link', { name: 'Lewati ke konten utama' })).toHaveAttribute('href', '#main')
  })

  it.each(['/public', '/public/', '/'])('rute %s menampilkan beranda', async (path) => {
    window.history.replaceState({}, '', path)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Beranda Mock' })).toBeInTheDocument()
  })

  it('rute detail artikel dengan slug', async () => {
    window.history.replaceState({}, '', '/posts/halo%20dunia')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Detail halo dunia' })).toBeInTheDocument()
  })

  it('rute tidak dikenal menampilkan 404 dengan tautan beranda', async () => {
    window.history.replaceState({}, '', '/tidak-ada')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    expect(document.title).toMatch(/Tidak Ditemukan/)
    await userEvent.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
    expect(await screen.findByRole('heading', { name: 'Beranda Mock' })).toBeInTheDocument()
  })

  it('tamu yang membuka /author dan /admin diarahkan ke /login', async () => {
    window.history.replaceState({}, '', '/author')
    const { unmount } = render(<App />)
    expect(await screen.findByRole('heading', { name: 'Masuk ke Delcom Blog' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    unmount()
    window.history.replaceState({}, '', '/admin')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('halaman register untuk tamu', async () => {
    window.history.replaceState({}, '', '/register')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Daftar Akun Penulis' })).toBeInTheDocument()
  })

  it('login member -> workspace penulis, lalu logout kembali ke beranda', async () => {
    login.mockResolvedValue({ token: 'jwt' })
    getProfile.mockResolvedValue(member)
    logout.mockResolvedValue({})
    window.history.replaceState({}, '', '/login')
    render(<App />)
    await userEvent.type(await screen.findByLabelText('Username'), 'ani')
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByRole('heading', { name: 'Author Mock' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(await screen.findByRole('heading', { name: 'Beranda Mock' })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('login admin -> panel admin', async () => {
    login.mockResolvedValue({ token: 'jwt' })
    getProfile.mockResolvedValue(admin)
    window.history.replaceState({}, '', '/login')
    render(<App />)
    await userEvent.type(await screen.findByLabelText('Username'), 'root')
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByRole('heading', { name: 'Admin Mock' })).toBeInTheDocument()
  })

  it('logout tetap menghapus sesi lokal walau server gagal', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(member)
    logout.mockRejectedValue(new Error('offline'))
    window.history.replaceState({}, '', '/author')
    render(<App />)
    expect(screen.getByText('Memuat sesi...')).toBeInTheDocument()
    await screen.findByRole('heading', { name: 'Author Mock' })
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(await screen.findByRole('heading', { name: 'Beranda Mock' })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('member membuka /admin diarahkan ke /author; user login membuka /login diarahkan ke /author', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(member)
    window.history.replaceState({}, '', '/admin')
    const { unmount } = render(<App />)
    expect(await screen.findByRole('heading', { name: 'Author Mock' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
    unmount()
    window.history.replaceState({}, '', '/login')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/author'))
  })

  it('admin dapat membuka /admin', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(admin)
    window.history.replaceState({}, '', '/admin')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Admin Mock' })).toBeInTheDocument()
  })

  it('token tidak valid dibersihkan dan tamu tetap bisa melihat beranda', async () => {
    setToken('basi')
    getProfile.mockRejectedValue(new Error('invalid'))
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Beranda Mock' })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('sesi berakhir memunculkan modal login, lalu login ulang menutupnya', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(member)
    window.history.replaceState({}, '', '/author')
    render(<App />)
    await screen.findByRole('heading', { name: 'Author Mock' })
    act(() => {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    })
    expect(await screen.findByRole('dialog', { name: /sesi berakhir/i })).toBeInTheDocument()
    login.mockResolvedValue({ token: 'baru' })
    getProfile.mockResolvedValue(member)
    await userEvent.type(screen.getByLabelText('Username'), 'ani')
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(await screen.findByRole('heading', { name: 'Author Mock' })).toBeInTheDocument()
  })

  it('modal sesi berakhir dapat dibatalkan', async () => {
    window.history.replaceState({}, '', '/')
    render(<App />)
    await screen.findByRole('heading', { name: 'Beranda Mock' })
    act(() => {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('tombol tema & aksen bekerja dari navbar', async () => {
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'Aktifkan mode gelap' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await userEvent.selectOptions(screen.getByLabelText('Warna aksen'), 'emerald')
    expect(document.documentElement.dataset.accent).toBe('emerald')
  })
})

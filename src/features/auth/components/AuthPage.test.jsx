import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
}))
import { getProfile, login, register } from '../api/authApi'
import { getToken } from '../../../helpers/apiHelper'
import AuthPage from './AuthPage'
import AuthModal from '../modals/AuthModal'

describe('AuthPage login', () => {
  it('menampilkan id wajib dan memvalidasi input kosong', async () => {
    render(<AuthPage mode="login" onSuccess={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: /masuk/i })).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()
    await userEvent.click(document.getElementById('login-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent('Semua kolom wajib diisi.')
    await userEvent.type(document.getElementById('login-username'), 'ani')
    await userEvent.click(document.getElementById('login-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent('Semua kolom wajib diisi.')
    expect(login).not.toHaveBeenCalled()
  })

  it('login sukses menyimpan token dan memanggil onSuccess', async () => {
    login.mockResolvedValue({ token: 'jwt' })
    getProfile.mockResolvedValue({ username: 'ani', role: 'member' })
    const onSuccess = vi.fn()
    render(<AuthPage mode="login" onSuccess={onSuccess} />)
    await userEvent.type(document.getElementById('login-username'), ' ani ')
    await userEvent.type(document.getElementById('login-password'), 'rahasia')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ username: 'ani', role: 'member' }))
    expect(login).toHaveBeenCalledWith({ username: 'ani', password: 'rahasia' })
    expect(getToken()).toBe('jwt')
  })

  it('menampilkan error dari server', async () => {
    login.mockRejectedValue(new Error('Kredensial salah'))
    render(<AuthPage mode="login" onSuccess={vi.fn()} />)
    await userEvent.type(document.getElementById('login-username'), 'ani')
    await userEvent.type(document.getElementById('login-password'), 'x')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kredensial salah')
    expect(document.getElementById('login-submit')).not.toBeDisabled()
  })

  it('memiliki tautan ke halaman daftar', () => {
    render(<AuthPage mode="login" onSuccess={vi.fn()} />)
    expect(screen.getByRole('link', { name: /daftar sekarang/i })).toHaveAttribute('href', '/register')
  })
})

describe('AuthPage register', () => {
  it('validasi email wajib diisi', async () => {
    render(<AuthPage mode="register" onSuccess={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: /daftar/i })).toBeInTheDocument()
    await userEvent.type(document.getElementById('register-username'), 'ani')
    await userEvent.type(document.getElementById('register-password'), 'rahasia')
    await userEvent.click(document.getElementById('register-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent('Semua kolom wajib diisi.')
  })

  it('register lalu login otomatis', async () => {
    register.mockResolvedValue({})
    login.mockResolvedValue({ token: 'jwt2' })
    getProfile.mockResolvedValue({ username: 'ani', role: 'member' })
    const onSuccess = vi.fn()
    render(<AuthPage mode="register" onSuccess={onSuccess} />)
    await userEvent.type(document.getElementById('register-username'), 'ani')
    await userEvent.type(document.getElementById('register-email'), 'a@b.c')
    await userEvent.type(document.getElementById('register-password'), 'rahasia')
    await userEvent.click(document.getElementById('register-submit'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(register).toHaveBeenCalledWith({ username: 'ani', email: 'a@b.c', password: 'rahasia' })
    expect(getToken()).toBe('jwt2')
    expect(screen.getByRole('link', { name: /masuk di sini/i })).toHaveAttribute('href', '/login')
  })
})

describe('AuthModal', () => {
  it('menampilkan form login tanpa tautan dan bisa dibatalkan', async () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} onSuccess={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /sesi berakhir/i })).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /daftar sekarang/i })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})

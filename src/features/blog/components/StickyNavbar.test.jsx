import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const base = { path: '/', theme: 'light', accent: 'indigo', onToggleTheme: vi.fn(), onAccentChange: vi.fn(), onLogout: vi.fn() }

describe('StickyNavbar', () => {
  it('tamu: tautan Masuk & Daftar, tanpa Workspace', () => {
    render(<StickyNavbar {...base} user={null} />)
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Daftar' })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('link', { name: 'Workspace' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Beranda' })[0]).toHaveAttribute('aria-current', 'page')
  })

  it('member: Workspace + Keluar, tanpa Admin; mode gelap menampilkan label terang', async () => {
    const onLogout = vi.fn()
    render(<StickyNavbar {...base} theme="dark" path="/author" onLogout={onLogout} user={{ username: 'ani', role: 'member' }} />)
    expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Aktifkan mode terang' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('admin: tautan Admin; toggle tema & ganti aksen', async () => {
    const onToggleTheme = vi.fn()
    const onAccentChange = vi.fn()
    render(<StickyNavbar {...base} onToggleTheme={onToggleTheme} onAccentChange={onAccentChange} path="/admin" user={{ username: 'root', role: 'admin' }} />)
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan mode gelap' }))
    expect(onToggleTheme).toHaveBeenCalled()
    await userEvent.selectOptions(screen.getByLabelText('Warna aksen'), 'rose')
    expect(onAccentChange).toHaveBeenCalledWith('rose')
  })
})

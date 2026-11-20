import { describe, expect, it, vi } from 'vitest'

const fire = vi.fn()
vi.mock('sweetalert2', () => ({ default: { fire: (...args) => fire(...args) } }))

import {
  authorName,
  confirmAction,
  formatDate,
  pick,
  readingTime,
  setPageMeta,
  showError,
  showSuccess,
} from './toolsHelper'

describe('toolsHelper', () => {
  it('formatDate', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate('2026-01-15T00:00:00Z')).toMatch(/2026/)
  })

  it('pick mengambil field pertama yang ada', () => {
    expect(pick({ a: null, b: 5 }, ['a', 'b'])).toBe(5)
    expect(pick({}, ['a'])).toBe(0)
  })

  it('readingTime memakai field backend atau menghitung sendiri', () => {
    expect(readingTime({ reading_time: 4 })).toBe('4 menit baca')
    expect(readingTime({ content: 'kata '.repeat(450) })).toBe('3 menit baca')
    expect(readingTime({})).toBe('1 menit baca')
  })

  it('authorName', () => {
    expect(authorName({ author: { username: 'ani' } })).toBe('ani')
    expect(authorName({ user: { name: 'Budi' } })).toBe('Budi')
    expect(authorName({ author_name: 'cici' })).toBe('cici')
    expect(authorName({ username: 'dedi' })).toBe('dedi')
    expect(authorName({})).toBe('Penulis')
  })

  it('setPageMeta mengubah title & description', () => {
    setPageMeta('Judul', 'Deskripsi')
    expect(document.title).toBe('Judul')
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('Deskripsi')
  })

  it('showSuccess & showError memanggil SweetAlert2', async () => {
    await showSuccess('ok')
    await showError('gagal')
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'ok' }))
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'gagal' }))
  })

  it('confirmAction mengembalikan isConfirmed', async () => {
    fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await confirmAction({ title: 'T', text: 'x', confirmText: 'Hapus' })).toBe(true)
    fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await confirmAction({ title: 'T', text: 'x' })).toBe(false)
    expect(fire).toHaveBeenLastCalledWith(expect.objectContaining({ confirmButtonText: 'Ya' }))
  })
})

import { describe, expect, it, vi } from 'vitest'
import {
  API_BASE,
  AUTH_EXPIRED_EVENT,
  apiRequest,
  clearToken,
  getToken,
  itemOf,
  listOf,
  resolveApiBase,
  setToken,
} from './apiHelper'

const mockFetch = (status, body, { reject = false, badJson = false } = {}) => {
  globalThis.fetch = reject
    ? vi.fn().mockRejectedValue(new Error('net'))
    : vi.fn().mockResolvedValue({
        status,
        ok: status >= 200 && status < 300,
        json: badJson ? () => Promise.reject(new Error('bad')) : () => Promise.resolve(body),
      })
}

describe('apiHelper', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('API_BASE kosong secara default & resolveApiBase mendeteksi domain cloud', () => {
    expect(API_BASE).toBe('')
    expect(resolveApiBase('https://api.test/', 'localhost')).toBe('https://api.test')
    expect(resolveApiBase('', 'ifs24052-pabwe2026-sk-p9-fe-reactjs.s1if.cloud')).toBe(
      'https://ifs24052-pabwe2026-sk-p9-be-golang-gin.s1if.cloud',
    )
    expect(resolveApiBase('', 'localhost')).toBe('')
  })

  it('GET sukses tanpa token & tanpa body', async () => {
    mockFetch(200, { status: 'success', data: 1 })
    const json = await apiRequest('/api/x')
    expect(json.data).toBe(1)
    const [, options] = fetch.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
    expect(options.headers['Content-Type']).toBeUndefined()
    expect(options.body).toBeUndefined()
  })

  it('POST dengan body dan Bearer token', async () => {
    setToken('tok')
    mockFetch(200, { status: 'success' })
    await apiRequest('/api/x', { method: 'POST', body: { a: 1 } })
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/x')
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer tok')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe('{"a":1}')
  })

  it('melempar error saat jaringan gagal', async () => {
    mockFetch(0, null, { reject: true })
    await expect(apiRequest('/api/x')).rejects.toThrow('Tidak dapat terhubung ke server.')
  })

  it('melempar error saat JSON tidak valid', async () => {
    mockFetch(200, null, { badJson: true })
    await expect(apiRequest('/api/x')).rejects.toThrow('Respons server tidak valid.')
  })

  it('melempar pesan server saat status fail', async () => {
    mockFetch(400, { status: 'fail', message: 'Data salah' })
    await expect(apiRequest('/api/x')).rejects.toThrow('Data salah')
  })

  it('memakai pesan default saat pesan server kosong', async () => {
    mockFetch(500, { status: 'error' })
    await expect(apiRequest('/api/x')).rejects.toThrow('Terjadi kesalahan pada server.')
  })

  it('401 dengan token menghapus token dan memicu event', async () => {
    setToken('tok')
    const handler = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, handler)
    mockFetch(401, { status: 'fail', message: 'Unauthorized' })
    await expect(apiRequest('/api/x')).rejects.toThrow('Unauthorized')
    expect(getToken()).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
  })

  it('401 tanpa token tidak memicu event', async () => {
    const handler = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, handler)
    mockFetch(401, { status: 'fail', message: 'Salah' })
    await expect(apiRequest('/api/x')).rejects.toThrow('Salah')
    expect(handler).not.toHaveBeenCalled()
    window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
  })

  it('listOf & itemOf mendukung bentuk langsung dan objek terbungkus', () => {
    expect(listOf({ data: [1] }, 'posts')).toEqual([1])
    expect(listOf({ data: { posts: [2] } }, 'posts')).toEqual([2])
    expect(listOf({ data: null }, 'posts')).toEqual([])
    expect(itemOf({ data: { post: { id: 9 } } }, 'post')).toEqual({ id: 9 })
    expect(itemOf({ data: { id: 9 } }, 'post')).toEqual({ id: 9 })
  })
})

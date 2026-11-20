import { describe, expect, it, vi } from 'vitest'
import { setToken } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

const ok = (data) => ({ status: 200, ok: true, json: async () => ({ status: 'success', data }) })

describe('authApi', () => {
  it('memanggil endpoint auth yang benar', async () => {
    setToken('t')
    globalThis.fetch = vi.fn().mockResolvedValue(ok({ x: 1 }))
    expect(await login({ username: 'a' })).toEqual({ x: 1 })
    expect(await register({ username: 'a' })).toEqual({ x: 1 })
    expect((await logout()).status).toBe('success')
    expect(await getProfile()).toEqual({ x: 1 })
    expect(await updateProfile({ email: 'e' })).toEqual({ x: 1 })
    const calls = fetch.mock.calls.map(([url, o]) => `${o.method} ${url}`)
    expect(calls).toEqual([
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/logout',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
    ])
  })
})

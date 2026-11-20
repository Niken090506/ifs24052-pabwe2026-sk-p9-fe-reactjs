import { describe, expect, it, vi } from 'vitest'
import { getAllPosts, getUserPosts, getUsers } from './adminApi'

const ok = (data) => ({ status: 200, ok: true, json: async () => ({ status: 'success', data }) })

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(ok([{ id: 1 }]))
    expect(await getUsers()).toEqual([{ id: 1 }])
    expect(await getAllPosts()).toEqual([{ id: 1 }])
    expect(await getUserPosts(7)).toEqual([{ id: 1 }])
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      '/api/admin/users',
      '/api/admin/posts',
      '/api/admin/users/7/posts',
    ])
  })
})

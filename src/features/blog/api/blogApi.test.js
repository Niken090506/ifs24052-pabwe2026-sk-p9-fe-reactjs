import { describe, expect, it, vi } from 'vitest'
import {
  aiGenerate,
  createPost,
  deletePost,
  getMyPost,
  getMyPosts,
  getPublicPost,
  getPublicPosts,
  getStats,
  togglePublish,
  updatePost,
} from './blogApi'

const ok = (data) => ({ status: 200, ok: true, json: async () => ({ status: 'success', data }) })

describe('blogApi', () => {
  it('getPublicPosts membangun query string', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(ok([{ id: 1 }]))
    expect(await getPublicPosts()).toEqual([{ id: 1 }])
    await getPublicPosts({ q: 'react', category: 'Teknologi' })
    await getPublicPosts({ q: 'x' })
    await getPublicPosts({ category: 'Bisnis' })
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      '/api/public/posts',
      '/api/public/posts?q=react&category=Teknologi',
      '/api/public/posts?q=x',
      '/api/public/posts?category=Bisnis',
    ])
  })

  it('endpoint lainnya', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(ok({ id: 2 }))
    expect(await getPublicPost('a b')).toEqual({ id: 2 })
    globalThis.fetch.mockResolvedValue(ok([]))
    expect(await getMyPosts()).toEqual([])
    globalThis.fetch.mockResolvedValue(ok({ id: 2 }))
    await getStats()
    await getMyPost(2)
    await createPost({ title: 't' })
    await updatePost(2, { title: 't' })
    await togglePublish(2)
    await deletePost(2)
    await aiGenerate({ topic: 't' })
    expect(fetch.mock.calls.map(([url, o]) => `${o.method} ${url}`)).toEqual([
      'GET /api/public/posts/a%20b',
      'GET /api/posts',
      'GET /api/posts/stats',
      'GET /api/posts/2',
      'POST /api/posts',
      'PUT /api/posts/2',
      'PATCH /api/posts/2/toggle-publish',
      'DELETE /api/posts/2',
      'POST /api/posts/ai-generate',
    ])
  })
})

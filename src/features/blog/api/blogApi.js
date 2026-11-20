import { apiRequest, itemOf, listOf } from '../../../helpers/apiHelper'

export async function getPublicPosts({ q = '', category = '' } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const query = params.toString()
  return listOf(await apiRequest(`/api/public/posts${query ? `?${query}` : ''}`), 'posts')
}

export const getPublicPost = async (slug) =>
  itemOf(await apiRequest(`/api/public/posts/${encodeURIComponent(slug)}`), 'post')

export const getMyPosts = async () => listOf(await apiRequest('/api/posts'), 'posts')

export const getStats = async () => itemOf(await apiRequest('/api/posts/stats'), 'stats')

export const getMyPost = async (id) => itemOf(await apiRequest(`/api/posts/${id}`), 'post')

export const createPost = async (payload) =>
  itemOf(await apiRequest('/api/posts', { method: 'POST', body: payload }), 'post')

export const updatePost = async (id, payload) =>
  itemOf(await apiRequest(`/api/posts/${id}`, { method: 'PUT', body: payload }), 'post')

export const togglePublish = async (id) =>
  itemOf(await apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' }), 'post')

export const deletePost = (id) => apiRequest(`/api/posts/${id}`, { method: 'DELETE' })

export const aiGenerate = async (payload) =>
  (await apiRequest('/api/posts/ai-generate', { method: 'POST', body: payload })).data

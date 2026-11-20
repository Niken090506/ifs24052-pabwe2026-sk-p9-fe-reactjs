import { apiRequest, listOf } from '../../../helpers/apiHelper'

export const getUsers = async () => listOf(await apiRequest('/api/admin/users'), 'users')

export const getAllPosts = async () => listOf(await apiRequest('/api/admin/posts'), 'posts')

export const getUserPosts = async (id) => listOf(await apiRequest(`/api/admin/users/${id}/posts`), 'posts')

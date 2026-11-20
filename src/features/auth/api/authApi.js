import { apiRequest, itemOf } from '../../../helpers/apiHelper'

export const login = async (payload) => (await apiRequest('/api/auth/login', { method: 'POST', body: payload })).data

export const register = async (payload) =>
  itemOf(await apiRequest('/api/auth/register', { method: 'POST', body: payload }), 'user')

export const logout = () => apiRequest('/api/auth/logout', { method: 'POST' })

export const getProfile = async () => itemOf(await apiRequest('/api/auth/profile'), 'user')

export const updateProfile = async (payload) =>
  itemOf(await apiRequest('/api/auth/profile', { method: 'PUT', body: payload }), 'user')

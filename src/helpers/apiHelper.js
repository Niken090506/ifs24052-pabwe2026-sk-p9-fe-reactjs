function resolveApiBase(envBase, hostname) {
  if (envBase) return envBase.replace(/\/+$/, '')
  if (hostname.includes('-fe-reactjs.')) {
    const beHost = hostname
      .replace('-fe-reactjs.', '-be-golang-gin.')
      .replace(/\.vercel\.app$/, '.s1if.cloud')
    return `https://${beHost}`
  }
  return ''
}

export const API_BASE = resolveApiBase(
  import.meta.env.VITE_API_BASE_URL,
  window.location.hostname,
)

const TOKEN_KEY = 'delcom_blog_token'
export const AUTH_EXPIRED_EVENT = 'auth:expired'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * Wrapper fetch terpusat: menyuntikkan Bearer token dan mengurai
 * respons standar {status, message, data?}.
 */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server.')
  }

  let json = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (response.status === 401 && token) {
    clearToken()
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  }
  if (!json) throw new Error('Respons server tidak valid.')
  if (!response.ok || json.status !== 'success') {
    throw new Error(json.message || 'Terjadi kesalahan pada server.')
  }
  return json
}

/**
 * Ambil array dari json.data — mendukung bentuk langsung `data: [...]`
 * maupun bentuk objek terbungkus `data: { [key]: [...] }` dari backend Go.
 */
export const listOf = (json, key) => {
  const data = json.data
  if (Array.isArray(data)) return data
  if (data && key && Array.isArray(data[key])) return data[key]
  return []
}

/**
 * Ambil objek tunggal dari json.data — mendukung bentuk `data: { [key]: {...} }`
 * maupun `data: {...}` langsung dari backend Go.
 */
export const itemOf = (json, key) => {
  const data = json.data
  if (data && key && data[key] !== undefined) return data[key]
  return data
}

export { resolveApiBase }

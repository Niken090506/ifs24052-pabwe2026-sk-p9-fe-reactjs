export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export const SITE_NAME = 'Delcom Blog'

export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Ambil nilai pertama yang terdefinisi dari beberapa kemungkinan nama field. */
export function pick(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return 0
}

export function readingTime(post) {
  if (post.reading_time) return `${post.reading_time} menit baca`
  const words = String(post.content || '').trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} menit baca`
}

export function authorName(post) {
  const nested = post.author || post.user
  if (nested) return nested.username || nested.name
  return post.author_name || post.username || 'Penulis'
}

export function setPageMeta(title, description) {
  document.title = title
  document.querySelector('meta[name="description"]').setAttribute('content', description)
}

export async function showSuccess(message) {
  const { default: Swal } = await import('sweetalert2')
  return Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })
}

export async function showError(message) {
  const { default: Swal } = await import('sweetalert2')
  return Swal.fire({ icon: 'error', title: 'Gagal', text: message })
}

export async function confirmAction({ title, text, confirmText = 'Ya' }) {
  const { default: Swal } = await import('sweetalert2')
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}

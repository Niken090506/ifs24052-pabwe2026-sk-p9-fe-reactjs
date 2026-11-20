import { Suspense, lazy, useState } from 'react'
import Modal from '../../../components/Modal'
import useInput from '../../../hooks/useInput'
import { createPost, updatePost } from '../api/blogApi'
import { CATEGORIES, showError, showSuccess } from '../../../helpers/toolsHelper'
import { btnPrimary, btnSecondary, inputCls, mutedText } from '../../../helpers/uiClasses'

const MarkdownEditor = lazy(() => import('../../../components/MarkdownEditor'))

/** Modal penulisan artikel. `post` berisi data awal (edit / hasil AI); tanpa id berarti artikel baru. */
export default function PostModal({ post, theme, onClose, onSaved }) {
  const title = useInput(post.title || '')
  const category = useInput(post.category || CATEGORIES[0])
  const excerpt = useInput(post.excerpt || '')
  const [content, setContent] = useState(post.content || '')
  const [isPublished, setIsPublished] = useState(Boolean(post.is_published))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(post.id)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!title.value.trim() || !content.trim()) {
      setError('Judul dan isi artikel wajib diisi.')
      return
    }
    const payload = {
      title: title.value.trim(),
      category: category.value,
      excerpt: excerpt.value.trim(),
      content,
      is_published: isPublished,
    }
    setSaving(true)
    try {
      if (isEdit) await updatePost(post.id, payload)
      else await createPost(payload)
      showSuccess(isEdit ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil dibuat.')
      onSaved()
    } catch (err) {
      setSaving(false)
      showError(err.message)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Artikel' : 'Tambah Artikel'}
      titleId="post-modal-title"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Batal
          </button>
          <button id="post-submit" type="submit" form="post-form" disabled={saving} className={btnPrimary}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <form id="post-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="post-title" className="mb-1 block text-sm font-medium">
              Judul
            </label>
            <input id="post-title" name="title" type="text" value={title.value} onChange={title.onChange} className={inputCls} />
          </div>
          <div>
            <label htmlFor="post-category" className="mb-1 block text-sm font-medium">
              Kategori
            </label>
            <select id="post-category" name="category" value={category.value} onChange={category.onChange} className={inputCls}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">
            Ringkasan (excerpt)
          </label>
          <textarea id="post-excerpt" name="excerpt" rows={2} value={excerpt.value} onChange={excerpt.onChange} className={inputCls} />
        </div>
        <label htmlFor="post-published" className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            id="post-published"
            name="is_published"
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="h-4 w-4"
          />
          Publikasikan artikel
        </label>
        <div>
          <p className="mb-1 text-sm font-medium">Isi artikel (Markdown)</p>
          <Suspense fallback={<p className={mutedText}>Memuat editor...</p>}>
            <MarkdownEditor value={content} onChange={setContent} theme={theme} />
          </Suspense>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900 dark:bg-red-950 dark:text-red-100">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}

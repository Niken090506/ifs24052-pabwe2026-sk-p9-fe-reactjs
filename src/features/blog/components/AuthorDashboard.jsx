import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import AppLink from '../../../components/AppLink'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import { deletePost, getMyPost, getMyPosts, getStats, togglePublish } from '../api/blogApi'
import { confirmAction, formatDate, showError, showSuccess } from '../../../helpers/toolsHelper'
import { btnPrimary, btnSecondary, card, linkCls, mutedText } from '../../../helpers/uiClasses'

export default function AuthorDashboard({ theme }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [menuId, setMenuId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([getMyPosts(), getStats()])
      setPosts(list)
      setStats(summary)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const closeModal = useCallback(() => setModal(null), [])

  const handleSaved = () => {
    setModal(null)
    load()
  }

  const handleEdit = async (id) => {
    setMenuId(null)
    try {
      setModal({ type: 'post', post: await getMyPost(id) })
    } catch (err) {
      showError(err.message)
    }
  }

  const handleToggle = async (id) => {
    try {
      await togglePublish(id)
      await load()
    } catch (err) {
      showError(err.message)
    }
  }

  const handleDelete = async (post) => {
    setMenuId(null)
    const confirmed = await confirmAction({
      title: 'Hapus artikel?',
      text: `Artikel "${post.title}" akan dihapus permanen.`,
      confirmText: 'Ya, hapus',
    })
    if (!confirmed) return
    try {
      await deletePost(post.id)
      showSuccess('Artikel berhasil dihapus.')
      await load()
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Workspace Penulis</h1>
        <div className="flex flex-wrap gap-2">
          <button id="btn-ai-generator" type="button" className={btnSecondary} onClick={() => setModal({ type: 'ai' })}>
            <IconSparkles size={18} aria-hidden="true" /> AI Generator
          </button>
          <button id="btn-create-post" type="button" className={btnPrimary} onClick={() => setModal({ type: 'post', post: {} })}>
            <IconPlus size={18} aria-hidden="true" /> Tambah Artikel
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <p role="status" className={mutedText}>
          Memuat data...
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-100 px-4 py-3 font-medium text-red-900 dark:bg-red-950 dark:text-red-100">
          {error}
        </p>
      )}
      {status === 'ready' && (
        <>
          <PostStats stats={stats} />
          <section aria-labelledby="my-posts-title" className={`${card} mt-6 p-4`}>
            <h2 id="my-posts-title" className="mb-3 text-lg font-bold">
              Artikel Saya
            </h2>
            {posts.length === 0 ? (
              <p className={mutedText}>Belum ada artikel. Klik &quot;Tambah Artikel&quot; untuk mulai menulis.</p>
            ) : (
              <div className="overflow-x-auto" role="region" aria-label="Tabel artikel saya" tabIndex={0}>
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-600">
                      <th scope="col" className="px-3 py-2">Judul</th>
                      <th scope="col" className="px-3 py-2">Kategori</th>
                      <th scope="col" className="px-3 py-2">Status</th>
                      <th scope="col" className="px-3 py-2">Diperbarui</th>
                      <th scope="col" className="px-3 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="px-3 py-2 font-medium">{post.title}</td>
                        <td className="px-3 py-2">{post.category}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={post.is_published}
                              aria-label={`Terbitkan artikel ${post.title}`}
                              onClick={() => handleToggle(post.id)}
                              className={`relative h-6 w-11 rounded-full ${post.is_published ? 'bg-emerald-700' : 'bg-slate-500'}`}
                            >
                              <span
                                aria-hidden="true"
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${post.is_published ? 'left-[22px]' : 'left-0.5'}`}
                              />
                            </button>
                            <span>{post.is_published ? 'Terbit' : 'Draf'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">{formatDate(post.updated_at)}</td>
                        <td className="relative px-3 py-2">
                          <button
                            type="button"
                            aria-label={`Aksi untuk ${post.title}`}
                            aria-haspopup="menu"
                            aria-expanded={menuId === post.id}
                            onClick={() => setMenuId(menuId === post.id ? null : post.id)}
                            className="rounded-lg p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <IconDotsVertical size={20} aria-hidden="true" />
                            <span className="sr-only">⋮</span>
                          </button>
                          {menuId === post.id && (
                            <div
                              role="menu"
                              aria-label={`Menu ${post.title}`}
                              className="absolute right-3 z-10 mt-1 w-44 rounded-lg border border-slate-300 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
                            >
                              {post.is_published && (
                                <AppLink
                                  href={`/posts/${post.slug}`}
                                  role="menuitem"
                                  className={`${linkCls} block px-3 py-2 no-underline hover:bg-slate-100 dark:hover:bg-slate-700`}
                                >
                                  Lihat Detail
                                </AppLink>
                              )}
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleEdit(post.id)}
                                className="block w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                Ubah Edit
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleDelete(post)}
                                className="block w-full px-3 py-2 text-left font-medium text-red-800 hover:bg-slate-100 dark:text-red-300 dark:hover:bg-slate-700"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {modal && modal.type === 'post' && <PostModal post={modal.post} theme={theme} onClose={closeModal} onSaved={handleSaved} />}
      {modal && modal.type === 'ai' && (
        <AiPostGeneratorModal theme={theme} onClose={closeModal} onApply={(draft) => setModal({ type: 'post', post: draft })} />
      )}
    </div>
  )
}

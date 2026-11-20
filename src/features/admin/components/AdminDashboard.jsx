import { useCallback, useEffect, useState } from 'react'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'
import { authorName, formatDate, pick, showError } from '../../../helpers/toolsHelper'
import { btnSecondary, card, mutedText } from '../../../helpers/uiClasses'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [filterUser, setFilterUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getUsers(), getAllPosts()])
      .then(([userList, postList]) => {
        setUsers(userList)
        setPosts(postList)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  const showUserPosts = useCallback(async (user) => {
    try {
      setPosts(await getUserPosts(user.id))
      setFilterUser(user)
    } catch (err) {
      showError(err.message)
    }
  }, [])

  const showAllPosts = async () => {
    try {
      setPosts(await getAllPosts())
      setFilterUser(null)
    } catch (err) {
      showError(err.message)
    }
  }

  const totalPublished = users.reduce((sum, user) => sum + Number(pick(user, ['total_published', 'published_posts'])), 0)
  const totalPosts = users.reduce((sum, user) => sum + Number(pick(user, ['total_posts', 'posts_count'])), 0)

  const summary = [
    { label: 'Total Pengguna', value: users.length },
    { label: 'Total Artikel', value: totalPosts },
    { label: 'Total Terbit', value: totalPublished },
  ]

  return (
    <div className="w-full px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-extrabold">Panel Administrasi</h1>
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
          <ul className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan sistem">
            {summary.map((item) => (
              <li key={item.label} className={`${card} p-5`}>
                <p className={`text-sm ${mutedText}`}>{item.label}</p>
                <p className="text-3xl font-extrabold">{item.value}</p>
              </li>
            ))}
          </ul>

          <section aria-labelledby="users-title" className={`${card} mt-6 p-4`}>
            <h2 id="users-title" className="mb-3 text-lg font-bold">
              Direktori Pengguna
            </h2>
            <div className="overflow-x-auto" role="region" aria-label="Tabel pengguna" tabIndex={0}>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-600">
                    <th scope="col" className="px-3 py-2">ID</th>
                    <th scope="col" className="px-3 py-2">Username</th>
                    <th scope="col" className="px-3 py-2">Email</th>
                    <th scope="col" className="px-3 py-2">Role</th>
                    <th scope="col" className="px-3 py-2">Artikel</th>
                    <th scope="col" className="px-3 py-2">Terbit</th>
                    <th scope="col" className="px-3 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-3 py-2">{user.id}</td>
                      <td className="px-3 py-2 font-medium">{user.username}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.role}</td>
                      <td className="px-3 py-2">{pick(user, ['total_posts', 'posts_count'])}</td>
                      <td className="px-3 py-2">{pick(user, ['total_published', 'published_posts'])}</td>
                      <td className="px-3 py-2">
                        <button type="button" className={btnSecondary} onClick={() => showUserPosts(user)}>
                          Lihat artikel {user.username}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="all-posts-title" className={`${card} mt-6 p-4`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="all-posts-title" className="text-lg font-bold">
                {filterUser ? `Artikel oleh ${filterUser.username}` : 'Arsip Seluruh Artikel'}
              </h2>
              {filterUser && (
                <button type="button" className={btnSecondary} onClick={showAllPosts}>
                  Tampilkan semua artikel
                </button>
              )}
            </div>
            {posts.length === 0 ? (
              <p className={mutedText}>Belum ada artikel.</p>
            ) : (
              <div className="overflow-x-auto" role="region" aria-label="Tabel arsip artikel" tabIndex={0}>
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-600">
                      <th scope="col" className="px-3 py-2">Judul</th>
                      <th scope="col" className="px-3 py-2">Penulis</th>
                      <th scope="col" className="px-3 py-2">Kategori</th>
                      <th scope="col" className="px-3 py-2">Status</th>
                      <th scope="col" className="px-3 py-2">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="px-3 py-2 font-medium">{post.title}</td>
                        <td className="px-3 py-2">{authorName(post)}</td>
                        <td className="px-3 py-2">{post.category}</td>
                        <td className="px-3 py-2">{post.is_published ? 'Terbit' : 'Draf'}</td>
                        <td className="px-3 py-2">{formatDate(post.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

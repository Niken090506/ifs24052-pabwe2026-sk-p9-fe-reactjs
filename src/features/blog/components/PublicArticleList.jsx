import { useEffect, useState } from 'react'
import { IconSearch } from '@tabler/icons-react'
import AppLink from '../../../components/AppLink'
import useInput from '../../../hooks/useInput'
import { getPublicPosts } from '../api/blogApi'
import { CATEGORIES, authorName, formatDate, readingTime } from '../../../helpers/toolsHelper'
import { card, inputCls, linkCls, mutedText } from '../../../helpers/uiClasses'

const FILTERS = ['Semua', ...CATEGORIES]

export default function PublicArticleList() {
  const search = useInput('')
  const [category, setCategory] = useState('Semua')
  const [state, setState] = useState({ status: 'loading', posts: [], error: '' })

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, status: 'loading' }))
    getPublicPosts({ q: search.value, category: category === 'Semua' ? '' : category })
      .then((posts) => {
        /* v8 ignore next -- @preserve */
        if (active) setState({ status: 'ready', posts, error: '' })
      })
      .catch((err) => {
        /* v8 ignore next -- @preserve */
        if (active) setState({ status: 'error', posts: [], error: err.message })
      })
    return () => {
      active = false
    }
  }, [search.value, category])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <section aria-labelledby="hero-title" className="mb-8 text-center">
        <h1 id="hero-title" className="text-3xl font-extrabold sm:text-4xl">
          Delcom Blog
        </h1>
        <p className={`mx-auto mt-2 max-w-2xl ${mutedText}`}>
          Temukan artikel teknologi, pendidikan, gaya hidup, bisnis, dan opini terbaru dari para penulis kami.
        </p>
      </section>

      <div className="mb-4">
        <label htmlFor="search-posts" className="mb-1 block text-sm font-medium">
          Cari artikel
        </label>
        <div className="relative">
          <IconSearch size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-posts"
            type="search"
            value={search.value}
            onChange={search.onChange}
            placeholder="Ketik kata kunci..."
            className={`${inputCls} pl-10`}
          />
        </div>
      </div>

      <div role="group" aria-label="Filter kategori" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === item
                ? 'border-transparent bg-accent text-white'
                : 'border-slate-400 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div role="status" aria-live="polite">
        {state.status === 'loading' && <p className={mutedText}>Memuat artikel...</p>}
        {state.status === 'error' && (
          <p className="rounded-lg bg-red-100 px-4 py-3 font-medium text-red-900 dark:bg-red-950 dark:text-red-100">{state.error}</p>
        )}
        {state.status === 'ready' && state.posts.length === 0 && <p className={mutedText}>Belum ada artikel yang cocok.</p>}
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {state.posts.map((post) => (
          <li key={post.id}>
            <article className={`${card} flex h-full flex-col overflow-hidden`}>
              {post.cover_image_path && (
                <img src={post.cover_image_path} alt="" width="640" height="320" loading="lazy" className="h-40 w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-text">{post.category}</p>
                <h2 className="mb-2 text-lg font-bold">
                  <AppLink href={`/posts/${post.slug}`} className="hover:underline">
                    {post.title}
                  </AppLink>
                </h2>
                <p className={`mb-4 flex-1 text-sm ${mutedText}`}>{post.excerpt}</p>
                <p className={`text-xs ${mutedText}`}>
                  {authorName(post)} · {formatDate(post.published_at)} · {readingTime(post)}
                </p>
                <AppLink href={`/posts/${post.slug}`} className={`${linkCls} mt-3 text-sm`} aria-label={`Baca selengkapnya: ${post.title}`}>
                  Baca selengkapnya
                </AppLink>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}

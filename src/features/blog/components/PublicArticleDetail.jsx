import { Suspense, lazy, useEffect, useState } from 'react'
import AppLink from '../../../components/AppLink'
import { getPublicPost } from '../api/blogApi'
import { SITE_NAME, authorName, formatDate, readingTime, setPageMeta } from '../../../helpers/toolsHelper'
import { linkCls, mutedText } from '../../../helpers/uiClasses'

const MarkdownViewer = lazy(() => import('../../../components/MarkdownViewer'))

export default function PublicArticleDetail({ slug, theme }) {
  const [state, setState] = useState({ status: 'loading', post: null, error: '' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading', post: null, error: '' })
    getPublicPost(slug)
      .then((post) => {
        /* v8 ignore next -- @preserve */
        if (!active) return
        setPageMeta(`${post.title} | ${SITE_NAME}`, post.excerpt || post.title)
        setState({ status: 'ready', post, error: '' })
      })
      .catch((err) => {
        /* v8 ignore next -- @preserve */
        if (active) setState({ status: 'error', post: null, error: err.message })
      })
    return () => {
      active = false
    }
  }, [slug])

  const { status, post, error } = state

  return (
    <div className="w-full px-4 py-8 sm:px-8">
      <AppLink href="/" className={`${linkCls} text-sm`}>
        &larr; Kembali ke beranda
      </AppLink>

      <div role="status" aria-live="polite">
        {status === 'loading' && <p className={`mt-6 ${mutedText}`}>Memuat artikel...</p>}
      </div>
      {status === 'error' && (
        <div className="mt-6">
          <h1 className="text-2xl font-bold">Artikel tidak ditemukan</h1>
          <p className="mt-2 rounded-lg bg-red-100 px-4 py-3 font-medium text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>
        </div>
      )}
      {status === 'ready' && (
        <article className="mt-6">
          <header className="mb-6 border-b border-slate-300 pb-6 dark:border-slate-600">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent-text">{post.category}</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{post.title}</h1>
            <p className={`mt-3 text-sm ${mutedText}`}>
              Oleh {authorName(post)} · {formatDate(post.published_at)} · {readingTime(post)}
            </p>
          </header>
          {post.cover_image_path && (
            <img src={post.cover_image_path} alt={`Sampul artikel ${post.title}`} width="1200" height="600" className="mb-6 max-h-[480px] w-full rounded-xl object-cover" />
          )}
          <Suspense fallback={<p className={mutedText}>Memuat konten...</p>}>
            <MarkdownViewer content={post.content} theme={theme} />
          </Suspense>
        </article>
      )}
    </div>
  )
}

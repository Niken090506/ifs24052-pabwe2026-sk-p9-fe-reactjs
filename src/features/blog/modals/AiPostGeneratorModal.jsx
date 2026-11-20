import { Suspense, lazy, useState } from 'react'
import { IconSparkles } from '@tabler/icons-react'
import Modal from '../../../components/Modal'
import useInput from '../../../hooks/useInput'
import { aiGenerate } from '../api/blogApi'
import { CATEGORIES } from '../../../helpers/toolsHelper'
import { btnPrimary, btnSecondary, inputCls, linkCls, mutedText } from '../../../helpers/uiClasses'

const MarkdownViewer = lazy(() => import('../../../components/MarkdownViewer'))

export default function AiPostGeneratorModal({ theme, onClose, onApply }) {
  const topic = useInput('')
  const category = useInput(CATEGORIES[0])
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleGenerate = async (event) => {
    event.preventDefault()
    setError('')
    if (!topic.value.trim()) {
      setError('Topik artikel wajib diisi.')
      return
    }
    setLoading(true)
    try {
      const data = await aiGenerate({
        topic: topic.value.trim(),
        category: category.value,
        include_web_search: includeWebSearch,
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const sources = result ? result.sources || result.search_sources || [] : []

  return (
    <Modal
      title="AI Blog Generator"
      titleId="ai-modal-title"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Batal
          </button>
          <button
            type="button"
            disabled={!result}
            onClick={() =>
              onApply({
                title: result.title,
                category: result.category || category.value,
                excerpt: result.excerpt,
                content: result.content,
              })
            }
            className={btnPrimary}
          >
            Simpan ke Editor
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleGenerate} noValidate className="space-y-4 lg:col-span-1">
          <div>
            <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">
              Topik artikel
            </label>
            <textarea id="ai-topic" rows={3} value={topic.value} onChange={topic.onChange} className={inputCls} />
          </div>
          <div>
            <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">
              Kategori
            </label>
            <select id="ai-category" value={category.value} onChange={category.onChange} className={inputCls}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ai-search">
            <input
              id="ai-search"
              type="checkbox"
              checked={includeWebSearch}
              onChange={(event) => setIncludeWebSearch(event.target.checked)}
              className="h-4 w-4"
            />
            Sertakan penelusuran search engine
          </label>
          {error && (
            <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900 dark:bg-red-950 dark:text-red-100">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            <IconSparkles size={18} aria-hidden="true" />
            {loading ? 'Menghasilkan...' : 'Hasilkan Artikel'}
          </button>
        </form>

        <section aria-labelledby="ai-preview-title" className="lg:col-span-2">
          <h3 id="ai-preview-title" className="mb-2 text-base font-semibold">
            Pratinjau
          </h3>
          {!result && <p className={mutedText}>Hasil artikel akan tampil di sini setelah dihasilkan.</p>}
          {result && (
            <div>
              <p className="text-xl font-bold">{result.title}</p>
              <p className={`mb-4 text-sm ${mutedText}`}>{result.excerpt}</p>
              <Suspense fallback={<p className={mutedText}>Memuat pratinjau...</p>}>
                <MarkdownViewer content={result.content} theme={theme} />
              </Suspense>
              {sources.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-2 font-semibold">Sumber Penelusuran</h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                          {source.title || source.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}

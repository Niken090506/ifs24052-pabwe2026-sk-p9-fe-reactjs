import { IconMoon, IconSun } from '@tabler/icons-react'
import AppLink from '../../../components/AppLink'
import { ACCENTS } from '../../../hooks/useTheme'
import { btnSecondary } from '../../../helpers/uiClasses'

export default function StickyNavbar({ user, path, theme, accent, onToggleTheme, onAccentChange, onLogout }) {
  const linkCls = (href) =>
    `rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 ${
      path === href ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-800 dark:text-slate-100'
    }`
  const current = (href) => (path === href ? 'page' : undefined)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2">
        <AppLink href="/" className="mr-2 text-xl font-extrabold text-accent-text">
          Delcom Blog
        </AppLink>
        <AppLink href="/" className={linkCls('/')} aria-current={current('/')}>
          Beranda
        </AppLink>
        {user && (
          <AppLink href="/author" className={linkCls('/author')} aria-current={current('/author')}>
            Workspace
          </AppLink>
        )}
        {user && user.role === 'admin' && (
          <AppLink href="/admin" className={linkCls('/admin')} aria-current={current('/admin')}>
            Admin
          </AppLink>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label htmlFor="accent-select" className="sr-only">
            Warna aksen
          </label>
          <select
            id="accent-select"
            value={accent}
            onChange={(event) => onAccentChange(event.target.value)}
            className="rounded-lg border border-slate-400 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          >
            {ACCENTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className={`${btnSecondary} !px-2.5`}
          >
            {theme === 'dark' ? <IconSun size={18} aria-hidden="true" /> : <IconMoon size={18} aria-hidden="true" />}
          </button>
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.username}</span>
              <button type="button" onClick={onLogout} className={btnSecondary}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <AppLink href="/login" className={linkCls('/login')} aria-current={current('/login')}>
                Masuk
              </AppLink>
              <AppLink
                href="/register"
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
                aria-current={current('/register')}
              >
                Daftar
              </AppLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

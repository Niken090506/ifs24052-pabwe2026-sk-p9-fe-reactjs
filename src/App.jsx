import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import AppLink from './components/AppLink'
import useTheme from './hooks/useTheme'
import { getProfile, logout } from './features/auth/api/authApi'
import { AUTH_EXPIRED_EVENT, clearToken, getToken } from './helpers/apiHelper'
import { navigate, usePath } from './helpers/navigation'
import { SITE_NAME, setPageMeta } from './helpers/toolsHelper'
import { linkCls, mutedText } from './helpers/uiClasses'

const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'))

const META = {
  home: [
    `${SITE_NAME} - Artikel Teknologi, Pendidikan & Gaya Hidup`,
    'Delcom Blog adalah platform publikasi artikel multi-tier dengan AI Blog Generator yang terintegrasi dengan search engine. Baca artikel teknologi, pendidikan, gaya hidup, bisnis, dan opini.',
  ],
  author: [`Workspace Penulis | ${SITE_NAME}`, 'Kelola artikel, statistik, dan buat draf artikel dengan AI Blog Generator di workspace penulis Delcom Blog.'],
  admin: [`Panel Admin | ${SITE_NAME}`, 'Pantau seluruh pengguna dan arsip artikel pada panel administrasi Delcom Blog.'],
  login: [`Masuk | ${SITE_NAME}`, 'Masuk ke akun penulis Delcom Blog untuk mengelola artikel Anda.'],
  register: [`Daftar | ${SITE_NAME}`, 'Daftar akun penulis Delcom Blog dan mulai menulis artikel Anda.'],
  notfound: [`Halaman Tidak Ditemukan | ${SITE_NAME}`, 'Halaman yang Anda cari tidak ditemukan di Delcom Blog.'],
}

function resolveRoute(rawPath) {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath
  if (path === '/' || path === '/public') return { name: 'home' }
  if (path === '/author') return { name: 'author' }
  if (path === '/admin') return { name: 'admin' }
  if (path === '/login') return { name: 'login' }
  if (path === '/register') return { name: 'register' }
  const match = path.match(/^\/posts\/([^/]+)$/)
  if (match) return { name: 'post', slug: decodeURIComponent(match[1]) }
  return { name: 'notfound' }
}

function redirectFor(routeName, user) {
  if ((routeName === 'author' || routeName === 'admin') && !user) return '/login'
  if (routeName === 'admin' && user.role !== 'admin') return '/author'
  if ((routeName === 'login' || routeName === 'register') && user) return '/author'
  return null
}

export default function App() {
  const path = usePath()
  const { theme, accent, setAccent, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(() => Boolean(getToken()))
  const [expired, setExpired] = useState(false)

  const route = resolveRoute(path)
  const redirect = booting || expired ? null : redirectFor(route.name, user)

  useEffect(() => {
    if (!getToken()) return
    getProfile()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setBooting(false))
  }, [])

  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setExpired(true)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])

  useEffect(() => {
    if (route.name !== 'post') setPageMeta(...META[route.name])
  }, [route.name])

  const handleAuthSuccess = (profile) => {
    setUser(profile)
    navigate(profile.role === 'admin' ? '/admin' : '/author')
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // sesi lokal tetap dihapus walau server tidak merespons
    }
    clearToken()
    setUser(null)
    navigate('/')
  }

  const closeExpired = useCallback(() => setExpired(false), [])
  const handleReauth = (profile) => {
    setUser(profile)
    setExpired(false)
  }

  let content = null
  if (booting) {
    content = (
      <p role="status" className={`px-4 py-12 text-center ${mutedText}`}>
        Memuat sesi...
      </p>
    )
  } else if (!redirect) {
    if (route.name === 'home') content = <PublicArticleList />
    else if (route.name === 'post') content = <PublicArticleDetail slug={route.slug} theme={theme} />
    else if (route.name === 'login') content = <AuthPage mode="login" onSuccess={handleAuthSuccess} />
    else if (route.name === 'register') content = <AuthPage mode="register" onSuccess={handleAuthSuccess} />
    else if (route.name === 'author') content = <AuthorDashboard theme={theme} />
    else if (route.name === 'admin') content = <AdminDashboard />
    else {
      content = (
        <div className="px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold">Halaman tidak ditemukan</h1>
          <p className={`mt-2 ${mutedText}`}>Alamat yang Anda tuju tidak tersedia.</p>
          <AppLink href="/" className={`${linkCls} mt-4 inline-block`}>
            Kembali ke beranda
          </AppLink>
        </div>
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Lewati ke konten utama
      </a>
      <StickyNavbar
        user={user}
        path={path}
        theme={theme}
        accent={accent}
        onToggleTheme={toggleTheme}
        onAccentChange={setAccent}
        onLogout={handleLogout}
      />
      <main id="main" className="flex-1">
        <Suspense
          fallback={
            <p role="status" className={`px-4 py-12 text-center ${mutedText}`}>
              Memuat halaman...
            </p>
          }
        >
          {content}
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        &copy; 2026 {SITE_NAME}. Platform blog multi-tier dengan AI Generator.
      </footer>
      {expired && <AuthModal onClose={closeExpired} onSuccess={handleReauth} />}
    </div>
  )
}

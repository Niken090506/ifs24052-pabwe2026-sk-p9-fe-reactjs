import AuthForm from './AuthForm'
import { card, mutedText } from '../../../helpers/uiClasses'

export default function AuthPage({ mode, onSuccess }) {
  const isLogin = mode === 'login'
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className={`${card} p-6 sm:p-8`}>
        <h1 className="mb-1 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>
        <p className={`mb-6 text-sm ${mutedText}`}>
          {isLogin ? 'Masuk untuk mengelola artikel Anda.' : 'Buat akun untuk mulai menulis artikel.'}
        </p>
        <AuthForm mode={mode} onSuccess={onSuccess} />
      </div>
    </div>
  )
}

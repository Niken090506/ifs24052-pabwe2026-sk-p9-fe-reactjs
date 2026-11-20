import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import AppLink from '../../../components/AppLink'
import { login, register, getProfile } from '../api/authApi'
import { setToken } from '../../../helpers/apiHelper'
import { btnPrimary, inputCls, mutedText, linkCls } from '../../../helpers/uiClasses'

/**
 * Form login/register dipakai oleh halaman mandiri (AuthPage) dan modal (AuthModal).
 * onSuccess menerima objek user.
 */
export default function AuthForm({ mode, onSuccess, withLinks = true }) {
  const username = useInput('')
  const email = useInput('')
  const password = useInput('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!username.value.trim() || !password.value || (!isLogin && !email.value.trim())) {
      setError('Semua kolom wajib diisi.')
      return
    }
    setLoading(true)
    try {
      if (isLogin) {
        const data = await login({ username: username.value.trim(), password: password.value })
        setToken(data.token)
      } else {
        await register({ username: username.value.trim(), email: email.value.trim(), password: password.value })
        const data = await login({ username: username.value.trim(), password: password.value })
        setToken(data.token)
      }
      onSuccess(await getProfile())
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={isLogin ? 'login-username' : 'register-username'} className="mb-1 block text-sm font-medium">
          Username
        </label>
        <input
          id={isLogin ? 'login-username' : 'register-username'}
          type="text"
          autoComplete="username"
          value={username.value}
          onChange={username.onChange}
          className={inputCls}
        />
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email.value}
            onChange={email.onChange}
            className={inputCls}
          />
        </div>
      )}
      <div>
        <label htmlFor={isLogin ? 'login-password' : 'register-password'} className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id={isLogin ? 'login-password' : 'register-password'}
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password.value}
          onChange={password.onChange}
          className={inputCls}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900 dark:bg-red-950 dark:text-red-100">
          {error}
        </p>
      )}
      <button id={isLogin ? 'login-submit' : 'register-submit'} type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
        {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
      </button>
      {withLinks && (
        <p className={`text-center text-sm ${mutedText}`}>
          {isLogin ? (
            <>
              Belum punya akun?{' '}
              <AppLink href="/register" className={linkCls}>
                Daftar sekarang
              </AppLink>
            </>
          ) : (
            <>
              Sudah punya akun?{' '}
              <AppLink href="/login" className={linkCls}>
                Masuk di sini
              </AppLink>
            </>
          )}
        </p>
      )}
    </form>
  )
}

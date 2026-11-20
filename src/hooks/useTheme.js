import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'delcom_blog_theme'
const ACCENT_KEY = 'delcom_blog_accent'

export const ACCENTS = [
  { id: 'indigo', label: 'Indigo' },
  { id: 'emerald', label: 'Zamrud' },
  { id: 'rose', label: 'Mawar' },
]

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem(ACCENT_KEY) || 'indigo')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, accent, setAccent, toggleTheme }
}

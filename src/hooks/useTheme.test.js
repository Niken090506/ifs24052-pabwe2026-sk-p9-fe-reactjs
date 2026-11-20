import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useTheme, { ACCENTS } from './useTheme'

describe('useTheme', () => {
  it('default light + indigo', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.dataset.accent).toBe('indigo')
    expect(ACCENTS).toHaveLength(3)
  })

  it('toggle tema bolak-balik dan menyimpan ke localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('delcom_blog_theme')).toBe('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('membaca preferensi tersimpan & mengganti aksen', () => {
    localStorage.setItem('delcom_blog_theme', 'dark')
    localStorage.setItem('delcom_blog_accent', 'rose')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('rose')
    act(() => result.current.setAccent('emerald'))
    expect(document.documentElement.dataset.accent).toBe('emerald')
  })
})

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Polyfill JSDOM untuk Toast UI (matchMedia, selection, scrollTo, canvas)
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }))
window.scrollTo = vi.fn()
document.createRange =
  document.createRange ||
  (() => ({
    setStart: () => {},
    setEnd: () => {},
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
    getClientRects: () => [],
  }))

beforeEach(() => {
  document.head.innerHTML = '<meta name="description" content="" />'
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.documentElement.classList.remove('dark')
  window.history.replaceState({}, '', '/')
})

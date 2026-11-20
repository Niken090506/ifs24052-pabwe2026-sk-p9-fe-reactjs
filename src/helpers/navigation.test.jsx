import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { navigate, usePath } from './navigation'

function Probe() {
  return <p data-testid="path">{usePath()}</p>
}

describe('navigation', () => {
  it('navigate (push) memperbarui usePath', () => {
    render(<Probe />)
    expect(screen.getByTestId('path')).toHaveTextContent('/')
    act(() => navigate('/author'))
    expect(screen.getByTestId('path')).toHaveTextContent('/author')
    expect(window.location.pathname).toBe('/author')
  })

  it('navigate (replace) tidak menambah riwayat', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    render(<Probe />)
    act(() => navigate('/login', { replace: true }))
    expect(replace).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
  })
})

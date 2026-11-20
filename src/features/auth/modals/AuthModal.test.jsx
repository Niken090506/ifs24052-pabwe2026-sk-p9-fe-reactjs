import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AuthModal from './AuthModal'

describe('AuthModal', () => {
  it('menutup dengan Escape', async () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} onSuccess={vi.fn()} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Batal' })).toBeInTheDocument()
  })
})

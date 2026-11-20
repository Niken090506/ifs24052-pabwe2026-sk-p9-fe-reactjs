import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total_posts: 5, total_published: 3, total_draft: 2 }} />)
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('5')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Belum Selesai (Draf)').nextSibling).toHaveTextContent('2')
  })

  it('default 0 saat data kosong', () => {
    render(<PostStats stats={{}} />)
    expect(screen.getAllByText('0')).toHaveLength(3)
  })
})

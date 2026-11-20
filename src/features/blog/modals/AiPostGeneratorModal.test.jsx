import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({ aiGenerate: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))
import { aiGenerate } from '../api/blogApi'
import AiPostGeneratorModal from './AiPostGeneratorModal'

const result = {
  title: 'Judul AI',
  category: 'Bisnis',
  excerpt: 'Ringkasan AI',
  content: '# Konten AI',
  sources: [
    { title: 'Sumber 1', url: 'https://a.test' },
    { url: 'https://b.test' },
  ],
}

describe('AiPostGeneratorModal', () => {
  it('memvalidasi topik wajib diisi dan tombol terapkan nonaktif', async () => {
    render(<AiPostGeneratorModal theme="light" onClose={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Simpan ke Editor' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik artikel wajib diisi.')
    expect(aiGenerate).not.toHaveBeenCalled()
  })

  it('menghasilkan artikel dengan search engine dan menerapkannya', async () => {
    aiGenerate.mockResolvedValue(result)
    const onApply = vi.fn()
    render(<AiPostGeneratorModal theme="light" onClose={vi.fn()} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), ' Tren AI ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Pendidikan')
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    expect(await screen.findByText('Judul AI')).toBeInTheDocument()
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'Tren AI', category: 'Pendidikan', include_web_search: true })
    expect(await screen.findByTestId('viewer')).toHaveTextContent('# Konten AI')
    expect(screen.getByRole('link', { name: 'Sumber 1' })).toHaveAttribute('href', 'https://a.test')
    expect(screen.getByRole('link', { name: 'https://b.test' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan ke Editor' }))
    expect(onApply).toHaveBeenCalledWith({ title: 'Judul AI', category: 'Bisnis', excerpt: 'Ringkasan AI', content: '# Konten AI' })
  })

  it('opsi search engine dapat dimatikan; kategori & sumber fallback', async () => {
    aiGenerate.mockResolvedValue({ title: 'T', excerpt: 'e', content: 'c', search_sources: [] })
    const onApply = vi.fn()
    render(<AiPostGeneratorModal theme="light" onClose={vi.fn()} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')
    await userEvent.click(screen.getByLabelText('Sertakan penelusuran search engine'))
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    await screen.findByText('T')
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'x', category: 'Teknologi', include_web_search: false })
    expect(screen.queryByText('Sumber Penelusuran')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan ke Editor' }))
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ category: 'Teknologi' }))
  })

  it('hasil tanpa field sumber sama sekali', async () => {
    aiGenerate.mockResolvedValue({ title: 'T2', excerpt: 'e', content: 'c' })
    render(<AiPostGeneratorModal theme="light" onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    expect(await screen.findByText('T2')).toBeInTheDocument()
    expect(screen.queryByText('Sumber Penelusuran')).toBeNull()
  })

  it('menampilkan error dan Batal menutup modal', async () => {
    aiGenerate.mockRejectedValue(new Error('AI gagal'))
    const onClose = vi.fn()
    render(<AiPostGeneratorModal theme="light" onClose={onClose} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI gagal')
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})

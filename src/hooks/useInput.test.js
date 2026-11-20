import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useInput from './useInput'

describe('useInput', () => {
  it('memakai nilai awal kosong secara default', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current.value).toBe('')
  })

  it('onChange, setValue, dan reset', () => {
    const { result } = renderHook(() => useInput('awal'))
    act(() => result.current.onChange({ target: { value: 'baru' } }))
    expect(result.current.value).toBe('baru')
    act(() => result.current.setValue('lain'))
    expect(result.current.value).toBe('lain')
    act(() => result.current.reset())
    expect(result.current.value).toBe('awal')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from './useDebounce'

describe('useDebounce', () => {
  it('값을 디바운스함', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial')

    await waitFor(() => expect(result.current).toBe('updated'), { timeout: 600 })
  })
})

describe('useDebouncedCallback', () => {
  it('함수 호출을 디바운스함', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    result.current('test1')
    result.current('test2')
    result.current('test3')

    expect(callback).not.toHaveBeenCalled()

    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1), { timeout: 600 })
    expect(callback).toHaveBeenCalledWith('test3')
  })
})

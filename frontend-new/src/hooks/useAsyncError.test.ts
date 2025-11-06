import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAsyncError, useAsyncWrapper } from './useAsyncError'
import { useToastStore } from '@/stores/toastStore'

vi.mock('@/stores/toastStore', () => ({
  useToastStore: vi.fn(),
}))

describe('useAsyncError', () => {
  const mockError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToastStore).mockReturnValue({
      error: mockError,
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    } as ReturnType<typeof useToastStore>)
  })

  it('에러를 처리하고 토스트를 표시함', () => {
    const { result } = renderHook(() => useAsyncError())
    const error = new Error('테스트 에러')

    result.current(error)

    expect(mockError).toHaveBeenCalledWith('오류', '테스트 에러')
  })

  it('커스텀 메시지를 사용할 수 있음', () => {
    const { result } = renderHook(() => useAsyncError())
    const error = new Error('원본 에러')

    result.current(error, '커스텀 에러 메시지')

    expect(mockError).toHaveBeenCalledWith('오류', '커스텀 에러 메시지')
  })

  it('문자열 에러를 처리함', () => {
    const { result } = renderHook(() => useAsyncError())

    result.current('문자열 에러')

    expect(mockError).toHaveBeenCalled()
  })
})

describe('useAsyncWrapper', () => {
  const mockError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToastStore).mockReturnValue({
      error: mockError,
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    } as ReturnType<typeof useToastStore>)
  })

  it('성공적인 비동기 함수 실행', async () => {
    const { result } = renderHook(() => useAsyncWrapper())
    const asyncFn = vi.fn().mockResolvedValue('성공')

    const wrapped = result.current(asyncFn)
    const returnValue = await wrapped()

    expect(asyncFn).toHaveBeenCalled()
    expect(returnValue).toBe('성공')
    expect(mockError).not.toHaveBeenCalled()
  })

  it('에러 발생 시 처리', async () => {
    const { result } = renderHook(() => useAsyncWrapper())
    const asyncFn = vi.fn().mockRejectedValue(new Error('비동기 에러'))

    const wrapped = result.current(asyncFn)
    const returnValue = await wrapped()

    expect(asyncFn).toHaveBeenCalled()
    expect(returnValue).toBeUndefined()
    expect(mockError).toHaveBeenCalled()
  })

  it('커스텀 에러 핸들러 실행', async () => {
    const { result } = renderHook(() => useAsyncWrapper())
    const asyncFn = vi.fn().mockRejectedValue(new Error('에러'))
    const customErrorHandler = vi.fn()

    const wrapped = result.current(asyncFn, { onError: customErrorHandler })
    await wrapped()

    expect(customErrorHandler).toHaveBeenCalled()
  })

  it('커스텀 에러 메시지 사용', async () => {
    const { result } = renderHook(() => useAsyncWrapper())
    const asyncFn = vi.fn().mockRejectedValue(new Error('에러'))

    const wrapped = result.current(asyncFn, { errorMessage: '작업 실패' })
    await wrapped()

    expect(mockError).toHaveBeenCalledWith(expect.any(String), '작업 실패')
  })
})

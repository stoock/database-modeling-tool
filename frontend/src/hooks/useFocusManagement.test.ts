import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFocusTrap, useAutoFocus, useArrowKeyNavigation } from './useFocusManagement'

describe('useFocusTrap', () => {
  it('포커스 트랩 ref를 반환함', () => {
    const { result } = renderHook(() => useFocusTrap(true))
    expect(result.current).toBeDefined()
    expect(result.current.current).toBeNull()
  })

  it('비활성화 시 동작하지 않음', () => {
    const { result } = renderHook(() => useFocusTrap(false))
    expect(result.current).toBeDefined()
  })
})

describe('useAutoFocus', () => {
  it('자동 포커스 ref를 반환함', () => {
    const { result } = renderHook(() => useAutoFocus())
    expect(result.current).toBeDefined()
    expect(result.current.current).toBeNull()
  })

  it('요소가 마운트되면 포커스 시도', () => {
    const { result } = renderHook(() => useAutoFocus<HTMLInputElement>())
    
    // ref 객체가 반환되는지 확인
    expect(result.current).toBeDefined()
    expect(result.current.current).toBeNull()
    
    // 실제 포커스 동작은 브라우저 환경에서만 테스트 가능
  })
})

describe('useArrowKeyNavigation', () => {
  it('화살표 키 네비게이션 설정', () => {
    const onSelect = vi.fn()
    renderHook(
      ({ itemCount, currentIndex }) => useArrowKeyNavigation(itemCount, onSelect, currentIndex),
      { initialProps: { itemCount: 5, currentIndex: 0 } }
    )

    expect(onSelect).not.toHaveBeenCalled()

    // ArrowDown 키 이벤트 시뮬레이션
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(event)

    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('ArrowUp 키로 이전 항목 선택', () => {
    const onSelect = vi.fn()
    renderHook(() => useArrowKeyNavigation(5, onSelect, 2))

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(event)

    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('Home 키로 첫 항목 선택', () => {
    const onSelect = vi.fn()
    renderHook(() => useArrowKeyNavigation(5, onSelect, 3))

    const event = new KeyboardEvent('keydown', { key: 'Home' })
    window.dispatchEvent(event)

    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it('End 키로 마지막 항목 선택', () => {
    const onSelect = vi.fn()
    renderHook(() => useArrowKeyNavigation(5, onSelect, 1))

    const event = new KeyboardEvent('keydown', { key: 'End' })
    window.dispatchEvent(event)

    expect(onSelect).toHaveBeenCalledWith(4)
  })

  it('범위를 벗어나지 않음', () => {
    const onSelect = vi.fn()
    renderHook(() => useArrowKeyNavigation(3, onSelect, 2))

    // 마지막 항목에서 ArrowDown - 범위를 벗어나므로 호출되지 않음
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(event)

    // 범위를 벗어나면 onSelect가 호출되지 않음
    expect(onSelect).not.toHaveBeenCalled()
  })
})

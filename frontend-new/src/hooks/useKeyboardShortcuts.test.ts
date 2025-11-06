import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, useEscapeKey, useEnterKey } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  it('단축키 핸들러 등록', () => {
    const handler = vi.fn()
    const shortcuts = [
      { key: 'n', ctrl: true, handler, description: '새로 만들기' },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalled()
  })

  it('Shift 키 조합', () => {
    const handler = vi.fn()
    const shortcuts = [
      { key: 's', ctrl: true, shift: true, handler, description: '다른 이름으로 저장' },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: true })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalled()
  })

  it('입력 필드에서는 단축키 비활성화', () => {
    const handler = vi.fn()
    const shortcuts = [
      { key: 'a', handler, description: '전체 선택' },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', { key: 'a' })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('Ctrl+S는 입력 필드에서도 동작', () => {
    const handler = vi.fn()
    const shortcuts = [
      { key: 's', ctrl: true, handler, description: '저장' },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('여러 단축키 등록', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const shortcuts = [
      { key: 'n', ctrl: true, handler: handler1, description: '새로 만들기' },
      { key: 'o', ctrl: true, handler: handler2, description: '열기' },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event1 = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true })
    window.dispatchEvent(event1)
    expect(handler1).toHaveBeenCalled()

    const event2 = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true })
    window.dispatchEvent(event2)
    expect(handler2).toHaveBeenCalled()
  })
})

describe('useEscapeKey', () => {
  it('Escape 키 핸들러 등록', () => {
    const handler = vi.fn()
    renderHook(() => useEscapeKey(handler))

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalled()
  })

  it('비활성화 시 동작하지 않음', () => {
    const handler = vi.fn()
    renderHook(() => useEscapeKey(handler, false))

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('useEnterKey', () => {
  it('Enter 키 핸들러 등록', () => {
    const handler = vi.fn()
    renderHook(() => useEnterKey(handler))

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalled()
  })

  it('Shift+Enter는 무시', () => {
    const handler = vi.fn()
    renderHook(() => useEnterKey(handler))

    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('버튼에서는 동작하지 않음', () => {
    const handler = vi.fn()
    renderHook(() => useEnterKey(handler))

    const button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    Object.defineProperty(event, 'target', { value: button, enumerable: true })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(button)
  })

  it('비활성화 시 동작하지 않음', () => {
    const handler = vi.fn()
    renderHook(() => useEnterKey(handler, false))

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })
})

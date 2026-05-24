import { useEffect } from 'react'

/**
 * 监听 window keydown，把 QWERTY 按键映射到 visibleKeys 中的某个 key 并回调。
 * 空格键单独回调（用于 play/pause toggle）。
 */
export function useKeyboardInput({ visibleKeys, onKey, onSpace }) {
  useEffect(() => {
    if (!visibleKeys?.length) return undefined

    const handler = (event) => {
      if (event.repeat) return
      const target = event.target
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        onSpace?.()
        return
      }

      const pressed = event.key === ';' ? ';' : event.key.toUpperCase()
      const key = visibleKeys.find(k => k.keyboardKey === pressed)
      if (key) {
        event.preventDefault()
        onKey?.(key)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visibleKeys, onKey, onSpace])
}

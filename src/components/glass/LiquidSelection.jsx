import { memo, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import LiquidGlass from 'liquid-glass-react'
import './liquidGlass.css'

const PREFERENCE = '(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (prefers-contrast: more)'
const STATIONARY_POINTER = { x: 0, y: 0 }
const ENGINE_STYLE = { position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%' }

function subscribeToPreference(callback) {
  const media = window.matchMedia(PREFERENCE)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function reducedPreference() {
  return window.matchMedia(PREFERENCE).matches
}

// The optical layer stays still; only its parent lens moves and stretches.
const OpticalGlass = memo(function OpticalGlass({ radius }) {
  const reduced = useSyncExternalStore(subscribeToPreference, reducedPreference, () => true)
  return (
    <div className="liquid-optic" aria-hidden="true">
      {!reduced && (
        <>
          <LiquidGlass
            className="liquid-optic-engine"
            mode="standard"
            cornerRadius={radius}
            displacementScale={70}
            aberrationIntensity={0}
            blurAmount={0}
            saturation={130}
            elasticity={0}
            globalMousePos={STATIONARY_POINTER}
            mouseOffset={STATIONARY_POINTER}
            padding="0"
            style={ENGINE_STYLE}
          >
            <span />
          </LiquidGlass>
          <span className="liquid-optic-edge" />
          <span className="liquid-optic-reflection" />
        </>
      )}
    </div>
  )
})

export function LiquidGlassSurface({ radius = 12 }) {
  return (
    <span
      aria-hidden="true"
      className="liquid-lens liquid-theme-surface pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ borderRadius: radius }}
    >
      <OpticalGlass radius={radius} />
    </span>
  )
}

function rectWithinTrack(element, track) {
  const box = element.getBoundingClientRect()
  const bounds = track.getBoundingClientRect()
  return {
    x: box.left - bounds.left - track.clientLeft + track.scrollLeft,
    y: box.top - bounds.top - track.clientTop + track.scrollTop,
    width: box.width,
    height: box.height,
  }
}

function sameRect(a, b) {
  return a && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) +
    Math.abs(a.width - b.width) + Math.abs(a.height - b.height) < 1
}

function axisOf(items, track) {
  if (items.length < 2) return 'horizontal'
  const first = rectWithinTrack(items[0], track)
  const last = rectWithinTrack(items[items.length - 1], track)
  return Math.abs(last.y - first.y) > Math.abs(last.x - first.x) ? 'vertical' : 'horizontal'
}

function scrollingParent(track, axis) {
  for (let element = track; element; element = element.parentElement) {
    const style = getComputedStyle(element)
    const overflow = axis === 'horizontal' ? style.overflowX : style.overflowY
    const range = axis === 'horizontal'
      ? element.scrollWidth - element.clientWidth
      : element.scrollHeight - element.clientHeight
    if (range > 1 && /auto|scroll/.test(overflow)) return element
  }
  return track
}

// Links and buttons stay native hit targets; this element is only the moving material.
export default function LiquidSelection({ value, onSelect, radius = 999 }) {
  const lensRef = useRef(null)
  const valueRef = useRef(value)
  const onSelectRef = useRef(onSelect)
  const placeRef = useRef(null)

  useLayoutEffect(() => {
    valueRef.current = value
    onSelectRef.current = onSelect
    placeRef.current?.(true)
  }, [value, onSelect])

  useLayoutEffect(() => {
    const lens = lensRef.current
    const track = lens?.parentElement
    if (!lens || !track) return undefined

    let previous = null
    let animation = null
    let frame = 0
    let resizeFrame = 0
    let drag = null
    let suppressClick = false
    let lastFrameTime = 0
    const options = () => [...track.querySelectorAll(':scope > [data-liquid-value]')]
    const visualRect = () => rectWithinTrack(lens, track)

    const moveTo = (next, animate, from = previous) => {
      animation?.cancel()
      animation = null
      lens.style.width = `${next.width}px`
      lens.style.height = `${next.height}px`
      lens.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`
      lens.style.opacity = '1'
      previous = next
      if (!animate || !from || sameRect(from, next) || reducedPreference()) return
      animation = lens.animate([
        { transform: `translate3d(${from.x}px, ${from.y}px, 0) scale(${from.width / next.width}, ${from.height / next.height})` },
        { transform: `translate3d(${next.x}px, ${next.y}px, 0) scale(1)` },
      ], { duration: 360, easing: 'cubic-bezier(.19, .85, .24, 1)' })
    }

    const place = (animate) => {
      if (drag) return
      const items = options()
      const selected = items.find(option => option.dataset.liquidValue === valueRef.current)
      if (!selected || !selected.getClientRects().length) {
        lens.style.opacity = '0'
        previous = null
        return
      }
      track.dataset.liquidAxis = axisOf(items, track)
      moveTo(rectWithinTrack(selected, track), animate)
    }
    placeRef.current = place
    place(false)

    const queuePlace = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => place(false))
    }
    const observer = new ResizeObserver(queuePlace)
    observer.observe(track)
    options().forEach(option => observer.observe(option))
    track.addEventListener('scroll', queuePlace, { passive: true })

    const paint = (time) => {
      frame = 0
      if (!drag || !drag.moved) return
      const d = drag
      const elapsed = Math.min(32, Math.max(0, time - lastFrameTime))
      lastFrameTime = time
      const axis = d.axis
      const trackBounds = track.getBoundingClientRect()
      const viewportBounds = d.scrollHost.getBoundingClientRect()
      const screenAxis = axis === 'horizontal' ? d.x : d.y
      const screenStart = axis === 'horizontal' ? viewportBounds.left : viewportBounds.top
      const screenEnd = axis === 'horizontal' ? viewportBounds.right : viewportBounds.bottom
      const scroll = axis === 'horizontal' ? d.scrollHost.scrollLeft : d.scrollHost.scrollTop
      const scrollRange = axis === 'horizontal'
        ? d.scrollHost.scrollWidth - d.scrollHost.clientWidth
        : d.scrollHost.scrollHeight - d.scrollHost.clientHeight
      if (scrollRange > 0) {
        const edge = screenAxis < screenStart + 32 ? -1 : screenAxis > screenEnd - 32 ? 1 : 0
        if (edge) {
          const next = Math.max(0, Math.min(scrollRange, scroll + edge * 430 * elapsed / 1000))
          if (axis === 'horizontal') d.scrollHost.scrollLeft = next
          else d.scrollHost.scrollTop = next
          if (next !== scroll && !frame) frame = requestAnimationFrame(paint)
        }
      }

      const items = options().map(option => ({ option, rect: rectWithinTrack(option, track) }))
      if (!items.length) return
      const local = screenAxis - (axis === 'horizontal' ? trackBounds.left : trackBounds.top) -
        (axis === 'horizontal' ? track.clientLeft : track.clientTop) +
        (axis === 'horizontal' ? track.scrollLeft : track.scrollTop)
      const centerOf = item => axis === 'horizontal'
        ? item.rect.x + item.rect.width / 2
        : item.rect.y + item.rect.height / 2
      const nearest = items.reduce((best, item) =>
        !best || Math.abs(centerOf(item) - local) < Math.abs(centerOf(best) - local) ? item : best, null)
      const extent = axis === 'horizontal' ? nearest.rect.width : nearest.rect.height
      const first = items[0].rect
      const last = items[items.length - 1].rect
      const lower = axis === 'horizontal' ? first.x : first.y
      const upper = axis === 'horizontal'
        ? last.x + last.width - extent
        : last.y + last.height - extent
      const desired = Math.max(lower, Math.min(upper, local - extent / 2))
      const outside = screenAxis < screenStart ? screenAxis - screenStart
        : screenAxis > screenEnd ? screenAxis - screenEnd : 0
      const endpoint = Math.sign(outside) * Math.min(16, Math.abs(outside) / 7)
      const target = desired + endpoint
      const smoothing = 1 - Math.exp(-Math.max(1, elapsed) / 55)
      d.spring += (target - d.spring) * smoothing
      const travel = Math.abs(screenAxis - d.startAxis)
      const lag = Math.abs(target - d.spring)
      const stretch = Math.min(0.14, travel / 950 + lag / 260)
      const collision = Math.min(0.07, Math.abs(outside) / 240)
      const mainScale = extent / d.startExtent * (1 + stretch - collision)
      const crossScale = (axis === 'horizontal' ? nearest.rect.height / d.start.height : nearest.rect.width / d.start.width) *
        (1 - stretch * 0.18 + collision * 0.25)
      lens.style.transform = axis === 'horizontal'
        ? `translate3d(${d.spring}px, ${nearest.rect.y}px, 0) scale(${mainScale}, ${crossScale})`
        : `translate3d(${nearest.rect.x}px, ${d.spring}px, 0) scale(${crossScale}, ${mainScale})`

      // The rim light follows the pointer; interactive labels stay in the content layer.
      const offset = (local - centerOf(nearest)) / Math.max(extent / 2, 1)
      lens.style.setProperty('--lens-light-x', `${Math.max(0, Math.min(100, 50 + offset * 45))}%`)
      lens.style.setProperty('--lens-light-y', `${Math.max(0, Math.min(100, 50 + offset * 45))}%`)
      if (Math.abs(target - d.spring) > 0.2 && !frame) frame = requestAnimationFrame(paint)
    }

    const pointerDown = (event) => {
      if (!onSelectRef.current || event.button !== 0 || !event.isPrimary || reducedPreference()) return
      const origin = event.target instanceof Element ? event.target.closest('[data-liquid-value]') : null
      if (!origin || origin.parentElement !== track) return
      suppressClick = false
      const items = options()
      const axis = axisOf(items, track)
      track.dataset.liquidAxis = axis
      if (event.pointerType === 'touch' && axis === 'vertical' &&
          origin.dataset.liquidValue !== valueRef.current) return
      const start = previous || rectWithinTrack(origin, track)
      const startAxis = axis === 'horizontal' ? event.clientX : event.clientY
      drag = {
        id: event.pointerId, axis, start, startAxis, scrollHost: scrollingParent(track, axis),
        startExtent: axis === 'horizontal' ? start.width : start.height,
        x: event.clientX, y: event.clientY,
        spring: axis === 'horizontal' ? start.x : start.y,
        moved: false,
      }
    }

    const pointerMove = (event) => {
      if (!drag || event.pointerId !== drag.id) return
      drag.x = event.clientX
      drag.y = event.clientY
      const currentAxis = drag.axis === 'horizontal' ? drag.x : drag.y
      if (!drag.moved && Math.abs(currentAxis - drag.startAxis) < 4) return
      if (!drag.moved) {
        drag.moved = true
        animation?.cancel()
        animation = null
        track.setPointerCapture(event.pointerId)
        track.dataset.liquidDragging = ''
        lens.dataset.liquidDragging = ''
        lastFrameTime = performance.now()
      }
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const finish = (commit, event) => {
      if (!drag) return
      const d = drag
      drag = null
      cancelAnimationFrame(frame)
      frame = 0
      delete track.dataset.liquidDragging
      delete lens.dataset.liquidDragging
      if (track.hasPointerCapture(d.id)) track.releasePointerCapture(d.id)
      if (!d.moved) return
      const from = visualRect()
      const items = options()
      const axis = d.axis
      const pointer = event ? axis === 'horizontal' ? event.clientX : event.clientY : null
      const nearest = commit && pointer !== null
        ? items.reduce((best, item) => {
          const box = item.getBoundingClientRect()
          const center = axis === 'horizontal' ? box.left + box.width / 2 : box.top + box.height / 2
          return !best || Math.abs(pointer - center) < best.distance
            ? { item, distance: Math.abs(pointer - center) } : best
        }, null)?.item
        : items.find(item => item.dataset.liquidValue === valueRef.current)
      if (nearest) {
        const next = rectWithinTrack(nearest, track)
        moveTo(next, true, from)
        if (commit && nearest.dataset.liquidValue !== valueRef.current) {
          suppressClick = true
          onSelectRef.current?.(nearest.dataset.liquidValue)
        } else if (commit) suppressClick = true
      }
    }

    const pointerUp = event => {
      if (drag?.id !== event.pointerId) return
      finish(true, event)
    }
    const pointerCancel = () => finish(false)
    const captureClick = event => {
      if (!suppressClick) return
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
    }
    track.addEventListener('pointerdown', pointerDown)
    track.addEventListener('pointermove', pointerMove, { passive: true })
    track.addEventListener('pointerup', pointerUp)
    track.addEventListener('pointercancel', pointerCancel)
    track.addEventListener('lostpointercapture', pointerCancel)
    track.addEventListener('click', captureClick, true)
    return () => {
      animation?.cancel()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      placeRef.current = null
      delete track.dataset.liquidDragging
      delete track.dataset.liquidAxis
      track.removeEventListener('scroll', queuePlace)
      track.removeEventListener('pointerdown', pointerDown)
      track.removeEventListener('pointermove', pointerMove)
      track.removeEventListener('pointerup', pointerUp)
      track.removeEventListener('pointercancel', pointerCancel)
      track.removeEventListener('lostpointercapture', pointerCancel)
      track.removeEventListener('click', captureClick, true)
    }
  }, [])

  return (
    <div
      ref={lensRef}
      aria-hidden="true"
      className="liquid-lens pointer-events-none absolute left-0 top-0 z-0 overflow-hidden rounded-full"
      style={{ borderRadius: radius }}
    >
      <OpticalGlass radius={radius} />
    </div>
  )
}

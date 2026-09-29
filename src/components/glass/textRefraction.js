const SVG_NS = 'http://www.w3.org/2000/svg'
const FIELD_SCALE = 24
const MAP_CACHE_LIMIT = 24
const displacementMaps = new Map()
let nextFilterId = 0

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const smoothstep = value => value * value * (3 - 2 * value)

function roundedRectDistance(x, y, width, height, radius) {
  const qx = Math.abs(x - width / 2) - width / 2 + radius
  const qy = Math.abs(y - height / 2) - height / 2 + radius
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

// The alpha channel is also the soft edge mask. Neutral pixels leave the
// original glyphs untouched; only the two travel-facing bevels bend and blur.
function makeDisplacementMap(rect, radius, axis) {
  const cacheKey = `${rect.width}:${rect.height}:${radius}:${axis}`
  const cached = displacementMaps.get(cacheKey)
  if (cached !== undefined) {
    displacementMaps.delete(cacheKey)
    displacementMaps.set(cacheKey, cached)
    return cached
  }

  const canvas = document.createElement('canvas')
  canvas.width = clamp(Math.ceil(rect.width * 2), 2, 384)
  canvas.height = clamp(Math.ceil(rect.height * 2), 2, 128)
  const context = canvas.getContext('2d')
  if (!context) return null

  const pixels = context.createImageData(canvas.width, canvas.height)
  const corner = clamp(radius, 0, Math.min(rect.width, rect.height) / 2)
  const bevel = Math.min(rect.height * 0.48, 22)
  const distance = (x, y) => roundedRectDistance(x, y, rect.width, rect.height, corner)

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const px = (x + 0.5) * rect.width / canvas.width
      const py = (y + 0.5) * rect.height / canvas.height
      const depth = -distance(px, py) / bevel
      if (depth <= 0 || depth >= 1) continue

      const nx = distance(px + 0.5, py) - distance(px - 0.5, py)
      const ny = distance(px, py + 0.5) - distance(px, py - 0.5)
      const direction = Math.abs(axis === 'horizontal' ? nx : ny) / Math.max(Math.hypot(nx, ny), 0.001)
      const facing = smoothstep(clamp((direction - 0.35) / 0.55, 0, 1))
      const entering = smoothstep(clamp(depth / 0.16, 0, 1))
      const leaving = 1 - smoothstep(clamp((depth - 0.18) / 0.82, 0, 1))
      const weight = facing * entering * leaving
      const offset = (y * canvas.width + x) * 4
      const bend = 4.2 * 255 / FIELD_SCALE
      pixels.data[offset] = Math.round(127.5 + (axis === 'horizontal' ? Math.sign(nx) * bend : 0))
      pixels.data[offset + 1] = Math.round(127.5 + (axis === 'vertical' ? Math.sign(ny) * bend : 0))
      pixels.data[offset + 2] = 128
      pixels.data[offset + 3] = Math.round(weight * 255)
    }
  }

  context.putImageData(pixels, 0, 0)
  const map = canvas.toDataURL()
  displacementMaps.set(cacheKey, map)
  if (displacementMaps.size > MAP_CACHE_LIMIT) {
    displacementMaps.delete(displacementMaps.keys().next().value)
  }
  return map
}

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
  return element
}

function labelRect(option, label, rect) {
  const optionBox = option.getBoundingClientRect()
  const labelBox = label.getBoundingClientRect()
  return {
    x: rect.x + labelBox.left - optionBox.left,
    y: rect.y + labelBox.top - optionBox.top,
    width: labelBox.width,
    height: labelBox.height,
  }
}

// Filter SourceGraphic itself, so the readable DOM text remains the only text
// layer. The selected label stays crisp while the lens crosses other labels.
export function createTextRefraction(items, lens, radius, axis) {
  const map = makeDisplacementMap(lens, radius, axis)
  if (!map) return null

  const defs = svgElement('svg', { 'aria-hidden': 'true', 'data-text-refraction-defs': '' })
  Object.assign(defs.style, { position: 'absolute', width: '0', height: '0', pointerEvents: 'none' })
  const labels = items.flatMap(({ option, rect }) =>
    [...option.querySelectorAll('[data-glass-label]')].map(label => {
      const bounds = labelRect(option, label, rect)
      const id = `algo-liquid-text-${++nextFilterId}`
      const filter = svgElement('filter', {
        id, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse',
        x: '-16', y: '-16', width: String(bounds.width + 32), height: String(bounds.height + 32),
        'color-interpolation-filters': 'sRGB',
      })
      const image = svgElement('feImage', { href: map, preserveAspectRatio: 'none', result: 'rim-map' })
      const field = svgElement('feMerge', { result: 'field' })
      field.append(svgElement('feMergeNode', { in: 'neutral' }), svgElement('feMergeNode', { in: 'rim-map' }))
      const output = svgElement('feMerge', {})
      output.append(svgElement('feMergeNode', { in: 'face' }), svgElement('feMergeNode', { in: 'rim-blur' }))
      filter.append(
        svgElement('feFlood', { 'flood-color': 'rgb(50%,50%,0%)', result: 'neutral' }),
        image,
        field,
        svgElement('feDisplacementMap', {
          in: 'SourceGraphic', in2: 'field', scale: String(FIELD_SCALE),
          xChannelSelector: 'R', yChannelSelector: 'G', result: 'bent',
        }),
        svgElement('feGaussianBlur', { in: 'bent', stdDeviation: '0.8', result: 'soft-bend' }),
        svgElement('feComposite', { in: 'bent', in2: 'rim-map', operator: 'out', result: 'face' }),
        svgElement('feComposite', { in: 'soft-bend', in2: 'rim-map', operator: 'in', result: 'rim-blur' }),
        output,
      )
      defs.append(filter)
      return { option, label, bounds, filter, image, id, originalFilter: label.style.filter, active: false }
    }),
  )
  document.body.append(defs)

  return {
    remeasure(nextItems) {
      const rectangles = new Map(nextItems.map(item => [item.option, item.rect]))
      for (const item of labels) {
        const rect = rectangles.get(item.option)
        if (!rect) continue
        item.bounds = labelRect(item.option, item.label, rect)
        item.filter.setAttribute('width', String(item.bounds.width + 32))
        item.filter.setAttribute('height', String(item.bounds.height + 32))
      }
    },
    update(rect, selectedValue) {
      for (const item of labels) {
        const box = item.bounds
        const overlaps = item.option.dataset.liquidValue !== selectedValue &&
          rect.x < box.x + box.width && rect.x + rect.width > box.x &&
          rect.y < box.y + box.height && rect.y + rect.height > box.y
        if (overlaps) {
          item.image.setAttribute('x', String(rect.x - box.x))
          item.image.setAttribute('y', String(rect.y - box.y))
          item.image.setAttribute('width', String(rect.width))
          item.image.setAttribute('height', String(rect.height))
          if (!item.active) {
            item.label.style.filter = `url(#${item.id})`
            item.label.setAttribute('data-text-refracting', '')
          }
        } else if (item.active) {
          item.label.style.filter = item.originalFilter
          item.label.removeAttribute('data-text-refracting')
        }
        item.active = overlaps
      }
    },
    dispose() {
      for (const item of labels) {
        item.label.style.filter = item.originalFilter
        item.label.removeAttribute('data-text-refracting')
      }
      defs.remove()
    },
  }
}

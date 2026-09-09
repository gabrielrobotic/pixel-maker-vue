import type { Vec2 } from '@/shared/math/Vec2'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Size } from '../domain/Size'

export const useCameraStore = defineStore('camera', () => {
  const _position = ref<Vec2>({ x: 0, y: 0 })
  const _zoom = ref(18.15)
  const _viewport = ref<Size>({ width: 0, height: 0 })

  const position = computed({
    get: () => _position.value,
    set: (val) => {
      if (val.x !== _position.value.x || val.y !== _position.value.y) {
        _position.value = val
      }
    },
  })
  const zoom = computed({
    get: () => _zoom.value,
    set: (val) => {
      _zoom.value = Math.min(120, Math.max(0.01, val))
    },
  })
  const viewport = computed({
    get: () => _viewport.value,
    set: (val) => {
      if (val.width !== _viewport.value.width || val.height !== _viewport.value.height) {
        _viewport.value = val
      }
    },
  })
  const transform = computed(() => {
    const sx = (2 * _zoom.value) / _viewport.value.width
    const sy = (2 * _zoom.value) / _viewport.value.height

    const tx = -_position.value.x * sx
    const ty = -_position.value.y * sy

    return new Float32Array([sx, 0, 0, 0, sy, 0, tx, ty, 1])
  })

  function screenToWorld(screen: Vec2): Vec2 {
    return {
      x: (screen.x - _viewport.value.width / 2) / _zoom.value + _position.value.x,
      y: (_viewport.value.height / 2 - screen.y) / _zoom.value + _position.value.y,
    }
  }
  function moveByScreen(screenDelta: Vec2): void {
    position.value = {
      x: _position.value.x - screenDelta.x / _zoom.value,
      y: _position.value.y + screenDelta.y / _zoom.value,
    }
  }

  return {
    position,
    zoom,
    viewport,
    transform,
    screenToWorld,
    moveByScreen,
  }
})

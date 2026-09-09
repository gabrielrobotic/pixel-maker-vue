import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Color } from '../domain/Color'

export const useEditorStore = defineStore('editor', () => {
  const primaryColor = ref<Color>({ r: 0.5, g: 0.5, b: 0.5, a: 1.0 })
  const secundaryColor = ref<Color>({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 })

  return {
    primaryColor,
    secundaryColor,
  }
})

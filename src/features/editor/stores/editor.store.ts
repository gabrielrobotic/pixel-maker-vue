import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const gridSectionScale = ref(4)

  return {
    gridSectionScale,
  }
})

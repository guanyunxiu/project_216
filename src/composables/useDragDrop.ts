import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export function useDragDrop() {
  const gameStore = useGameStore()
  const isDragging = ref(false)

  function onDragStart(event: DragEvent, itemId: string) {
    isDragging.value = true
    gameStore.setDraggedItem(itemId)
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', itemId)
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  function onDragEnd() {
    isDragging.value = false
    gameStore.setDraggedItem(null)
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function onDragEnter(event: DragEvent) {
    event.preventDefault()
  }

  function onDrop(event: DragEvent): string | null {
    event.preventDefault()
    const itemId = event.dataTransfer?.getData('text/plain')
    isDragging.value = false
    gameStore.setDraggedItem(null)
    return itemId || null
  }

  return {
    isDragging,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,
    onDrop,
  }
}

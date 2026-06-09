<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useDragDrop } from '@/composables/useDragDrop'
import type { Item } from '@/types'
import {
  BookOpen, FileText, Wrench, Key, Scroll,
} from 'lucide-vue-next'

const props = defineProps<{
  item: Item
}>()

const gameStore = useGameStore()
const { onDragStart, onDragEnd } = useDragDrop()

const iconMap: Record<string, any> = {
  'book-open': BookOpen,
  'file-text': FileText,
  wrench: Wrench,
  key: Key,
  scroll: Scroll,
}

const iconComponent = computed(() => iconMap[props.item.icon] || Key)
const isDragged = computed(() => gameStore.draggedItemId === props.item.id)

function dragStart(event: DragEvent) {
  onDragStart(event, props.item.id)
}

function dragEnd() {
  onDragEnd()
}
</script>

<template>
  <div
    class="item-slot"
    :class="{ 'item-slot--dragged': isDragged }"
    draggable="true"
    @dragstart="dragStart"
    @dragend="dragEnd"
    :title="item.description"
  >
    <div class="item-icon">
      <component :is="iconComponent" :size="22" />
    </div>
    <div class="item-name">{{ item.name }}</div>
  </div>
</template>

<style scoped>
.item-slot {
  @apply w-14 h-14 rounded-lg flex flex-col items-center justify-center
    cursor-grab transition-all duration-200;
  border: 1px solid rgba(226, 183, 20, 0.25);
  background: rgba(226, 183, 20, 0.05);
}

.item-slot:hover {
  border-color: rgba(226, 183, 20, 0.6);
  background: rgba(226, 183, 20, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(226, 183, 20, 0.15);
}

.item-slot--dragged {
  opacity: 0.4;
  transform: scale(0.95);
}

.item-icon {
  @apply text-base;
  color: #e2b714;
}

.item-name {
  @apply text-center leading-tight mt-0.5;
  font-size: 8px;
  color: rgba(226, 183, 20, 0.7);
  font-family: 'Noto Sans', sans-serif;
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

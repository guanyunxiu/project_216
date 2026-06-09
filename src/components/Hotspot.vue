<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useItemStore } from '@/stores/itemStore'
import { useDragDrop } from '@/composables/useDragDrop'
import { useGameLogic } from '@/composables/useGameLogic'
import type { Hotspot } from '@/types'

const props = defineProps<{
  hotspot: Hotspot
}>()

const gameStore = useGameStore()
const itemStore = useItemStore()
const { onDragOver, onDragEnter, onDrop } = useDragDrop()
const { handleHotspotClick, handleItemDropOnHotspot } = useGameLogic()

const isHovered = ref(false)
const message = ref<string | null>(null)
const showItemGained = ref(false)
const gainedItemName = ref('')

const isSolved = computed(() =>
  props.hotspot.puzzleId ? gameStore.solvedPuzzles.includes(props.hotspot.puzzleId) : false
)

const isItemTaken = computed(() =>
  props.hotspot.itemId ? gameStore.hasItem(props.hotspot.itemId) : false
)

const isOpened = computed(() =>
  gameStore.openedHotspots.includes(props.hotspot.id)
)

const needsItem = computed(() =>
  props.hotspot.requiredItemId && !gameStore.hasItem(props.hotspot.requiredItemId)
)

const hotspotStyle = computed(() => ({
  left: `${props.hotspot.x}%`,
  top: `${props.hotspot.y}%`,
  width: `${props.hotspot.width}%`,
  height: `${props.hotspot.height}%`,
}))

const hotspotTypeIcon = computed(() => {
  switch (props.hotspot.type) {
    case 'item': return '📦'
    case 'door': return '🚪'
    case 'puzzle': return '🔐'
    case 'examine': return '👁'
    default: return '✦'
  }
})

function onClick() {
  const result = handleHotspotClick(props.hotspot)
  if (result) {
    showMessage(result)
    if (result.includes('获得') || result.includes('拿到')) {
      showItemGainedAnimation()
    }
  }
}

function onHotspotDrop(event: DragEvent) {
  const itemId = onDrop(event)
  if (itemId) {
    const result = handleItemDropOnHotspot(itemId, props.hotspot)
    if (result) {
      showMessage(result)
    }
  }
}

function showMessage(text: string) {
  message.value = text
  setTimeout(() => {
    message.value = null
  }, 3000)
}

function showItemGainedAnimation() {
  if (props.hotspot.itemId) {
    const item = itemStore.getItemById(props.hotspot.itemId)
    if (item) {
      gainedItemName.value = item.name
      showItemGained.value = true
      setTimeout(() => {
        showItemGained.value = false
      }, 2000)
    }
  }
}
</script>

<template>
  <div
    class="hotspot"
    :class="{
      'hotspot--solved': isSolved,
      'hotspot--taken': isItemTaken,
      'hotspot--needs-item': needsItem,
      'hotspot--hovered': isHovered,
    }"
    :style="hotspotStyle"
    @click="onClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @drop="onHotspotDrop"
  >
    <div class="hotspot-glow"></div>
    <div class="hotspot-icon">{{ hotspotTypeIcon }}</div>
    <div class="hotspot-label">{{ hotspot.label }}</div>

    <Transition name="fade">
      <div v-if="isSolved" class="hotspot-solved-badge">✓</div>
    </Transition>

    <Transition name="fade">
      <div v-if="needsItem" class="hotspot-locked-badge">🔒</div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="message" class="hotspot-message">{{ message }}</div>
    </Transition>

    <Transition name="item-gained">
      <div v-if="showItemGained" class="item-gained-toast">
        + {{ gainedItemName }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hotspot {
  @apply absolute cursor-pointer flex flex-col items-center justify-center
    rounded-lg transition-all duration-300;
  border: 1px solid rgba(226, 183, 20, 0.2);
  background: rgba(226, 183, 20, 0.03);
  z-index: 5;
}

.hotspot:hover {
  border-color: rgba(226, 183, 20, 0.6);
  background: rgba(226, 183, 20, 0.08);
  transform: scale(1.02);
}

.hotspot--solved {
  border-color: rgba(46, 204, 113, 0.4);
  background: rgba(46, 204, 113, 0.05);
}

.hotspot--taken {
  opacity: 0.5;
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.hotspot--needs-item {
  border-color: rgba(192, 57, 43, 0.3);
}

.hotspot--hovered .hotspot-glow {
  opacity: 1;
}

.hotspot-glow {
  @apply absolute inset-0 rounded-lg pointer-events-none;
  box-shadow: inset 0 0 30px rgba(226, 183, 20, 0.1), 0 0 15px rgba(226, 183, 20, 0.05);
  opacity: 0;
  transition: opacity 0.3s;
}

.hotspot-icon {
  @apply text-2xl mb-1;
  filter: drop-shadow(0 0 6px rgba(226, 183, 20, 0.4));
}

.hotspot-label {
  @apply text-xs tracking-wider text-center;
  font-family: 'Cinzel', serif;
  color: rgba(226, 183, 20, 0.7);
  text-shadow: 0 0 10px rgba(226, 183, 20, 0.2);
}

.hotspot-solved-badge {
  @apply absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs;
  background: #2ecc71;
  color: #fff;
}

.hotspot-locked-badge {
  @apply absolute -top-2 -right-2 text-sm;
  filter: drop-shadow(0 0 4px rgba(192, 57, 43, 0.5));
}

.hotspot-message {
  @apply absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
    px-4 py-2 rounded-lg text-xs;
  background: rgba(0, 0, 0, 0.9);
  color: #e2b714;
  border: 1px solid rgba(226, 183, 20, 0.3);
  z-index: 20;
}

.item-gained-toast {
  @apply absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
    px-3 py-1 rounded text-sm font-bold;
  color: #2ecc71;
  text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.item-gained-enter-active {
  transition: all 0.5s;
}
.item-gained-leave-active {
  transition: all 0.5s;
}
.item-gained-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}
.item-gained-leave-to {
  opacity: 0;
  transform: translate(-50%, -30px);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useItemStore } from '@/stores/itemStore'
import ItemSlot from './ItemSlot.vue'

const gameStore = useGameStore()
const itemStore = useItemStore()

const items = computed(() => itemStore.getItemsByIds(gameStore.inventory))
const maxSlots = 8
const emptySlots = computed(() => Math.max(0, maxSlots - items.value.length))
</script>

<template>
  <div class="item-bar">
    <div class="item-bar-inner">
      <div class="item-bar-title">
        <span class="title-icon">🎒</span>
        <span class="title-text">道具栏</span>
      </div>
      <div class="item-bar-slots">
        <ItemSlot
          v-for="item in items"
          :key="item.id"
          :item="item"
        />
        <div
          v-for="n in emptySlots"
          :key="'empty-' + n"
          class="item-slot item-slot--empty"
        >
          <span class="empty-icon">+</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-bar {
  @apply fixed bottom-0 left-0 right-0 z-30;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.85) 0%, rgba(13, 13, 20, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(226, 183, 20, 0.15);
}

.item-bar-inner {
  @apply flex items-center gap-4 px-6 py-3 max-w-5xl mx-auto;
}

.item-bar-title {
  @apply flex items-center gap-2 shrink-0;
}

.title-icon {
  @apply text-lg;
}

.title-text {
  @apply text-xs tracking-widest uppercase;
  font-family: 'Cinzel', serif;
  color: rgba(226, 183, 20, 0.6);
}

.item-bar-slots {
  @apply flex items-center gap-2 flex-1 justify-center;
}

.item-slot--empty {
  @apply w-14 h-14 rounded-lg border border-dashed flex items-center justify-center;
  border-color: rgba(226, 183, 20, 0.15);
  background: rgba(226, 183, 20, 0.02);
}

.empty-icon {
  @apply text-lg;
  color: rgba(226, 183, 20, 0.2);
}
</style>

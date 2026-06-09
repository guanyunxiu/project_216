<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import Hotspot from './Hotspot.vue'

const gameStore = useGameStore()

const roomScenes: Record<string, { bg: string; elements: string[] }> = {
  study: {
    bg: 'linear-gradient(180deg, #0d1117 0%, #1a1a2e 30%, #16213e 70%, #1a1a2e 100%)',
    elements: ['bookshelf', 'desk', 'door'],
  },
  basement: {
    bg: 'linear-gradient(180deg, #0a0e14 0%, #111827 40%, #1f2937 80%, #111827 100%)',
    elements: ['table', 'toolbox', 'door'],
  },
  'secret-room': {
    bg: 'linear-gradient(180deg, #0d0d0d 0%, #1a0a0a 40%, #2d1515 80%, #1a0a0a 100%)',
    elements: ['safe', 'lock'],
  },
}

const currentScene = computed(() => roomScenes[gameStore.currentRoomId] || roomScenes.study)
const hotspots = computed(() => gameStore.currentHotspots)
</script>

<template>
  <div class="game-scene" :style="{ background: currentScene.bg }">
    <div class="scene-overlay"></div>

    <div class="scene-room-name">
      <span class="room-name-text">{{ gameStore.currentRoom.name }}</span>
    </div>

    <div class="scene-description">
      <p>{{ gameStore.currentRoom.description }}</p>
    </div>

    <div class="scene-content">
      <Hotspot
        v-for="hotspot in hotspots"
        :key="hotspot.id"
        :hotspot="hotspot"
      />
    </div>

    <div class="scene-ambience">
      <div class="dust-particle" v-for="n in 20" :key="n" :style="{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${4 + Math.random() * 6}s`,
      }"></div>
    </div>
  </div>
</template>

<style scoped>
.game-scene {
  @apply relative w-full h-full overflow-hidden select-none;
  transition: background 0.8s ease;
}

.scene-overlay {
  @apply absolute inset-0 pointer-events-none;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(226, 183, 20, 0.03) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(192, 57, 43, 0.02) 0%, transparent 50%);
}

.scene-room-name {
  @apply absolute top-4 left-4 z-10;
}

.room-name-text {
  @apply text-lg tracking-widest;
  font-family: 'Cinzel', serif;
  color: #e2b714;
  text-shadow: 0 0 20px rgba(226, 183, 20, 0.3);
  letter-spacing: 0.3em;
}

.scene-description {
  @apply absolute bottom-24 left-4 right-4 z-10;
}

.scene-description p {
  @apply text-sm leading-relaxed;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Noto Sans', sans-serif;
}

.scene-content {
  @apply absolute inset-0;
}

.scene-ambience {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
}

.dust-particle {
  @apply absolute w-1 h-1 rounded-full;
  background: rgba(226, 183, 20, 0.15);
  animation: float-dust linear infinite;
}

@keyframes float-dust {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(30px);
    opacity: 0;
  }
}
</style>

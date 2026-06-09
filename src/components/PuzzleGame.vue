<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLogic } from '@/composables/useGameLogic'
import { X } from 'lucide-vue-next'

const gameStore = useGameStore()
const { completePuzzle } = useGameLogic()

interface PuzzlePiece {
  id: number
  currentIndex: number
  correctIndex: number
  label: string
}

const pieces = ref<PuzzlePiece[]>([])
const isComplete = ref(false)
const dragFromIndex = ref<number | null>(null)

const puzzleId = computed(() => gameStore.activePuzzleId)

const puzzleImageSeed = computed(() => {
  if (puzzleId.value === 'basement-puzzle') return 'escape-key'
  return 'puzzle'
})

onMounted(() => {
  initPuzzle()
})

function countInversions(arr: number[]): number {
  let inversions = 0
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++
    }
  }
  return inversions
}

function isSolvable(arr: number[]): boolean {
  return countInversions(arr) % 2 === 0
}

function initPuzzle() {
  const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  let shuffled: number[]
  do {
    shuffled = [...indices]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  } while (!isSolvable(shuffled) || shuffled.every((val, idx) => val === idx))

  pieces.value = shuffled.map((correctIdx, i) => ({
    id: correctIdx,
    currentIndex: i,
    correctIndex: correctIdx,
    label: `${correctIdx + 1}`,
  }))

  isComplete.value = false
}

function getPieceStyle(piece: PuzzlePiece) {
  const row = Math.floor(piece.id / 3)
  const col = piece.id % 3
  return {
    backgroundImage: `url(https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20golden%20key%20on%20dark%20velvet%20background%20mysterious%20atmosphere&image_size=square_hd)`,
    backgroundPosition: `${col * 50}% ${row * 50}%`,
    backgroundSize: '300% 300%',
  }
}

function onDragStart(event: DragEvent, index: number) {
  dragFromIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault()
  const fromIndex = dragFromIndex.value
  if (fromIndex === null || fromIndex === targetIndex) return

  const newPieces = [...pieces.value]
  const temp = newPieces[fromIndex]
  newPieces[fromIndex] = newPieces[targetIndex]
  newPieces[targetIndex] = temp

  newPieces[fromIndex].currentIndex = fromIndex
  newPieces[targetIndex].currentIndex = targetIndex

  pieces.value = newPieces
  dragFromIndex.value = null

  checkCompletion()
}

function onDragEnd() {
  dragFromIndex.value = null
}

function checkCompletion() {
  const complete = pieces.value.every(p => p.currentIndex === p.correctIndex)
  if (complete && !isComplete.value) {
    isComplete.value = true
    setTimeout(() => {
      if (puzzleId.value) {
        completePuzzle(puzzleId.value)
      }
      setTimeout(() => {
        gameStore.closeModal()
      }, 1500)
    }, 800)
  }
}

function shufflePieces() {
  const newPieces = [...pieces.value]
  for (let i = newPieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]]
  }
  newPieces.forEach((p, i) => {
    p.currentIndex = i
  })
  pieces.value = newPieces
  isComplete.value = false
}

function isCorrectPosition(index: number): boolean {
  const piece = pieces.value[index]
  return piece.currentIndex === piece.correctIndex
}

function close() {
  gameStore.closeModal()
}
</script>

<template>
  <div class="puzzle-overlay" @click.self="close">
    <div class="puzzle-game" :class="{ 'puzzle-game--complete': isComplete }">
      <button class="close-btn" @click="close">
        <X :size="18" />
      </button>

      <div class="puzzle-header">
        <div class="puzzle-icon">🧩</div>
        <h3 class="puzzle-title">拼图挑战</h3>
        <p class="puzzle-subtitle">拖拽碎片还原图片，获得密室钥匙</p>
      </div>

      <div class="puzzle-grid">
        <div
          v-for="(piece, index) in pieces"
          :key="piece.id"
          class="puzzle-piece"
          :class="{
            'puzzle-piece--correct': isCorrectPosition(index),
            'puzzle-piece--dragging': dragFromIndex === index,
          }"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <div class="piece-image" :style="getPieceStyle(piece)"></div>
          <div class="piece-number">{{ piece.label }}</div>
        </div>
      </div>

      <div class="puzzle-actions">
        <button class="action-btn action-btn--shuffle" @click="shufflePieces">重新打乱</button>
      </div>

      <Transition name="fade">
        <div v-if="isComplete" class="puzzle-complete">
          <div class="complete-text">拼图完成！获得密室钥匙 🗝️</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.puzzle-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.puzzle-game {
  @apply relative w-96 rounded-2xl p-6;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(226, 183, 20, 0.2);
  box-shadow: 0 0 60px rgba(226, 183, 20, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5);
}

.puzzle-game--complete {
  border-color: rgba(46, 204, 113, 0.6);
  box-shadow: 0 0 80px rgba(46, 204, 113, 0.2);
}

.close-btn {
  @apply absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center;
  color: rgba(226, 183, 20, 0.5);
  transition: all 0.2s;
}
.close-btn:hover {
  color: #e2b714;
  background: rgba(226, 183, 20, 0.1);
}

.puzzle-header {
  @apply text-center mb-5;
}

.puzzle-icon {
  @apply text-4xl mb-2;
}

.puzzle-title {
  @apply text-xl tracking-wider mb-1;
  font-family: 'Cinzel', serif;
  color: #e2b714;
}

.puzzle-subtitle {
  @apply text-xs;
  color: rgba(255, 255, 255, 0.4);
}

.puzzle-grid {
  @apply grid grid-cols-3 gap-1.5 mb-5;
}

.puzzle-piece {
  @apply aspect-square rounded-lg cursor-grab relative overflow-hidden;
  border: 2px solid rgba(226, 183, 20, 0.15);
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.puzzle-piece:hover {
  border-color: rgba(226, 183, 20, 0.4);
  transform: scale(1.03);
}

.puzzle-piece--correct {
  border-color: rgba(46, 204, 113, 0.4);
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.1);
}

.puzzle-piece--dragging {
  opacity: 0.4;
  transform: scale(0.95);
}

.piece-image {
  @apply absolute inset-0;
}

.piece-number {
  @apply absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold;
  background: rgba(0, 0, 0, 0.6);
  color: rgba(226, 183, 20, 0.6);
  font-family: 'Cinzel', serif;
}

.puzzle-actions {
  @apply flex justify-center;
}

.action-btn {
  @apply px-6 py-2 rounded-lg text-sm tracking-wider transition-all duration-200;
  font-family: 'Cinzel', serif;
}

.action-btn--shuffle {
  border: 1px solid rgba(226, 183, 20, 0.25);
  color: rgba(226, 183, 20, 0.7);
  background: rgba(226, 183, 20, 0.05);
}
.action-btn--shuffle:hover {
  border-color: rgba(226, 183, 20, 0.5);
  background: rgba(226, 183, 20, 0.12);
}

.puzzle-complete {
  @apply absolute inset-0 flex items-center justify-center rounded-2xl;
  background: rgba(46, 204, 113, 0.15);
  backdrop-filter: blur(2px);
}

.complete-text {
  @apply text-xl font-bold;
  font-family: 'Cinzel', serif;
  color: #2ecc71;
  text-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

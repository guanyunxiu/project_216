<script setup lang="ts">
import { computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from '@/composables/useTimer'
import GameScene from '@/components/GameScene.vue'
import ItemBar from '@/components/ItemBar.vue'
import PasswordLock from '@/components/PasswordLock.vue'
import PuzzleGame from '@/components/PuzzleGame.vue'
import { Clock, Lightbulb, Pause, Play, RotateCcw } from 'lucide-vue-next'

const gameStore = useGameStore()
const timerStore = useTimerStore()
const { startTimer, togglePause } = useTimer()

const isIdle = computed(() => gameStore.status === 'idle')
const isPlaying = computed(() => gameStore.status === 'playing')
const isPaused = computed(() => gameStore.status === 'paused')
const isWon = computed(() => gameStore.status === 'won')
const isLost = computed(() => gameStore.status === 'lost')
const showPasswordModal = computed(() => gameStore.activeModal === 'password')
const showPuzzleModal = computed(() => gameStore.activeModal === 'puzzle')
const showHintPanel = computed(() => gameStore.activeModal === 'hint')

const currentHintPuzzleId = computed(() => gameStore.activeHintPuzzleId)
const hintSteps = computed(() => {
  if (!currentHintPuzzleId.value) return []
  return gameStore.getHintsForPuzzle(currentHintPuzzleId.value)
})
const hintCount = computed(() => {
  if (!currentHintPuzzleId.value) return 0
  return gameStore.getHintCount(currentHintPuzzleId.value)
})

const timerColorClass = computed(() => {
  if (timerStore.isCritical) return 'timer-critical'
  if (timerStore.isLow) return 'timer-low'
  return 'timer-normal'
})

const activePuzzleIdForHint = computed(() => {
  if (gameStore.activePuzzleId) return gameStore.activePuzzleId
  const puzzles = gameStore.currentPuzzles
  const unsolved = puzzles.find(p => !gameStore.solvedPuzzles.includes(p.id))
  return unsolved?.id || null
})

function startGame() {
  gameStore.startGame()
  startTimer()
}

function restartGame() {
  timerStore.reset()
  gameStore.startGame()
  startTimer()
}

function requestHint() {
  const puzzleId = activePuzzleIdForHint.value
  if (puzzleId) {
    gameStore.openHintPanel(puzzleId)
  }
}

function revealNextHint() {
  if (currentHintPuzzleId.value) {
    gameStore.getHintForPuzzle(currentHintPuzzleId.value)
  }
}

function closeHintPanel() {
  gameStore.closeHintPanel()
}

watch(isWon, (won) => {
  if (won) timerStore.stop()
})

watch(isLost, (lost) => {
  if (lost) timerStore.stop()
})
</script>

<template>
  <div class="game-container">
    <Transition name="fade">
      <div v-if="isIdle" class="screen start-screen">
        <div class="start-content">
          <div class="start-ambience">
            <div class="particle" v-for="n in 30" :key="n" :style="{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }"></div>
          </div>
          <div class="start-icon">🏚️</div>
          <h1 class="start-title">密室逃脱</h1>
          <p class="start-subtitle">ESCAPE ROOM</p>
          <div class="start-divider"></div>
          <p class="start-desc">
            你被困在一间神秘的建筑中，<br />
            需要通过寻找线索、解开谜题来逃出生天。<br />
            限时30分钟，你能成功逃脱吗？
          </p>
          <div class="start-features">
            <div class="feature-item"><span class="feature-icon">🔍</span> 探索房间</div>
            <div class="feature-item"><span class="feature-icon">🧩</span> 解开谜题</div>
            <div class="feature-item"><span class="feature-icon">🎒</span> 收集道具</div>
            <div class="feature-item"><span class="feature-icon">⏱️</span> 限时挑战</div>
          </div>
          <button class="start-btn" @click="startGame">
            <span>开始游戏</span>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isWon" class="screen end-screen">
        <div class="end-content">
          <div class="end-icon">🎉</div>
          <h1 class="end-title end-title--win">逃脱成功！</h1>
          <p class="end-subtitle">你成功逃出了密室</p>
          <div class="end-stats">
            <div class="stat-item">
              <span class="stat-label">用时</span>
              <span class="stat-value">{{ gameStore.elapsedTime }}秒</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">提示使用</span>
              <span class="stat-value">{{ Object.values(gameStore.hintStepsUsed).reduce((a, b) => a + b, 0) }}次</span>
            </div>
          </div>
          <button class="end-btn end-btn--win" @click="restartGame">
            <RotateCcw :size="18" />
            <span>再玩一次</span>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isLost" class="screen end-screen">
        <div class="end-content">
          <div class="end-icon">💀</div>
          <h1 class="end-title end-title--lose">时间耗尽！</h1>
          <p class="end-subtitle">你未能在限定时间内逃出密室</p>
          <button class="end-btn end-btn--lose" @click="restartGame">
            <RotateCcw :size="18" />
            <span>重新挑战</span>
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="isPlaying || isPaused" class="game-area">
      <div class="game-hud">
        <div class="hud-left">
          <div class="room-indicator">
            <span class="room-dot"></span>
            <span class="room-name">{{ gameStore.currentRoom.name }}</span>
          </div>
        </div>
        <div class="hud-center">
          <div class="timer-display" :class="timerColorClass">
            <Clock :size="16" />
            <span class="timer-text">{{ timerStore.displayTime }}</span>
            <div class="timer-bar">
              <div class="timer-bar-fill" :style="{ width: `${timerStore.progress * 100}%` }"></div>
            </div>
          </div>
        </div>
        <div class="hud-right">
          <button class="hud-btn" @click="requestHint" title="提示">
            <Lightbulb :size="18" />
          </button>
          <button class="hud-btn" @click="togglePause" :title="isPaused ? '继续' : '暂停'">
            <Pause v-if="isPlaying" :size="18" />
            <Play v-else :size="18" />
          </button>
        </div>
      </div>

      <GameScene />

      <ItemBar />
    </div>

    <Transition name="fade">
      <div v-if="isPaused" class="pause-overlay" @click="togglePause">
        <div class="pause-content" @click.stop>
          <div class="pause-icon">⏸️</div>
          <h2 class="pause-title">游戏暂停</h2>
          <button class="pause-btn" @click="togglePause">
            <Play :size="18" />
            <span>继续游戏</span>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <PasswordLock v-if="showPasswordModal" />
    </Transition>

    <Transition name="fade">
      <PuzzleGame v-if="showPuzzleModal" />
    </Transition>

    <Transition name="slide-up">
      <div v-if="showHintPanel" class="hint-overlay" @click="closeHintPanel">
        <div class="hint-panel" @click.stop>
          <div class="hint-header">
            <div class="hint-header-icon">💡</div>
            <h3 class="hint-header-title">提示线索</h3>
            <span class="hint-counter">{{ hintCount }} / 3</span>
            <button class="hint-close" @click="closeHintPanel">✕</button>
          </div>
          <div class="hint-body">
            <div v-if="hintSteps.length === 0" class="hint-empty">
              点击下方按钮获取提示
            </div>
            <TransitionGroup name="hint-list">
              <div v-for="hint in hintSteps" :key="hint.step" class="hint-item">
                <div class="hint-step">线索 {{ hint.step }}</div>
                <div class="hint-text">{{ hint.text }}</div>
              </div>
            </TransitionGroup>
          </div>
          <div class="hint-footer">
            <button
              class="hint-reveal-btn"
              :disabled="hintCount >= 3"
              @click="revealNextHint"
            >
              {{ hintCount >= 3 ? '已用完提示' : '获取下一条提示' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game-container {
  @apply relative w-full h-full overflow-hidden;
  background: #0a0a0f;
}

.screen {
  @apply absolute inset-0 z-40 flex items-center justify-center;
}

.start-screen {
  background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0d1117 100%);
}

.start-content {
  @apply relative text-center z-10 px-6;
}

.start-ambience {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
}

.particle {
  @apply absolute w-1 h-1 rounded-full;
  background: rgba(226, 183, 20, 0.2);
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% {
    transform: translateY(-80px) translateX(20px);
    opacity: 0;
  }
}

.start-icon {
  @apply text-7xl mb-6;
  filter: drop-shadow(0 0 30px rgba(226, 183, 20, 0.3));
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(226, 183, 20, 0.2)); }
  50% { filter: drop-shadow(0 0 40px rgba(226, 183, 20, 0.5)); }
}

.start-title {
  @apply text-5xl font-bold tracking-widest mb-2;
  font-family: 'Cinzel', serif;
  color: #e2b714;
  text-shadow: 0 0 40px rgba(226, 183, 20, 0.3);
}

.start-subtitle {
  @apply text-sm tracking-[0.5em] mb-6;
  font-family: 'Cinzel', serif;
  color: rgba(226, 183, 20, 0.4);
}

.start-divider {
  @apply w-24 h-px mx-auto mb-6;
  background: linear-gradient(90deg, transparent, rgba(226, 183, 20, 0.5), transparent);
}

.start-desc {
  @apply text-sm leading-relaxed mb-8 max-w-sm mx-auto;
  color: rgba(255, 255, 255, 0.5);
}

.start-features {
  @apply flex gap-6 justify-center mb-10;
}

.feature-item {
  @apply flex items-center gap-1.5 text-xs;
  color: rgba(226, 183, 20, 0.6);
}

.feature-icon {
  @apply text-base;
}

.start-btn {
  @apply px-10 py-3.5 rounded-xl text-base font-bold tracking-wider
    transition-all duration-300;
  font-family: 'Cinzel', serif;
  background: linear-gradient(135deg, rgba(226, 183, 20, 0.15) 0%, rgba(226, 183, 20, 0.08) 100%);
  border: 1px solid rgba(226, 183, 20, 0.35);
  color: #e2b714;
}

.start-btn:hover {
  background: linear-gradient(135deg, rgba(226, 183, 20, 0.25) 0%, rgba(226, 183, 20, 0.12) 100%);
  border-color: rgba(226, 183, 20, 0.6);
  box-shadow: 0 0 40px rgba(226, 183, 20, 0.2);
  transform: translateY(-2px);
}

.start-btn:active {
  transform: translateY(0);
}

.end-screen {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
}

.end-content {
  @apply text-center;
}

.end-icon {
  @apply text-7xl mb-6;
}

.end-title {
  @apply text-4xl font-bold tracking-wider mb-3;
  font-family: 'Cinzel', serif;
}

.end-title--win {
  color: #2ecc71;
  text-shadow: 0 0 30px rgba(46, 204, 113, 0.4);
}

.end-title--lose {
  color: #c0392b;
  text-shadow: 0 0 30px rgba(192, 57, 43, 0.4);
}

.end-subtitle {
  @apply text-sm mb-8;
  color: rgba(255, 255, 255, 0.5);
}

.end-stats {
  @apply flex gap-8 justify-center mb-8;
}

.stat-item {
  @apply flex flex-col items-center;
}

.stat-label {
  @apply text-xs mb-1;
  color: rgba(255, 255, 255, 0.4);
}

.stat-value {
  @apply text-lg font-bold;
  font-family: 'Cinzel', serif;
  color: #e2b714;
}

.end-btn {
  @apply inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold
    tracking-wider transition-all duration-300;
  font-family: 'Cinzel', serif;
}

.end-btn--win {
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.08);
}

.end-btn--win:hover {
  border-color: rgba(46, 204, 113, 0.6);
  background: rgba(46, 204, 113, 0.15);
  box-shadow: 0 0 30px rgba(46, 204, 113, 0.15);
}

.end-btn--lose {
  border: 1px solid rgba(226, 183, 20, 0.3);
  color: #e2b714;
  background: rgba(226, 183, 20, 0.08);
}

.end-btn--lose:hover {
  border-color: rgba(226, 183, 20, 0.6);
  background: rgba(226, 183, 20, 0.15);
  box-shadow: 0 0 30px rgba(226, 183, 20, 0.15);
}

.game-area {
  @apply relative w-full h-full;
}

.game-hud {
  @apply absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3;
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.9) 0%, transparent 100%);
}

.hud-left,
.hud-right {
  @apply flex items-center gap-3;
}

.room-indicator {
  @apply flex items-center gap-2;
}

.room-dot {
  @apply w-2 h-2 rounded-full;
  background: #e2b714;
  box-shadow: 0 0 8px rgba(226, 183, 20, 0.5);
}

.room-name {
  @apply text-xs tracking-wider;
  font-family: 'Cinzel', serif;
  color: rgba(226, 183, 20, 0.8);
}

.timer-display {
  @apply flex items-center gap-2;
}

.timer-text {
  @apply text-sm font-bold tracking-wider;
  font-family: 'Cinzel', serif;
}

.timer-normal .timer-text {
  color: rgba(226, 183, 20, 0.8);
}

.timer-low .timer-text {
  color: #e67e22;
}

.timer-critical .timer-text {
  color: #c0392b;
  animation: blink-text 1s infinite;
}

@keyframes blink-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.timer-bar {
  @apply w-24 h-1 rounded-full overflow-hidden;
  background: rgba(255, 255, 255, 0.1);
}

.timer-bar-fill {
  @apply h-full rounded-full transition-all duration-1000;
}

.timer-normal .timer-bar-fill {
  background: linear-gradient(90deg, #e2b714, #f39c12);
}

.timer-low .timer-bar-fill {
  background: linear-gradient(90deg, #e67e22, #d35400);
}

.timer-critical .timer-bar-fill {
  background: linear-gradient(90deg, #c0392b, #e74c3c);
}

.hud-btn {
  @apply w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200;
  color: rgba(226, 183, 20, 0.5);
  border: 1px solid rgba(226, 183, 20, 0.15);
  background: rgba(226, 183, 20, 0.03);
}

.hud-btn:hover {
  color: #e2b714;
  border-color: rgba(226, 183, 20, 0.4);
  background: rgba(226, 183, 20, 0.08);
}

.pause-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
}

.pause-content {
  @apply text-center;
}

.pause-icon {
  @apply text-5xl mb-4;
}

.pause-title {
  @apply text-2xl tracking-wider mb-6;
  font-family: 'Cinzel', serif;
  color: #e2b714;
}

.pause-btn {
  @apply inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold
    tracking-wider transition-all duration-300;
  font-family: 'Cinzel', serif;
  border: 1px solid rgba(226, 183, 20, 0.3);
  color: #e2b714;
  background: rgba(226, 183, 20, 0.08);
}

.pause-btn:hover {
  border-color: rgba(226, 183, 20, 0.6);
  background: rgba(226, 183, 20, 0.15);
}

.hint-overlay {
  @apply fixed inset-0 z-50 flex items-end justify-center pb-28;
  background: rgba(0, 0, 0, 0.3);
}

.hint-panel {
  @apply w-full max-w-md rounded-2xl overflow-hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(226, 183, 20, 0.2);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(226, 183, 20, 0.08);
}

.hint-header {
  @apply flex items-center gap-2 px-5 py-3;
  border-bottom: 1px solid rgba(226, 183, 20, 0.1);
}

.hint-header-icon {
  @apply text-lg;
}

.hint-header-title {
  @apply text-sm tracking-wider flex-1;
  font-family: 'Cinzel', serif;
  color: #e2b714;
}

.hint-counter {
  @apply text-xs;
  color: rgba(226, 183, 20, 0.5);
}

.hint-close {
  @apply w-7 h-7 rounded-full flex items-center justify-center
    transition-all duration-200;
  color: rgba(226, 183, 20, 0.4);
  background: transparent;
}

.hint-close:hover {
  color: #e2b714;
  background: rgba(226, 183, 20, 0.1);
}

.hint-body {
  @apply px-5 py-4 max-h-60 overflow-y-auto;
}

.hint-empty {
  @apply text-center py-6 text-sm;
  color: rgba(255, 255, 255, 0.3);
}

.hint-item {
  @apply mb-4;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-step {
  @apply text-xs tracking-wider mb-1;
  font-family: 'Cinzel', serif;
  color: rgba(226, 183, 20, 0.5);
}

.hint-text {
  @apply text-sm leading-relaxed;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  background: rgba(226, 183, 20, 0.04);
  border-left: 2px solid rgba(226, 183, 20, 0.3);
  border-radius: 0 6px 6px 0;
}

.hint-footer {
  @apply px-5 py-3;
  border-top: 1px solid rgba(226, 183, 20, 0.1);
}

.hint-reveal-btn {
  @apply w-full py-2 rounded-lg text-sm tracking-wider transition-all duration-200;
  font-family: 'Cinzel', serif;
  border: 1px solid rgba(226, 183, 20, 0.25);
  color: rgba(226, 183, 20, 0.8);
  background: rgba(226, 183, 20, 0.05);
}

.hint-reveal-btn:hover:not(:disabled) {
  border-color: rgba(226, 183, 20, 0.5);
  background: rgba(226, 183, 20, 0.12);
}

.hint-reveal-btn:disabled {
  @apply opacity-40 cursor-not-allowed;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

.hint-list-enter-active {
  transition: all 0.4s;
}

.hint-list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>

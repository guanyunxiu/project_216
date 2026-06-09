<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLogic } from '@/composables/useGameLogic'
import { X } from 'lucide-vue-next'

const gameStore = useGameStore()
const { checkPassword } = useGameLogic()

const digits = ref<string[]>(['', '', '', ''])
const activeIndex = ref(0)
const error = ref(false)
const success = ref(false)

const puzzle = computed(() =>
  gameStore.activePuzzleId ? gameStore.getPuzzleById(gameStore.activePuzzleId) : null
)

const puzzleTitle = computed(() => {
  if (!puzzle.value) return '密码锁'
  if (puzzle.value.id === 'study-password') return '书房密码锁'
  if (puzzle.value.id === 'secret-password') return '最终密码锁'
  return '密码锁'
})

function inputDigit(d: string) {
  if (activeIndex.value >= 4) return
  digits.value[activeIndex.value] = d
  error.value = false
  if (activeIndex.value < 3) {
    activeIndex.value++
  }
}

function deleteDigit() {
  if (activeIndex.value >= 0) {
    digits.value[activeIndex.value] = ''
    if (activeIndex.value > 0) activeIndex.value--
  }
}

function clearAll() {
  digits.value = ['', '', '', '']
  activeIndex.value = 0
  error.value = false
}

function submit() {
  const input = digits.value.join('')
  if (input.length < 4) return
  if (gameStore.activePuzzleId && checkPassword(gameStore.activePuzzleId, input)) {
    success.value = true
    setTimeout(() => {
      success.value = false
      gameStore.closeModal()
    }, 1500)
  } else {
    error.value = true
    setTimeout(() => {
      error.value = false
      clearAll()
    }, 1000)
  }
}

function close() {
  gameStore.closeModal()
}

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
</script>

<template>
  <div class="password-lock-overlay" @click.self="close">
    <div class="password-lock" :class="{ 'password-lock--error': error, 'password-lock--success': success }">
      <button class="close-btn" @click="close">
        <X :size="18" />
      </button>

      <div class="lock-header">
        <div class="lock-icon">🔐</div>
        <h3 class="lock-title">{{ puzzleTitle }}</h3>
        <p class="lock-subtitle">输入4位数字密码</p>
      </div>

      <div class="digit-display">
        <div
          v-for="(digit, i) in digits"
          :key="i"
          class="digit-slot"
          :class="{
            'digit-slot--active': i === activeIndex,
            'digit-slot--filled': digit !== '',
          }"
        >
          <span class="digit-value">{{ digit }}</span>
          <div v-if="i === activeIndex && digit === ''" class="digit-cursor"></div>
        </div>
      </div>

      <div class="keypad">
        <button
          v-for="(key, i) in keypad"
          :key="i"
          class="key-btn"
          :class="{
            'key-btn--empty': key === '',
            'key-btn--delete': key === 'del',
          }"
          @click="key === 'del' ? deleteDigit() : (key !== '' && inputDigit(key))"
          :disabled="key === ''"
        >
          {{ key === 'del' ? '⌫' : key }}
        </button>
      </div>

      <div class="lock-actions">
        <button class="action-btn action-btn--clear" @click="clearAll">清除</button>
        <button class="action-btn action-btn--submit" @click="submit">确认</button>
      </div>

      <Transition name="fade">
        <div v-if="error" class="lock-feedback lock-feedback--error">密码错误！</div>
      </Transition>
      <Transition name="fade">
        <div v-if="success" class="lock-feedback lock-feedback--success">密码正确！</div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.password-lock-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.password-lock {
  @apply relative w-80 rounded-2xl p-6;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(226, 183, 20, 0.2);
  box-shadow: 0 0 60px rgba(226, 183, 20, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5);
}

.password-lock--error {
  animation: shake 0.5s;
  border-color: rgba(192, 57, 43, 0.6);
}

.password-lock--success {
  border-color: rgba(46, 204, 113, 0.6);
  box-shadow: 0 0 60px rgba(46, 204, 113, 0.15);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
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

.lock-header {
  @apply text-center mb-6;
}

.lock-icon {
  @apply text-4xl mb-2;
}

.lock-title {
  @apply text-xl tracking-wider mb-1;
  font-family: 'Cinzel', serif;
  color: #e2b714;
}

.lock-subtitle {
  @apply text-xs;
  color: rgba(255, 255, 255, 0.4);
}

.digit-display {
  @apply flex items-center justify-center gap-3 mb-6;
}

.digit-slot {
  @apply w-14 h-16 rounded-lg flex items-center justify-center;
  border: 2px solid rgba(226, 183, 20, 0.2);
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.digit-slot--active {
  border-color: rgba(226, 183, 20, 0.6);
  box-shadow: 0 0 15px rgba(226, 183, 20, 0.15);
}

.digit-slot--filled {
  border-color: rgba(226, 183, 20, 0.4);
}

.digit-value {
  @apply text-2xl font-bold;
  font-family: 'Cinzel', serif;
  color: #e2b714;
}

.digit-cursor {
  @apply w-0.5 h-8;
  background: #e2b714;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.keypad {
  @apply grid grid-cols-3 gap-2 mb-4;
}

.key-btn {
  @apply h-12 rounded-lg text-lg font-bold transition-all duration-200;
  background: rgba(226, 183, 20, 0.08);
  border: 1px solid rgba(226, 183, 20, 0.15);
  color: #e2b714;
  font-family: 'Cinzel', serif;
}

.key-btn:hover:not(:disabled) {
  background: rgba(226, 183, 20, 0.15);
  border-color: rgba(226, 183, 20, 0.4);
}

.key-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.key-btn--empty {
  @apply pointer-events-none opacity-0;
}

.key-btn--delete {
  color: rgba(192, 57, 43, 0.8);
  border-color: rgba(192, 57, 43, 0.2);
}

.lock-actions {
  @apply flex gap-3;
}

.action-btn {
  @apply flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-all duration-200;
  font-family: 'Cinzel', serif;
}

.action-btn--clear {
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
}
.action-btn--clear:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
}

.action-btn--submit {
  background: linear-gradient(135deg, rgba(226, 183, 20, 0.2) 0%, rgba(226, 183, 20, 0.1) 100%);
  border: 1px solid rgba(226, 183, 20, 0.3);
  color: #e2b714;
}
.action-btn--submit:hover {
  background: linear-gradient(135deg, rgba(226, 183, 20, 0.3) 0%, rgba(226, 183, 20, 0.15) 100%);
  box-shadow: 0 0 20px rgba(226, 183, 20, 0.15);
}

.lock-feedback {
  @apply absolute inset-0 flex items-center justify-center rounded-2xl text-xl font-bold;
  font-family: 'Cinzel', serif;
  backdrop-filter: blur(2px);
}

.lock-feedback--error {
  background: rgba(192, 57, 43, 0.3);
  color: #c0392b;
}

.lock-feedback--success {
  background: rgba(46, 204, 113, 0.3);
  color: #2ecc71;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

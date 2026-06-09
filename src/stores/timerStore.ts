import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameStatus } from '@/types'

export const useTimerStore = defineStore('timer', () => {
  const totalSeconds = ref(30 * 60)
  const remainingSeconds = ref(totalSeconds.value)
  const isRunning = ref(false)
  const intervalId = ref<ReturnType<typeof setInterval> | null>(null)

  const minutes = computed(() => Math.floor(remainingSeconds.value / 60))
  const seconds = computed(() => remainingSeconds.value % 60)
  const displayTime = computed(() =>
    `${String(minutes.value).padStart(2, '0')}:${String(seconds.value).padStart(2, '0')}`
  )
  const isLow = computed(() => remainingSeconds.value <= 300)
  const isCritical = computed(() => remainingSeconds.value <= 60)
  const progress = computed(() => remainingSeconds.value / totalSeconds.value)

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    intervalId.value = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
      } else {
        stop()
      }
    }, 1000)
  }

  function stop() {
    isRunning.value = false
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  function pause() {
    stop()
  }

  function resume() {
    if (remainingSeconds.value > 0) {
      start()
    }
  }

  function reset() {
    stop()
    remainingSeconds.value = totalSeconds.value
  }

  function setGameStatus(status: GameStatus) {
    if (status === 'playing') {
      resume()
    } else if (status === 'paused') {
      pause()
    } else {
      stop()
    }
  }

  return {
    totalSeconds,
    remainingSeconds,
    isRunning,
    minutes,
    seconds,
    displayTime,
    isLow,
    isCritical,
    progress,
    start,
    stop,
    pause,
    resume,
    reset,
    setGameStatus,
  }
})

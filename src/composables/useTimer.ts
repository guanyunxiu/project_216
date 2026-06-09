import { watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
  const gameStore = useGameStore()
  const timerStore = useTimerStore()

  watch(
    () => gameStore.status,
    (newStatus) => {
      timerStore.setGameStatus(newStatus)
      if (newStatus === 'playing' && !timerStore.isRunning) {
        timerStore.resume()
      }
    }
  )

  watch(
    () => timerStore.remainingSeconds,
    (remaining) => {
      if (remaining <= 0 && gameStore.status === 'playing') {
        gameStore.loseGame()
      }
    }
  )

  function startTimer() {
    timerStore.reset()
    timerStore.start()
  }

  function stopTimer() {
    timerStore.stop()
  }

  function togglePause() {
    if (gameStore.status === 'playing') {
      gameStore.pauseGame()
    } else if (gameStore.status === 'paused') {
      gameStore.resumeGame()
    }
  }

  return {
    startTimer,
    stopTimer,
    togglePause,
  }
}

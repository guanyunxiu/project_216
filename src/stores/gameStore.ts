import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Room, Hotspot, Puzzle, Hint, GameState, ActiveModal, GameStatus } from '@/types'
import roomsData from '@/data/rooms.json'
import hotspotsData from '@/data/hotspots.json'
import puzzlesData from '@/data/puzzles.json'
import hintsData from '@/data/hints.json'

const rooms: Room[] = roomsData as Room[]
const hotspots: Hotspot[] = hotspotsData as Hotspot[]
const puzzles: Puzzle[] = puzzlesData as Puzzle[]
const hints: Hint[] = hintsData as Hint[]

export const useGameStore = defineStore('game', () => {
  const currentRoomId = ref<string>('study')
  const status = ref<GameStatus>('idle')
  const activeModal = ref<ActiveModal>(null)
  const activePuzzleId = ref<string | null>(null)
  const activeHintPuzzleId = ref<string | null>(null)
  const hintStepsUsed = ref<Record<string, number>>({})
  const solvedPuzzles = ref<string[]>([])
  const openedHotspots = ref<string[]>([])
  const inventory = ref<string[]>([])
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)
  const draggedItemId = ref<string | null>(null)

  const currentRoom = computed(() => rooms.find(r => r.id === currentRoomId.value)!)
  const currentHotspots = computed(() =>
    hotspots.filter(h => h.roomId === currentRoomId.value)
  )
  const currentPuzzles = computed(() =>
    puzzles.filter(p => p.roomId === currentRoomId.value)
  )
  const elapsedTime = computed(() => {
    if (!startTime.value) return 0
    const end = endTime.value || Date.now()
    return Math.floor((end - startTime.value) / 1000)
  })

  function startGame() {
    currentRoomId.value = 'study'
    status.value = 'playing'
    activeModal.value = null
    activePuzzleId.value = null
    activeHintPuzzleId.value = null
    hintStepsUsed.value = {}
    solvedPuzzles.value = []
    openedHotspots.value = []
    inventory.value = []
    startTime.value = Date.now()
    endTime.value = null
    draggedItemId.value = null
  }

  function switchRoom(roomId: string) {
    currentRoomId.value = roomId
  }

  function openModal(type: ActiveModal, puzzleId?: string) {
    activeModal.value = type
    if (puzzleId) activePuzzleId.value = puzzleId
  }

  function closeModal() {
    activeModal.value = null
    activePuzzleId.value = null
  }

  function openHintPanel(puzzleId: string) {
    activeHintPuzzleId.value = puzzleId
    activeModal.value = 'hint'
  }

  function closeHintPanel() {
    activeHintPuzzleId.value = null
    if (activeModal.value === 'hint') activeModal.value = null
  }

  function getHintForPuzzle(puzzleId: string): Hint | null {
    const currentStep = hintStepsUsed.value[puzzleId] || 0
    if (currentStep >= 3) return null
    const hint = hints.find(h => h.puzzleId === puzzleId && h.step === currentStep + 1)
    if (hint) {
      hintStepsUsed.value[puzzleId] = currentStep + 1
      return hint
    }
    return null
  }

  function getHintCount(puzzleId: string): number {
    return hintStepsUsed.value[puzzleId] || 0
  }

  function getHintsForPuzzle(puzzleId: string): Hint[] {
    const count = hintStepsUsed.value[puzzleId] || 0
    return hints.filter(h => h.puzzleId === puzzleId && h.step <= count)
  }

  function solvePuzzle(puzzleId: string, rewardItemId?: string) {
    if (!solvedPuzzles.value.includes(puzzleId)) {
      solvedPuzzles.value.push(puzzleId)
    }
    const puzzle = puzzles.find(p => p.id === puzzleId)
    if (puzzle && puzzle.rewardItemId && !inventory.value.includes(puzzle.rewardItemId)) {
      inventory.value.push(puzzle.rewardItemId)
    }
    if (rewardItemId && !inventory.value.includes(rewardItemId)) {
      inventory.value.push(rewardItemId)
    }
  }

  function openHotspot(hotspotId: string) {
    if (!openedHotspots.value.includes(hotspotId)) {
      openedHotspots.value.push(hotspotId)
    }
  }

  function addToInventory(itemId: string) {
    if (!inventory.value.includes(itemId)) {
      inventory.value.push(itemId)
    }
  }

  function removeFromInventory(itemId: string) {
    inventory.value = inventory.value.filter(id => id !== itemId)
  }

  function hasItem(itemId: string): boolean {
    return inventory.value.includes(itemId)
  }

  function setDraggedItem(itemId: string | null) {
    draggedItemId.value = itemId
  }

  function winGame() {
    status.value = 'won'
    endTime.value = Date.now()
    activeModal.value = null
  }

  function loseGame() {
    status.value = 'lost'
    endTime.value = Date.now()
    activeModal.value = null
  }

  function pauseGame() {
    if (status.value === 'playing') status.value = 'paused'
  }

  function resumeGame() {
    if (status.value === 'paused') status.value = 'playing'
  }

  function getPuzzleById(puzzleId: string): Puzzle | undefined {
    return puzzles.find(p => p.id === puzzleId)
  }

  function getHotspotById(hotspotId: string): Hotspot | undefined {
    return hotspots.find(h => h.id === hotspotId)
  }

  return {
    currentRoomId,
    status,
    activeModal,
    activePuzzleId,
    activeHintPuzzleId,
    hintStepsUsed,
    solvedPuzzles,
    openedHotspots,
    inventory,
    startTime,
    endTime,
    draggedItemId,
    currentRoom,
    currentHotspots,
    currentPuzzles,
    elapsedTime,
    startGame,
    switchRoom,
    openModal,
    closeModal,
    openHintPanel,
    closeHintPanel,
    getHintForPuzzle,
    getHintCount,
    getHintsForPuzzle,
    solvePuzzle,
    openHotspot,
    addToInventory,
    removeFromInventory,
    hasItem,
    setDraggedItem,
    winGame,
    loseGame,
    pauseGame,
    resumeGame,
    getPuzzleById,
    getHotspotById,
  }
})

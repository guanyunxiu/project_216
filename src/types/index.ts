export interface Room {
  id: string
  name: string
  backgroundImage: string
  description: string
}

export type HotspotType = 'item' | 'door' | 'puzzle' | 'examine'

export interface Hotspot {
  id: string
  roomId: string
  type: HotspotType
  label: string
  x: number
  y: number
  width: number
  height: number
  targetRoomId?: string
  requiredItemId?: string
  puzzleId?: string
  itemId?: string
  examineText?: string
  consumedOnUse?: boolean
}

export type PuzzleType = 'password' | 'puzzle'

export interface Puzzle {
  id: string
  type: PuzzleType
  roomId: string
  rewardItemId: string
  solved: boolean
  answer?: string
}

export interface Item {
  id: string
  name: string
  icon: string
  description: string
  combinable: boolean
}

export interface ItemCombo {
  itemId1: string
  itemId2: string
  resultItemId: string
}

export interface Hint {
  puzzleId: string
  step: number
  text: string
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost'

export type ActiveModal = null | 'password' | 'puzzle' | 'hint'

export interface GameState {
  currentRoomId: string
  status: GameStatus
  activeModal: ActiveModal
  activePuzzleId: string | null
  activeHintPuzzleId: string | null
  hintStepsUsed: Record<string, number>
  solvedPuzzles: string[]
  openedHotspots: string[]
  inventory: string[]
  startTime: number | null
  endTime: number | null
}

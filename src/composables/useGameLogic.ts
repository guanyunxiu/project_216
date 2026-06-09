import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useItemStore } from '@/stores/itemStore'
import type { Hotspot } from '@/types'

export function useGameLogic() {
  const gameStore = useGameStore()
  const itemStore = useItemStore()

  const canInteract = computed(() =>
    gameStore.status === 'playing'
  )

  function handleHotspotClick(hotspot: Hotspot): string | null {
    if (!canInteract.value) return null

    if (hotspot.type === 'item') {
      if (hotspot.requiredItemId && !gameStore.hasItem(hotspot.requiredItemId)) {
        return `需要使用${itemStore.getItemById(hotspot.requiredItemId)?.name || '道具'}才能互动`
      }
      if (hotspot.itemId && !gameStore.hasItem(hotspot.itemId)) {
        gameStore.addToInventory(hotspot.itemId)
        gameStore.openHotspot(hotspot.id)
        return hotspot.examineText || `获得了${itemStore.getItemById(hotspot.itemId)?.name || '物品'}`
      }
      if (hotspot.itemId && gameStore.hasItem(hotspot.itemId)) {
        return hotspot.examineText || '你已经拿过这个了'
      }
      return null
    }

    if (hotspot.type === 'door') {
      if (hotspot.requiredItemId) {
        if (gameStore.hasItem(hotspot.requiredItemId)) {
          const item = itemStore.getItemById(hotspot.requiredItemId)
          if (hotspot.consumedOnUse !== false) {
            gameStore.removeFromInventory(hotspot.requiredItemId)
          }
          if (hotspot.targetRoomId) {
            gameStore.switchRoom(hotspot.targetRoomId)
            return `使用了${item?.name || '钥匙'}，门开了！`
          }
        } else {
          const item = itemStore.getItemById(hotspot.requiredItemId)
          return `这扇门需要${item?.name || '钥匙'}才能打开`
        }
      } else if (hotspot.targetRoomId) {
        gameStore.switchRoom(hotspot.targetRoomId)
        return '你进入了新的房间'
      }
      return null
    }

    if (hotspot.type === 'puzzle') {
      if (hotspot.puzzleId && gameStore.solvedPuzzles.includes(hotspot.puzzleId)) {
        if (hotspot.targetRoomId) {
          gameStore.switchRoom(hotspot.targetRoomId)
          return '谜题已解开，门开了！'
        }
        return '你已经解开了这个谜题'
      }
      if (hotspot.puzzleId) {
        const puzzle = gameStore.getPuzzleById(hotspot.puzzleId)
        if (puzzle?.type === 'password') {
          gameStore.openModal('password', hotspot.puzzleId)
        } else if (puzzle?.type === 'puzzle') {
          gameStore.openModal('puzzle', hotspot.puzzleId)
        }
        return null
      }
      return null
    }

    if (hotspot.type === 'examine') {
      gameStore.openHotspot(hotspot.id)
      return hotspot.examineText || '你仔细观察了这个地方...'
    }

    return null
  }

  function handleItemDropOnHotspot(itemId: string, hotspot: Hotspot): string | null {
    if (!canInteract.value) return null

    if (hotspot.type === 'door' && hotspot.requiredItemId === itemId) {
      const item = itemStore.getItemById(itemId)
      gameStore.removeFromInventory(itemId)
      if (hotspot.targetRoomId) {
        gameStore.switchRoom(hotspot.targetRoomId)
        return `使用了${item?.name || '道具'}，门开了！`
      }
    }

    if (hotspot.type === 'item' && hotspot.requiredItemId === itemId) {
      const item = itemStore.getItemById(itemId)
      if (hotspot.consumedOnUse) {
        gameStore.removeFromInventory(itemId)
      }
      if (hotspot.itemId && !gameStore.hasItem(hotspot.itemId)) {
        gameStore.addToInventory(hotspot.itemId)
      }
      gameStore.openHotspot(hotspot.id)
      return hotspot.examineText || `使用了${item?.name || '道具'}`
    }

    return '这个道具在这里没有用'
  }

  function checkPassword(puzzleId: string, input: string): boolean {
    const puzzle = gameStore.getPuzzleById(puzzleId)
    if (!puzzle || puzzle.type !== 'password') return false
    if (input === puzzle.answer) {
      gameStore.solvePuzzle(puzzleId)
      if (puzzleId === 'secret-password') {
        gameStore.winGame()
      }
      return true
    }
    return false
  }

  function completePuzzle(puzzleId: string) {
    gameStore.solvePuzzle(puzzleId)
  }

  return {
    canInteract,
    handleHotspotClick,
    handleItemDropOnHotspot,
    checkPassword,
    completePuzzle,
  }
}

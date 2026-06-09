import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item } from '@/types'
import itemsData from '@/data/items.json'

const allItems: Item[] = itemsData as Item[]

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>(allItems)

  function getItemById(itemId: string): Item | undefined {
    return items.value.find(i => i.id === itemId)
  }

  function getItemsByIds(itemIds: string[]): Item[] {
    return itemIds
      .map(id => items.value.find(i => i.id === id))
      .filter((i): i is Item => i !== undefined)
  }

  return {
    items,
    getItemById,
    getItemsByIds,
  }
})

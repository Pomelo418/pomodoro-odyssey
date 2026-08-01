import type { CollectionItem } from '@/types'
import raw from './items.json'

export const ITEMS = raw as unknown as CollectionItem[]

export const itemsByLevel = (level: number): CollectionItem[] =>
  ITEMS.filter((item) => item.level === level)

export const getItemById = (id: string): CollectionItem | undefined =>
  ITEMS.find((item) => item.id === id)

import type { LevelConfig } from '@/types'
import raw from './levels.json'

export const LEVELS = raw as LevelConfig[]

export const getLevel = (id: number): LevelConfig | undefined =>
  LEVELS.find((l) => l.id === id)

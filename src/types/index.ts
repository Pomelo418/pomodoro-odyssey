export type Rarity = 'common' | 'uncommon' | 'rare' | 'golden'

export type LevelCategory =
  | 'food'
  | 'drinks'
  | 'clothes'
  | 'jewelry'
  | 'plants'
  | 'furniture'
  | 'anime'
  | 'animals'

export interface LevelConfig {
  id: number
  name: string
  category: LevelCategory
  emoji: string
  color: string
  totalItems: number
  description: string
}

export interface FoodMetadata {
  kind: 'food'
  recipe: string
  cuisine: string
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: string[]
}

export interface DrinkMetadata {
  kind: 'drinks'
  recipe: string
  origin: string
  servingTemp: 'hot' | 'cold' | 'room temperature'
  glassType: string
}

export interface ClothesMetadata {
  kind: 'clothes'
  styleDescription: string
  era: string
  material: string
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season'
}

export interface JewelryMetadata {
  kind: 'jewelry'
  material: string
  gemstone: string
  style: string
  originCulture: string
}

export interface PlantMetadata {
  kind: 'plants'
  light: string
  water: string
  soil: string
  growthSpeed: 'slow' | 'moderate' | 'fast'
  petSafe: boolean
}

export interface FurnitureMetadata {
  kind: 'furniture'
  designStyle: string
  era: string
  material: string
  dimensions: string
}

export interface AnimeMetadata {
  kind: 'anime'
  personality: string
  series: string
  ability: string
  catchphrase: string
}

export interface AnimalMetadata {
  kind: 'animals'
  habitat: string
  diet: string
  lifespan: string
  conservationStatus: string
}

export type ItemMetadata =
  | FoodMetadata
  | DrinkMetadata
  | ClothesMetadata
  | JewelryMetadata
  | PlantMetadata
  | FurnitureMetadata
  | AnimeMetadata
  | AnimalMetadata

export interface CollectionItem {
  id: string
  name: string
  category: LevelCategory
  level: number
  description: string
  categoryEmoji: string
  rarity: Rarity
  metadata: ItemMetadata
  illustrationUrl?: string
  illustrationPlaceholder: string
  aiGenerated: boolean
}

export interface UnlockedItemRecord {
  itemId: string
  unlockedAt: string
  isGoldenRoll: boolean
}

export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'other'

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: boolean
  category: TaskCategory
  dueDate?: string
  createdAt: string
  completedAt?: string
  order: number
}

export type SessionMode = 'focus' | 'shortBreak' | 'longBreak'

export interface SessionHistoryDay {
  date: string
  sessionsCount: number
  itemsUnlocked: number
  focusTime: number
}

export type AmbientSoundId = 'lofi' | 'rain' | 'forest' | 'ocean'

export interface TimerSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsUntilLongBreak: number
  autoStartNext: boolean
  autoPlayAmbient: boolean
  chimeSound: 'chime' | 'bell' | 'digital' | 'none'
  soundVolume: number
  ambientVolume: number
  theme: 'light' | 'dark' | 'system'
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  bio: string
  avatarUrl?: string
  socialLinks: {
    twitter?: string
    github?: string
    discord?: string
    instagram?: string
  }
  privacy: {
    profileVisible: boolean
    leaderboardOptIn: boolean
    hideStreak: boolean
    anonymousMode: boolean
  }
  createdAt: string
}

export interface Certificate {
  id: string
  level: number
  itemsCount: number
  completedAt: string
  totalFocusHours: number
  goldenItemsCount: number
  favoriteItemIds: string[]
  shareCode: string
}

export interface HistoricalFact {
  month: number
  day: number
  fact: string
  category: 'science' | 'arts' | 'politics' | 'sports' | 'technology' | 'culture'
  year?: number
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

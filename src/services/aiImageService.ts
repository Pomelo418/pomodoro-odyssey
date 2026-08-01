// MOCK implementation of the AI image generation API described in the product spec.
// Swap these functions for real fetch() calls to a backend once one exists —
// the request/response shapes already match the documented contract.
import { mockDelay } from './mockDelay'

export type GenerationStyle = 'chibi' | 'cute' | 'illustration' | 'kawaii'
export type GenerationStatus = 'pending' | 'processing' | 'complete' | 'failed'

export interface GenerateItemImageRequest {
  itemId: string
  name: string
  category: string
  level: number
  style: GenerationStyle
  prompt?: string
}

export interface GenerateItemImageResponse {
  imageUrl: string
  generationId: string
  estimatedTime: number
}

export interface GenerationStatusResponse {
  status: GenerationStatus
  imageUrl?: string
  errorMessage?: string
  progress: number
}

export interface BatchGenerateRequest {
  itemIds: string[]
  style: GenerationStyle
}

export interface BatchGenerateResponse {
  batchId: string
  totalItems: number
  estimatedCompletion: string
}

const generationLog = new Map<string, { startedAt: number; itemId: string }>()

const DAILY_RATE_LIMIT = 50
let generationsToday = 0

/** POST /api/generate-item-image */
export async function generateItemImage(
  req: GenerateItemImageRequest,
): Promise<GenerateItemImageResponse> {
  if (generationsToday >= DAILY_RATE_LIMIT) {
    throw new Error('Rate limit exceeded: 50 generations per user per day.')
  }
  generationsToday += 1

  const generationId = `gen-${req.itemId}-${Date.now()}`
  generationLog.set(generationId, { startedAt: Date.now(), itemId: req.itemId })

  return mockDelay(
    {
      imageUrl: '', // populated once generation-status reports "complete"
      generationId,
      estimatedTime: 8,
    },
    300,
  )
}

/** GET /api/generation-status/:generationId */
export async function getGenerationStatus(
  generationId: string,
): Promise<GenerationStatusResponse> {
  const entry = generationLog.get(generationId)
  if (!entry) {
    return mockDelay({ status: 'failed', errorMessage: 'Unknown generation id.', progress: 0 }, 200)
  }
  const elapsed = Date.now() - entry.startedAt
  if (elapsed < 2000) return mockDelay({ status: 'pending', progress: 10 }, 150)
  if (elapsed < 6000) {
    return mockDelay(
      { status: 'processing', progress: Math.min(90, Math.round((elapsed / 8000) * 100)) },
      150,
    )
  }
  return mockDelay(
    {
      status: 'complete',
      progress: 100,
      imageUrl: `placeholder://${entry.itemId}`,
    },
    150,
  )
}

/** POST /api/generate/batch (Admin only) */
export async function batchGenerateImages(
  req: BatchGenerateRequest,
): Promise<BatchGenerateResponse> {
  const eta = new Date(Date.now() + req.itemIds.length * 8000).toISOString()
  return mockDelay(
    { batchId: `batch-${Date.now()}`, totalItems: req.itemIds.length, estimatedCompletion: eta },
    400,
  )
}

/** POST /api/regenerate-item/:itemId */
export async function regenerateItem(
  itemId: string,
  style: GenerationStyle = 'chibi',
): Promise<{ generationId: string }> {
  const generationId = `regen-${itemId}-${Date.now()}`
  generationLog.set(generationId, { startedAt: Date.now(), itemId })
  void style
  return mockDelay({ generationId }, 300)
}

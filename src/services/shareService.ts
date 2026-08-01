// Client-side sharing helpers. Uses the native Web Share API where available
// and falls back to copying a share link to the clipboard. The share "codes"
// are generated locally (mock) since there's no backend to resolve them yet.
import type { CollectionItem, Certificate, UserProfile } from '@/types'

const APP_NAME = 'Pomodoro Odyssey'
const HASHTAGS = '#PomodoroOdyssey #Productivity'

async function nativeShareOrCopy(data: { title: string; text: string; url?: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared' as const
    } catch {
      return 'cancelled' as const
    }
  }
  const text = [data.text, data.url].filter(Boolean).join(' ')
  await navigator.clipboard.writeText(text)
  return 'copied' as const
}

export async function shareItem(item: CollectionItem) {
  return nativeShareOrCopy({
    title: `${item.name} — ${APP_NAME}`,
    text: `I just unlocked "${item.name}" (${item.rarity}) in ${APP_NAME}! ${HASHTAGS}`,
  })
}

export async function shareCertificate(cert: Certificate, levelName: string) {
  return nativeShareOrCopy({
    title: `Level ${cert.level} Certificate — ${APP_NAME}`,
    text: `I completed the "${levelName}" collection (${cert.itemsCount} items) in ${APP_NAME}! Verify: ${cert.shareCode} ${HASHTAGS}`,
  })
}

export async function shareProfile(profile: UserProfile) {
  return nativeShareOrCopy({
    title: `${profile.displayName}'s collection — ${APP_NAME}`,
    text: `Check out my productivity collection on ${APP_NAME}! ${HASHTAGS}`,
    url: `https://pomodoroodyssey.example/u/${profile.username}`,
  })
}

export function socialIntentUrl(
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram',
  text: string,
  url = 'https://pomodoroodyssey.example',
) {
  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  }
}

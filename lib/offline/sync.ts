import { getPending, markSynced } from './indexeddb'

const STORES = ['progreso', 'notas'] as const

async function syncStore(store: string): Promise<void> {
  const pending = await getPending(store)
  for (const item of pending) {
    try {
      if (store === 'progreso') {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (res.ok) await markSynced(store, item.id)
      }
      if (store === 'notas') {
        const res = await fetch('/api/curso/notas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (res.ok) await markSynced(store, item.id)
      }
    } catch {
      // Retry on next online event
    }
  }
}

export async function syncWhenOnline(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return
  for (const store of STORES) {
    await syncStore(store)
  }
}

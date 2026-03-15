const DB_NAME = 'politica-digital-offline'
const DB_VERSION = 1

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('progreso')) {
        db.createObjectStore('progreso', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('notas')) {
        db.createObjectStore('notas', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('checkins')) {
        db.createObjectStore('checkins', { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export interface OfflineRecord {
  id: string
  timestamp: number
  synced: boolean
  [key: string]: unknown
}

export async function saveOffline(store: string, data: Record<string, unknown>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const payload: OfflineRecord = {
      ...data,
      id: (data.id as string) ?? crypto.randomUUID(),
      timestamp: Date.now(),
      synced: false,
    }
    tx.objectStore(store).put(payload)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPending(store: string): Promise<OfflineRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve((req.result as OfflineRecord[]).filter((item) => !item.synced))
    req.onerror = () => reject(req.error)
  })
}

export async function markSynced(store: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const getReq = tx.objectStore(store).get(id)
    getReq.onsuccess = () => {
      const record = getReq.result as OfflineRecord | undefined
      if (record) {
        record.synced = true
        tx.objectStore(store).put(record)
      }
      resolve()
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

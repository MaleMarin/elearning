'use client'

import { useState, useEffect } from 'react'
import { syncWhenOnline } from '@/lib/offline/sync'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const goOff = () => setOffline(true)
    const goOn = () => {
      setOffline(false)
      syncWhenOnline()
    }
    window.addEventListener('offline', goOff)
    window.addEventListener('online', goOn)
    return () => {
      window.removeEventListener('offline', goOff)
      window.removeEventListener('online', goOn)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#e8eaf0',
        boxShadow: '0 4px 12px #c2c8d6',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: '#ffc107',
          borderRadius: '50%',
          display: 'block',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#4a5580' }}>
        Sin conexión — Usando contenido descargado. Tu progreso se sincronizará cuando vuelva internet.
      </span>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface DownloadProgressProps {
  active: boolean
  total?: number
  current?: number
  label?: string
}

export default function DownloadProgress({
  active,
  total = 3,
  current = 0,
  label = 'Descargando lecciones para uso offline',
}: DownloadProgressProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !active) return null

  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99,
        background: '#e8eaf0',
        borderRadius: 12,
        padding: '12px 20px',
        boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
        fontFamily: "var(--font-heading)",
        minWidth: 280,
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 600, color: '#4a5580' }}>{label}</p>
      <div
        style={{
          height: 6,
          background: '#e8eaf0',
          borderRadius: 4,
          boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #1428d4, #2b4fff)',
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#8892b0', fontFamily: "'Space Mono', monospace" }}>
        {current} / {total}
      </p>
    </div>
  )
}

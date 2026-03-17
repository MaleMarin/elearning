'use client'

import { useRouter } from 'next/navigation'
import type { KnowledgeNode } from '@/app/api/knowledge/route'

interface NodeDetailProps {
  node: KnowledgeNode | null
  onClose: () => void
  getLessonHref?: (lessonId: string) => string
}

export default function NodeDetail({ node, onClose }: NodeDetailProps) {
  const router = useRouter()
  if (!node) return null

  const completado = node.status === 'completed'
  const lessonId = node.lessonIds?.[0] ?? ''

  return (
    <aside
      role="complementary"
      aria-label="Detalle del concepto"
      style={{
        width: 280,
        flexShrink: 0,
        background: '#e8eaf0',
        borderRadius: 20,
        padding: 24,
        boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
        fontFamily: "var(--font-heading)",
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          style={{
            background: '#e8eaf0',
            border: 'none',
            borderRadius: 8,
            padding: 6,
            cursor: 'pointer',
            boxShadow: '2px 2px 5px #c2c8d6, -2px -2px 5px #ffffff',
            color: '#4a5580',
            lineHeight: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#1428d4',
          fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          background: 'rgba(20,40,212,0.08)',
          padding: '3px 10px',
          borderRadius: 20,
          display: 'inline-block',
        }}
      >
        {node.type === 'modulo' ? 'Módulo' : node.type === 'habilidad' ? 'Habilidad' : 'Concepto'}
      </span>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f8a', fontFamily: "var(--font-heading)", marginTop: 12, marginBottom: 8 }}>
        {node.label}
      </h3>

      {node.descripcion && (
        <p style={{ fontSize: 13, color: '#4a5580', lineHeight: 1.7, fontFamily: "var(--font-body)", marginBottom: 20 }}>
          {node.descripcion}
        </p>
      )}

      <div
        style={{
          background: '#e8eaf0',
          borderRadius: 12,
          padding: '10px 14px',
          boxShadow: 'inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: completado ? '#00e5a0' : '#c2c8d6',
          }}
        />
        <span style={{ fontSize: 12, color: '#4a5580', fontFamily: "'Space Mono', monospace" }}>
          {completado ? '✓ Concepto dominado' : 'Pendiente de aprender'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => lessonId && router.push(`/curso/lecciones/${lessonId}`)}
        disabled={!lessonId}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: 14,
          border: 'none',
          cursor: lessonId ? 'pointer' : 'not-allowed',
          fontFamily: "var(--font-heading)",
          fontSize: 14,
          fontWeight: 700,
          background: completado
            ? '#e8eaf0'
            : 'linear-gradient(135deg, #1428d4, #0a0f8a)',
          color: completado ? '#4a5580' : 'white',
          boxShadow: completado
            ? '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff'
            : '5px 5px 12px rgba(10,15,138,0.35)',
        }}
      >
        {completado ? '↺ Repasar este concepto' : '→ Ir a aprender esto'}
      </button>
    </aside>
  )
}

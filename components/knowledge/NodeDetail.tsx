'use client'

import Link from 'next/link'
import type { KnowledgeNode } from '@/app/api/knowledge/route'

const svgAria = { 'aria-hidden': true, focusable: false }
const IcoBook = () => <svg {...svgAria} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>

interface NodeDetailProps {
  node: KnowledgeNode | null
  onClose: () => void
  getLessonHref?: (lessonId: string) => string
}

export default function NodeDetail({ node, onClose, getLessonHref }: NodeDetailProps) {
  if (!node) return null

  const lessonHref = (id: string) => getLessonHref?.(id) ?? `/curso/lecciones/${id}`

  return (
    <aside
      role="complementary"
      aria-label="Detalle del concepto"
      style={{
        width: 280,
        flexShrink: 0,
        background: '#e8eaf0',
        borderRadius: 16,
        padding: 20,
        boxShadow: 'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff',
        fontFamily: "'Syne', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0a0f8a', lineHeight: 1.3 }}>
          {node.label}
        </h3>
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

      {node.descripcion && (
        <p style={{ margin: 0, fontSize: 13, color: '#4a5580', lineHeight: 1.5 }}>
          {node.descripcion}
        </p>
      )}

      {node.moduloNombre && (
        <div style={{ fontSize: 12, color: '#8892b0' }}>
          Módulo: <span style={{ fontWeight: 600, color: '#0a0f8a' }}>{node.moduloNombre}</span>
        </div>
      )}

      {node.dominioPercent != null && (
        <div>
          <div style={{ fontSize: 11, color: '#8892b0', marginBottom: 6 }}>Dominio</div>
          <div
            role="progressbar"
            aria-valuenow={node.dominioPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${node.dominioPercent}% de dominio`}
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
                width: `${node.dominioPercent}%`,
                background: node.status === 'completed' ? '#1428d4' : node.status === 'in-progress' ? '#00e5a0' : '#8892b0',
                borderRadius: 4,
                boxShadow: '0 0 8px rgba(20,40,212,0.3)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {node.lessonIds && node.lessonIds.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#8892b0', marginBottom: 6 }}>Lecciones relacionadas</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#0a0f8a' }}>
            {node.lessonIds.map((id) => (
              <li key={id} style={{ marginBottom: 4 }}>
                <Link
                  href={lessonHref(id)}
                  style={{ color: '#1428d4', textDecoration: 'none', fontWeight: 500 }}
                >
                  Lección {id.replace('lec-', '')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {node.connectedIds && node.connectedIds.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#8892b0', marginBottom: 6 }}>Conceptos conectados</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {node.connectedIds.map((id) => (
              <span
                key={id}
                style={{
                  background: '#e8eaf0',
                  borderRadius: 12,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#4a5580',
                  boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
                }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.lessonIds && node.lessonIds[0] && (
        <Link
          href={lessonHref(node.lessonIds[0])}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 'auto',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #1428d4, #2b4fff)',
            color: '#fff',
            borderRadius: 50,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
          }}
        >
          <IcoBook />
          Ir a la lección
        </Link>
      )}
    </aside>
  )
}

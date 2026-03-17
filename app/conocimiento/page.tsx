'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import NodeDetail from '@/components/knowledge/NodeDetail'
import type { KnowledgeNode, KnowledgeLink, KnowledgeGraphResponse } from '@/app/api/knowledge/route'

const svgAria = { 'aria-hidden': true, focusable: false }

const W = 800
const H = 500
const POSITIONS: Record<string, { x: number; y: number }> = {
  n1: { x: 400, y: 150 },
  n2: { x: 200, y: 300 },
  n3: { x: 400, y: 300 },
  n4: { x: 600, y: 300 },
  n5: { x: 150, y: 150 },
  n6: { x: 100, y: 300 },
  n7: { x: 650, y: 150 },
  n8: { x: 580, y: 300 },
  n9: { x: 750, y: 300 },
}

function GrafoSimple({
  nodes,
  links,
  onNodeSelect,
}: {
  nodes: KnowledgeNode[]
  links: KnowledgeLink[]
  onNodeSelect: (node: KnowledgeNode | null) => void
}) {
  const colorTipo = (type: string) => (type === 'modulo' ? '#1428d4' : '#0a0f8a')
  const completado = (node: KnowledgeNode) => node.status === 'completed'

  return (
    <svg
      width="100%"
      height="500"
      viewBox={`0 0 ${W} ${H}`}
      style={{ background: 'transparent', display: 'block' }}
      onClick={() => onNodeSelect(null)}
      role="img"
      aria-label="Red neuronal de conocimiento"
    >
      {links.map((link, i) => {
        const s = POSITIONS[link.source]
        const t = POSITIONS[link.target]
        if (!s || !t) return null
        return (
          <line
            key={i}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke="rgba(20,40,212,0.2)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )
      })}
      {nodes.map((node) => {
        const pos = POSITIONS[node.id] ?? { x: node.x, y: node.y }
        const esModulo = node.type === 'modulo'
        const r = esModulo ? 36 : 26
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x},${pos.y})`}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation()
              onNodeSelect(node)
            }}
          >
            <circle r={r + 4} fill="rgba(194,200,214,0.5)" />
            <circle
              r={r}
              fill={completado(node) ? '#1428d4' : '#e8eaf0'}
              stroke={colorTipo(node.type)}
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              dy="4"
              fontSize={esModulo ? 11 : 9}
              fontWeight={esModulo ? '800' : '600'}
              fontFamily="var(--font-heading)"
              fill={completado(node) ? 'white' : '#0a0f8a'}
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ConocimientoPage() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [links, setLinks] = useState<KnowledgeLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)

  useEffect(() => {
    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data: KnowledgeGraphResponse) => {
        setNodes(data.nodes ?? [])
        setLinks(data.links ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const totalNodos = nodes.length
  const nodosCompletados = nodes.filter((n) => n.status === 'completed').length

  return (
    <DashboardShell subtitle="// Red neuronal de conocimiento">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          fontFamily: "var(--font-heading)",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Header explicativo */}
        <div
          style={{
            background: '#e8eaf0',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 20,
            boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: '#1428d4', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>
                Tu mapa de conocimiento
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0f8a', fontFamily: "var(--font-heading)", marginBottom: 10, letterSpacing: '-0.3px' }}>
                ¿Cómo conectan los conceptos que aprendes?
              </h2>
              <p style={{ fontSize: 14, color: '#4a5580', lineHeight: 1.7, fontFamily: "var(--font-body)", maxWidth: 600 }}>
                Este grafo muestra todos los conceptos del programa y cómo se relacionan entre sí. Los <strong style={{ color: '#0a0f8a' }}>nodos azules sólidos</strong> son los que ya dominaste. Los <strong style={{ color: '#0a0f8a' }}>círculos vacíos</strong> son los que te faltan. Haz click en cualquier nodo para ver la lección y aprenderlo.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
              {[
                { val: nodosCompletados, total: totalNodos, label: 'Conceptos dominados', color: '#1428d4' },
                { val: totalNodos > 0 ? `${Math.round((nodosCompletados / totalNodos) * 100)}%` : '0%', label: 'Del mapa completo', color: '#00b87d' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: '#e8eaf0',
                    borderRadius: 14,
                    padding: '16px 20px',
                    textAlign: 'center',
                    boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
                    minWidth: 100,
                  }}
                >
                  <p style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
                    {s.val}
                  </p>
                  {i === 0 && (
                    <p style={{ fontSize: 10, color: '#8892b0', marginTop: 2 }}>de {totalNodos}</p>
                  )}
                  <p style={{ fontSize: 10, color: '#8892b0', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            {loading ? (
              <div
                style={{
                  background: '#e8eaf0',
                  borderRadius: 16,
                  boxShadow: 'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff',
                  padding: 48,
                  textAlign: 'center',
                  color: '#4a5580',
                  fontSize: 14,
                }}
              >
                Cargando red de conocimiento…
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '500px',
                  background: '#e8eaf0',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
                }}
              >
                <GrafoSimple
                  nodes={nodes}
                  links={links}
                  onNodeSelect={setSelectedNode}
                />
              </div>
            )}
          </div>
          {selectedNode && (
            <NodeDetail
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>

        {/* Instrucciones rápidas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginTop: 16,
          }}
        >
          {[
            {
              icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ),
              titulo: 'Explora el mapa',
              texto: 'Haz click en cualquier concepto para ver su descripción y la lección donde se enseña.',
            },
            {
              icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
              titulo: 'Sigue tu progreso',
              texto: 'Los nodos azules sólidos son conceptos que ya completaste. Los vacíos son los próximos.',
            },
            {
              icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c89000" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              ),
              titulo: 'Descubre conexiones',
              texto: 'Las líneas muestran cómo los conceptos se construyen uno sobre otro. El orden importa.',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: '#e8eaf0',
                borderRadius: 16,
                padding: '18px 16px',
                boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  marginBottom: 12,
                  background: '#e8eaf0',
                  boxShadow: '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icono}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0f8a', fontFamily: "var(--font-heading)", marginBottom: 6 }}>
                {item.titulo}
              </p>
              <p style={{ fontSize: 13, color: '#4a5580', lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                {item.texto}
              </p>
            </div>
          ))}
        </div>

        <div
          role="group"
          aria-label="Leyenda del grafo"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            padding: '12px 16px',
            background: '#e8eaf0',
            borderRadius: 12,
            boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4a5580', marginRight: 4 }}>Estado:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0a0f8a' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1428d4', boxShadow: '0 0 8px rgba(20,40,212,0.4)' }} />
            Completado
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0a0f8a' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 8px rgba(0,229,160,0.4)' }} />
            En progreso
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0a0f8a' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8eaf0', boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff' }} />
            Pendiente
          </span>
          <span style={{ width: 1, height: 16, background: '#c2c8d6', margin: '0 4px' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4a5580', marginRight: 4 }}>Tipo:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0a0f8a' }}>
            <svg {...svgAria} width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1428d4"/></svg>
            Módulo
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0a0f8a' }}>
            <svg {...svgAria} width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="#00e5a0"/></svg>
            Concepto
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0a0f8a' }}>
            <svg {...svgAria} width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#8892b0"/></svg>
            Habilidad
          </span>
        </div>
      </div>
    </DashboardShell>
  )
}

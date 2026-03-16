'use client'

import { useState, useEffect } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph'
import NodeDetail from '@/components/knowledge/NodeDetail'
import type { KnowledgeNode, KnowledgeLink, KnowledgeGraphResponse } from '@/app/api/knowledge/route'

const svgAria = { 'aria-hidden': true, focusable: false }

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
              <KnowledgeGraph
                nodes={nodes}
                links={links}
                onNodeSelect={setSelectedNode}
                selectedId={selectedNode?.id ?? null}
              />
            )}
          </div>
          {selectedNode && (
            <NodeDetail
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
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

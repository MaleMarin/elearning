'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as d3 from 'd3'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

// ═══════════════════════════════════
// DATOS DE LOS NODOS
// ═══════════════════════════════════
const NODES = [
  { id: 'n1', label: 'Ciberseguridad', tipo: 'modulo', descripcion: 'Protección de sistemas y datos del gobierno digital.', completado: true, color: '#1428d4', lessonId: 'les-cifrado-e2e' },
  { id: 'n2', label: 'Cifrado E2E', tipo: 'concepto', descripcion: 'AES-256: encriptación de extremo a extremo para datos sensibles.', completado: true, color: '#0a0f8a', lessonId: 'les-cifrado-e2e' },
  { id: 'n3', label: 'Zero Trust', tipo: 'concepto', descripcion: 'Modelo de seguridad: nunca confíes, siempre verifica.', completado: false, color: '#0a0f8a', lessonId: 'les-zero-trust' },
  { id: 'n4', label: 'LFPDPPP', tipo: 'concepto', descripcion: 'Ley Federal de Protección de Datos Personales en México.', completado: false, color: '#0a0f8a', lessonId: 'les-lfpdppp' },
  { id: 'n5', label: 'Datos Abiertos', tipo: 'modulo', descripcion: 'Transparencia y acceso ciudadano a la información pública.', completado: false, color: '#006289', lessonId: 'les-que-son-datos' },
  { id: 'n6', label: 'Formatos Abiertos', tipo: 'concepto', descripcion: 'CSV, JSON, GeoJSON: estándares para datos procesables.', completado: false, color: '#006289', lessonId: 'les-publicar-datos' },
  { id: 'n7', label: 'Innovación Pública', tipo: 'modulo', descripcion: 'Metodologías para transformar servicios de gobierno.', completado: false, color: '#533ab7', lessonId: 'les-design-thinking' },
  { id: 'n8', label: 'Design Thinking', tipo: 'concepto', descripcion: 'Diseño centrado en el ciudadano: 5 etapas.', completado: false, color: '#533ab7', lessonId: 'les-design-thinking' },
  { id: 'n9', label: 'Metodologías Ágiles', tipo: 'concepto', descripcion: 'Scrum y Kanban aplicados al gobierno digital.', completado: false, color: '#533ab7', lessonId: 'les-agile-gobierno' },
]

const LINKS = [
  { source: 'n1', target: 'n2', strength: 1 },
  { source: 'n1', target: 'n3', strength: 0.8 },
  { source: 'n1', target: 'n4', strength: 0.8 },
  { source: 'n5', target: 'n6', strength: 1 },
  { source: 'n7', target: 'n8', strength: 1 },
  { source: 'n7', target: 'n9', strength: 1 },
  { source: 'n3', target: 'n4', strength: 0.6 },
  { source: 'n5', target: 'n7', strength: 0.4 },
]

const COLORES_MODULO: Record<string, { bg: string; stroke: string; glow: string }> = {
  n1: { bg: '#1428d4', stroke: '#0a0f8a', glow: 'rgba(20,40,212,0.4)' },
  n5: { bg: '#006289', stroke: '#004a6b', glow: 'rgba(0,98,137,0.4)' },
  n7: { bg: '#533ab7', stroke: '#3c3489', glow: 'rgba(83,58,183,0.4)' },
}

const COLORES_CONCEPTO: Record<string, { bg: string; stroke: string }> = {
  n2: { bg: '#85b7eb', stroke: '#1428d4' },
  n3: { bg: '#b5d4f4', stroke: '#1428d4' },
  n4: { bg: '#b5d4f4', stroke: '#1428d4' },
  n6: { bg: '#72edf1', stroke: '#006289' },
  n8: { bg: '#afa9ec', stroke: '#533ab7' },
  n9: { bg: '#cecbf6', stroke: '#533ab7' },
}

type NodeDatum = (typeof NODES)[0] & { x: number; y: number; fx?: number | null; fy?: number | null }
type LinkDatum = { source: string | NodeDatum; target: string | NodeDatum; strength?: number }

export default function ConocimientoPage() {
  const router = useRouter()
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodoSeleccionado, setNodoSeleccionado] = useState<typeof NODES[0] | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'completados' | 'pendientes'>('todos')

  const completados = NODES.filter((n) => n.completado).length
  const total = NODES.length
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0

  useEffect(() => {
    if (!svgRef.current) return

    const W = svgRef.current.clientWidth || 900
    const H = 480

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')

    const bgGrad = defs
      .append('radialGradient')
      .attr('id', 'bgGrad')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '60%')
    bgGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(20,40,212,0.04)')
    bgGrad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent')

    svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'url(#bgGrad)')

    const filter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%')
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    const gridG = svg.append('g').attr('opacity', 0.04)
    for (let x = 0; x < W; x += 40) {
      gridG
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', H)
        .attr('stroke', '#1428d4')
        .attr('stroke-width', 0.5)
    }
    for (let y = 0; y < H; y += 40) {
      gridG
        .append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', W)
        .attr('y2', y)
        .attr('stroke', '#1428d4')
        .attr('stroke-width', 0.5)
    }

    const nodesData = NODES.filter(
      (n) =>
        filtro === 'todos' ||
        (filtro === 'completados' && n.completado) ||
        (filtro === 'pendientes' && !n.completado)
    ).map((n) => ({ ...n, x: W / 2 + (Math.random() - 0.5) * 300, y: H / 2 + (Math.random() - 0.5) * 200 }))

    const nodeIds = new Set(nodesData.map((n) => n.id))
    const linksData: LinkDatum[] = LINKS.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target)).map((l) => ({ ...l }))

    const simulation = d3
      .forceSimulation<NodeDatum>(nodesData)
      .force(
        'link',
        d3
          .forceLink<NodeDatum, LinkDatum>(linksData)
          .id((d) => d.id)
          .distance((d) => {
            const s = d.source as NodeDatum
            return s.tipo === 'modulo' ? 160 : 120
          })
          .strength((d) => d.strength ?? 0.8)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide<NodeDatum>().radius((d) => (d.tipo === 'modulo' ? 60 : 45)))

    const linkG = svg.append('g')
    const linkEls = linkG
      .selectAll('g')
      .data(linksData)
      .join('g')

    linkEls
      .append('line')
      .attr('stroke', (d: { source: string | { id: string }; completado?: boolean }) => {
        const sid = typeof d.source === 'object' ? (d.source as { id: string }).id : d.source
        const source = nodesData.find((n) => n.id === sid)
        return source?.completado ? 'rgba(20,40,212,0.15)' : 'rgba(194,200,214,0.3)'
      })
      .attr('stroke-width', 8)
      .attr('stroke-linecap', 'round')

    linkEls
      .append('line')
      .attr('stroke', (d: { source: string | { id: string }; strength?: number }) => {
        const sid = typeof d.source === 'object' ? (d.source as { id: string }).id : d.source
        const source = nodesData.find((n) => n.id === sid)
        return source?.completado ? 'rgba(20,40,212,0.4)' : 'rgba(140,145,176,0.4)'
      })
      .attr('stroke-width', (d: { strength?: number }) => ((d.strength ?? 0.5) * 2) as number)
      .attr('stroke-dasharray', (d: { strength?: number }) => (d.strength != null && d.strength < 0.7 ? '5 5' : 'none'))

    const nodeG = svg.append('g')
    const nodeEls = nodeG
      .selectAll('g')
      .data(nodesData)
      .join('g')
      .attr('cursor', 'pointer')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(d3.drag<SVGGElement, NodeDatum>().on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        const d = event.subject
        d.fx = d.x
        d.fy = d.y
      }).on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      }).on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }) as any)
      .on('click', (event, d) => {
        event.stopPropagation()
        setNodoSeleccionado(d)
      })

    nodeEls
      .append('circle')
      .attr('r', (d) => (d.tipo === 'modulo' ? 46 : 34))
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.completado) return COLORES_MODULO[d.id]?.glow?.replace('0.4', '0.3') ?? 'rgba(20,40,212,0.2)'
        return 'rgba(194,200,214,0.3)'
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 3')

    nodeEls
      .append('circle')
      .attr('r', (d) => (d.tipo === 'modulo' ? 40 : 30))
      .attr('fill', 'rgba(194,200,214,0.4)')
      .attr('transform', 'translate(3,4)')

    nodeEls
      .append('circle')
      .attr('r', (d) => (d.tipo === 'modulo' ? 40 : 30))
      .attr('fill', (d) => {
        if (d.completado) {
          return COLORES_MODULO[d.id]?.bg ?? COLORES_CONCEPTO[d.id]?.bg ?? '#1428d4'
        }
        return '#e8eaf0'
      })
      .attr('stroke', (d) => {
        if (d.completado) return COLORES_MODULO[d.id]?.stroke ?? '#0a0f8a'
        return COLORES_CONCEPTO[d.id]?.stroke ?? COLORES_MODULO[d.id]?.stroke ?? '#c2c8d6'
      })
      .attr('stroke-width', (d) => (d.tipo === 'modulo' ? 3 : 2))
      .attr('filter', (d) => (d.completado ? 'url(#glow)' : 'none'))

    nodeEls
      .filter((d) => d.tipo === 'modulo')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-6')
      .attr('font-size', '18')
      .attr('fill', (d) => (d.completado ? 'white' : '#4a5580'))
      .text((d) => {
        if (d.id === 'n1') return '🔐'
        if (d.id === 'n5') return '📊'
        if (d.id === 'n7') return '💡'
        return '●'
      })

    nodeEls
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.tipo === 'modulo' ? '14' : '5'))
      .attr('font-size', (d) => (d.tipo === 'modulo' ? '10' : '9'))
      .attr('font-weight', (d) => (d.tipo === 'modulo' ? '800' : '600'))
      .attr('font-family', 'var(--font-heading)')
      .attr('fill', (d) => {
        if (d.completado) return 'white'
        return d.tipo === 'modulo' ? '#0a0f8a' : '#4a5580'
      })
      .text((d) => (d.label.length > 12 ? d.label.slice(0, 10) + '…' : d.label))

    nodeEls
      .filter((d) => d.completado)
      .append('circle')
      .attr('r', (d) => (d.tipo === 'modulo' ? 44 : 34))
      .attr('fill', 'none')
      .attr('stroke', (d) => COLORES_MODULO[d.id]?.bg ?? '#1428d4')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6)
      .each(function (d) {
        const base = d.tipo === 'modulo' ? 40 : 30
        d3.select(this)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', `${base};${base + 10};${base}`)
          .attr('dur', '2.5s')
          .attr('repeatCount', 'indefinite')
      })

    nodeEls
      .filter((d) => d.completado)
      .append('g')
      .attr('transform', (d) => {
        const r = d.tipo === 'modulo' ? 40 : 30
        return `translate(${r * 0.7},${-r * 0.7})`
      })
      .each(function () {
        const g = d3.select(this)
        g.append('circle').attr('r', 8).attr('fill', '#00e5a0')
        g.append('text').attr('text-anchor', 'middle').attr('dy', '4').attr('font-size', '9').attr('fill', '#0a3020').text('✓')
      })

    simulation.on('tick', () => {
      nodesData.forEach((d) => {
        d.x = Math.max(50, Math.min(W - 50, d.x))
        d.y = Math.max(50, Math.min(H - 50, d.y))
      })

      linkEls
        .selectAll<SVGLineElement, LinkDatum>('line')
        .attr('x1', (d) => (d.source as NodeDatum).x)
        .attr('y1', (d) => (d.source as NodeDatum).y)
        .attr('x2', (d) => (d.target as NodeDatum).x)
        .attr('y2', (d) => (d.target as NodeDatum).y)

      nodeEls.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [filtro])

  return (
    <DashboardShell subtitle="// Red neuronal de conocimiento">
      <div
        style={{
          flex: 1,
          padding: '20px 20px',
          background: '#e8eaf0',
          minHeight: 0,
          fontFamily: 'var(--font-heading)',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: '#e8eaf0',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 16,
            boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p
                style={{
                  fontSize: 10,
                  color: '#1428d4',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: 8,
                }}
              >
                Tu mapa de conocimiento
              </p>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0a0f8a',
                  letterSpacing: '-0.5px',
                  marginBottom: 8,
                }}
              >
                ¿Cómo conectan los conceptos?
              </h1>
              <p style={{ fontSize: 13, color: '#4a5580', lineHeight: 1.7, maxWidth: 520, fontFamily: 'var(--font-body)' }}>
                Cada nodo es un concepto del programa. Las líneas muestran cómo se relacionan.{' '}
                <strong style={{ color: '#1428d4' }}>Azules sólidos</strong> = dominados. Vacíos = próximos. Arrastra los nodos. Haz click para ir a la lección.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: completados, sub: `de ${total}`, label: 'Dominados', color: '#1428d4' },
                { val: `${porcentaje}%`, sub: 'del mapa', label: 'Progreso', color: '#00b87d' },
                { val: total - completados, sub: 'conceptos', label: 'Por aprender', color: '#c89000' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: '#e8eaf0',
                    borderRadius: 14,
                    padding: '14px 16px',
                    textAlign: 'center',
                    minWidth: 90,
                    boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
                  }}
                >
                  <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
                    {s.val}
                  </p>
                  <p style={{ fontSize: 9, color: '#8892b0', marginTop: 2 }}>{s.sub}</p>
                  <p style={{ fontSize: 9, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[
              { id: 'todos', label: 'Todos los conceptos' },
              { id: 'completados', label: '✓ Dominados' },
              { id: 'pendientes', label: '○ Por aprender' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id as 'todos' | 'completados' | 'pendientes')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 50,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 12,
                  fontWeight: 600,
                  background: filtro === f.id ? 'linear-gradient(135deg, #1428d4, #0a0f8a)' : '#e8eaf0',
                  color: filtro === f.id ? 'white' : '#4a5580',
                  boxShadow:
                    filtro === f.id ? '4px 4px 10px rgba(10,15,138,0.3)' : '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff',
                  transition: 'all 0.2s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* GRAFO + PANEL DETALLE */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              background: '#e8eaf0',
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 480,
              boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
            }}
          >
            <p
              style={{
                position: 'absolute',
                bottom: 12,
                left: 16,
                fontSize: 10,
                color: '#c2c8d6',
                fontFamily: "'Space Mono', monospace",
                zIndex: 1,
              }}
            >
              Arrastra los nodos · Haz click para ver detalles
            </p>
            <svg ref={svgRef} style={{ width: '100%', height: 480 }} aria-hidden />
          </div>

          {nodoSeleccionado && (
            <div
              style={{
                width: 260,
                background: '#e8eaf0',
                borderRadius: 20,
                padding: 22,
                flexShrink: 0,
                boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
                  }}
                >
                  {nodoSeleccionado.tipo === 'modulo' ? '■ Módulo' : '◆ Concepto'}
                </span>
                <button
                  type="button"
                  onClick={() => setNodoSeleccionado(null)}
                  aria-label="Cerrar panel"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: '#e8eaf0',
                    color: '#8892b0',
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: '3px 3px 6px #c2c8d6, -3px -3px 6px #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    margin: '0 auto 10px',
                    background: nodoSeleccionado.completado ? COLORES_MODULO[nodoSeleccionado.id]?.bg ?? '#1428d4' : '#e8eaf0',
                    boxShadow: nodoSeleccionado.completado
                      ? `0 0 20px ${COLORES_MODULO[nodoSeleccionado.id]?.glow ?? 'rgba(20,40,212,0.4)'}, 4px 4px 12px rgba(0,0,0,0.15)`
                      : '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                  }}
                >
                  {nodoSeleccionado.id === 'n1' ? (
                    '🔐'
                  ) : nodoSeleccionado.id === 'n5' ? (
                    '📊'
                  ) : nodoSeleccionado.id === 'n7' ? (
                    '💡'
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={nodoSeleccionado.completado ? 'white' : '#4a5580'} strokeWidth="2">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
                    </svg>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0a0f8a', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.3px' }}>
                {nodoSeleccionado.label}
              </h3>
              <p style={{ fontSize: 13, color: '#4a5580', lineHeight: 1.6, marginBottom: 18, textAlign: 'center', fontFamily: 'var(--font-body)' }}>
                {nodoSeleccionado.descripcion}
              </p>

              <div
                style={{
                  background: '#e8eaf0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: nodoSeleccionado.completado ? '#00e5a0' : '#c2c8d6',
                    boxShadow: nodoSeleccionado.completado ? '0 0 6px rgba(0,229,160,0.6)' : 'none',
                  }}
                />
                <span style={{ fontSize: 11, color: '#4a5580', fontFamily: "'Space Mono', monospace" }}>
                  {nodoSeleccionado.completado ? '✓ Concepto dominado' : 'Pendiente de aprender'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/curso/lecciones/${nodoSeleccionado.lessonId}`)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 13,
                  fontWeight: 700,
                  background: nodoSeleccionado.completado ? '#e8eaf0' : 'linear-gradient(135deg, #1428d4, #0a0f8a)',
                  color: nodoSeleccionado.completado ? '#4a5580' : 'white',
                  boxShadow: nodoSeleccionado.completado
                    ? '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff'
                    : '5px 5px 14px rgba(10,15,138,0.4)',
                  marginBottom: 8,
                }}
              >
                {nodoSeleccionado.completado ? '↺ Repasar' : '→ Ir a aprender esto'}
              </button>

              {nodoSeleccionado.completado && (
                <button
                  type="button"
                  onClick={() => router.push(`/curso/lecciones/${nodoSeleccionado.lessonId}`)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'rgba(0,229,160,0.1)',
                    color: '#00b87d',
                  }}
                >
                  Ver mis notas de esta lección →
                </button>
              )}
            </div>
          )}
        </div>

        {/* INSTRUCCIONES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            {
              color: '#1428d4',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" />
                </svg>
              ),
              titulo: 'Arrastra y explora',
              texto: 'Mueve los nodos para ver mejor las conexiones. La simulación de física los organiza automáticamente.',
            },
            {
              color: '#00b87d',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
              titulo: 'Azul = dominado',
              texto: 'Cada nodo que dominas brilla y muestra un ✓. Los vacíos son los próximos conceptos a aprender.',
            },
            {
              color: '#533ab7',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              ),
              titulo: 'Click para aprender',
              texto: 'Toca cualquier nodo para ver su descripción y el botón que te lleva directo a la lección.',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: '#e8eaf0',
                borderRadius: 16,
                padding: '18px 16px',
                boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `${item.color}12`,
                  border: `1.5px solid ${item.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.titulo}</p>
                <p style={{ fontSize: 12, color: '#4a5580', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{item.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div
          style={{
            background: '#e8eaf0',
            borderRadius: 14,
            padding: '14px 20px',
            marginTop: 12,
            boxShadow: 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff',
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <p style={{ fontSize: 10, color: '#8892b0', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Leyenda:
          </p>
          {[
            { color: '#1428d4', label: 'Ciberseguridad' },
            { color: '#006289', label: 'Datos Abiertos' },
            { color: '#533ab7', label: 'Innovación' },
            { bg: '#e8eaf0', border: '#c2c8d6', label: 'Pendiente' },
            { bg: '#00e5a0', label: '✓ Completado' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: (l as { bg?: string }).bg ?? (l as { color: string }).color,
                  border: (l as { border?: string }).border ? `2px solid ${(l as { border: string }).border}` : 'none',
                  boxShadow: (l as { color?: string }).color && !(l as { bg?: string }).bg ? `0 0 6px ${(l as { color: string }).color}66` : 'none',
                }}
              />
              <span style={{ fontSize: 11, color: '#4a5580' }}>{(l as { label: string }).label}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}

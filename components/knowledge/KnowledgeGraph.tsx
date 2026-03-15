'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import type { KnowledgeNode, KnowledgeLink } from '@/app/api/knowledge/route'

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[]
  links: KnowledgeLink[]
  onNodeSelect: (node: KnowledgeNode | null) => void
  selectedId: string | null
}

function getNodeRadius(type: KnowledgeNode['type']): number {
  if (type === 'modulo') return 30
  if (type === 'concepto') return 18
  return 10
}

type NodeStyle = { bg: string; glow: string; shadow: string }

function getNodeStyle(node: KnowledgeNode): NodeStyle {
  const base: Record<KnowledgeNode['status'], NodeStyle> = {
    completed: { bg: '#1428d4', glow: 'rgba(20,40,212,0.4)', shadow: 'none' },
    'in-progress': { bg: '#00e5a0', glow: 'rgba(0,229,160,0.4)', shadow: 'none' },
    pending: {
      bg: '#e8eaf0',
      glow: 'none',
      shadow: '3px 3px 6px #c2c8d6',
    },
  }
  const style = base[node.status]
  if (node.type === 'habilidad' && node.nivel) {
    if (node.nivel === 'basico') return base.pending
    if (node.nivel === 'intermedio') return base.completed
    if (node.nivel === 'avanzado') return base['in-progress']
  }
  return style
}

function getLinkStyle(completed: boolean) {
  return completed
    ? { stroke: '#1428d4', opacity: 0.6, strokeWidth: 2 }
    : { stroke: '#c2c8d6', opacity: 0.3, strokeWidth: 1 }
}

export default function KnowledgeGraph({ nodes, links, onNodeSelect, selectedId }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const stableOnSelect = useCallback(onNodeSelect, [])

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || nodes.length === 0) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    const linkData = links.map((l) => ({
      ...l,
      sourceNode: nodes.find((n) => n.id === l.source),
      targetNode: nodes.find((n) => n.id === l.target),
    })).filter((l) => l.sourceNode && l.targetNode) as Array<KnowledgeLink & { sourceNode: KnowledgeNode; targetNode: KnowledgeNode }>

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))

    d3.select(svgRef.current).call(zoom)

    const xExtent = d3.extent(nodes, (n) => n.x) as [number, number]
    const yExtent = d3.extent(nodes, (n) => n.y) as [number, number]
    const cx = (xExtent[0] + xExtent[1]) / 2
    const cy = (yExtent[0] + yExtent[1]) / 2
    const initialScale = Math.min(width, height) / 600
    const tx = width / 2 - cx * initialScale
    const ty = height / 2 - cy * initialScale
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initialScale))

    const linkGroup = g.append('g').attr('class', 'links')
    const nodeGroup = g.append('g').attr('class', 'nodes')

    linkGroup
      .selectAll('line')
      .data(linkData)
      .join('line')
      .attr('x1', (d) => d.sourceNode!.x)
      .attr('y1', (d) => d.sourceNode!.y)
      .attr('x2', (d) => d.targetNode!.x)
      .attr('y2', (d) => d.targetNode!.y)
      .attr('stroke', (d) => getLinkStyle(!!d.completed).stroke)
      .attr('stroke-opacity', (d) => getLinkStyle(!!d.completed).opacity)
      .attr('stroke-width', (d) => getLinkStyle(!!d.completed).strokeWidth)

    const drag = d3.drag<SVGGElement, KnowledgeNode>()
      .on('start', function () {
        d3.select(this).raise()
      })
      .on('drag', function (event, d) {
        d.x = event.x
        d.y = event.y
        d3.select(this).attr('transform', `translate(${d.x},${d.y})`)
        linkGroup.selectAll('line').each(function (l) {
          const link = l as typeof linkData[0]
          if (link.sourceNode!.id === d.id) {
            d3.select(this).attr('x1', d.x).attr('y1', d.y)
          }
          if (link.targetNode!.id === d.id) {
            d3.select(this).attr('x2', d.x).attr('y2', d.y)
          }
        })
      })

    const nodeEnter = nodeGroup
      .selectAll<SVGGElement, KnowledgeNode>('g')
      .data(nodes)
      .join('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .attr('cursor', 'pointer')
      .style('outline', 'none')
      .call(drag)

    nodeEnter.append('circle')
      .attr('r', (d) => getNodeRadius(d.type))
      .attr('fill', (d) => getNodeStyle(d).bg)
      .attr('stroke', 'none')
      .each(function (d) {
        const style = getNodeStyle(d)
        const filter = style.glow && style.glow !== 'none'
          ? `drop-shadow(0 0 12px ${style.glow})`
          : `drop-shadow(${style.shadow})`
        d3.select(this).style('filter', filter)
      })

    let tooltipEl: HTMLDivElement | null = null

    nodeEnter
      .on('click', (event, d) => {
        event.stopPropagation()
        stableOnSelect(d)
      })
      .on('mouseover', function (event, d) {
        d3.select(this).select('circle').transition().duration(150).attr('r', getNodeRadius(d.type) * 1.2)
        if (tooltipEl) tooltipEl.remove()
        const rect = containerRef.current!.getBoundingClientRect()
        tooltipEl = document.createElement('div')
        tooltipEl.className = 'knowledge-tooltip'
        tooltipEl.setAttribute('role', 'tooltip')
        Object.assign(tooltipEl.style, {
          position: 'absolute',
          left: `${event.clientX - rect.left + 12}px`,
          top: `${event.clientY - rect.top + 12}px`,
          pointerEvents: 'none',
          zIndex: '10',
          background: '#e8eaf0',
          borderRadius: '12px',
          padding: '8px 12px',
          boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
          fontFamily: "'Syne', sans-serif",
          fontSize: '12px',
          color: '#0a0f8a',
          fontWeight: '600',
        })
        tooltipEl.innerHTML = `${d.label}<br/><span style="font-weight:400;color:#4a5580">${d.dominioPercent ?? 0}% completado</span>`
        containerRef.current!.appendChild(tooltipEl)
      })
      .on('mouseout', function (_, d) {
        d3.select(this).select('circle').transition().duration(150).attr('r', getNodeRadius(d.type))
        if (tooltipEl) {
          tooltipEl.remove()
          tooltipEl = null
        }
      })

    return () => {
      d3.selectAll('.knowledge-tooltip').remove()
    }
  }, [nodes, links, stableOnSelect])

  useEffect(() => {
    if (!svgRef.current) return
    const g = d3.select(svgRef.current).selectChild<SVGGElement>()
    if (g.empty()) return
    g.selectAll('.nodes g').each(function (d) {
      const node = d as KnowledgeNode
      if (node.id === selectedId) {
        d3.select(this).select('circle').style('filter', 'drop-shadow(0 0 14px rgba(20,40,212,0.6))')
      } else {
        const style = getNodeStyle(node)
        const filter = style.glow && style.glow !== 'none'
          ? `drop-shadow(0 0 12px ${style.glow})`
          : `drop-shadow(${style.shadow})`
        d3.select(this).select('circle').style('filter', filter)
      }
    })
  }, [selectedId, nodes])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Red neuronal de conocimiento"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 480,
        background: '#e8eaf0',
        borderRadius: 16,
        boxShadow: 'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff',
        position: 'relative',
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        onClick={() => stableOnSelect(null)}
      />
    </div>
  )
}

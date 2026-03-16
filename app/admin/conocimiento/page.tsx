"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import type { KnowledgeNode } from "@/lib/types/knowledge-graph";
import * as d3 from "d3";

function slug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "concepto";
}

export default function AdminConocimientoPage() {
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [institutionId, setInstitutionId] = useState("default");
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [learners, setLearners] = useState<{ userId: string; lessonId: string; completedAt: string; userName?: string }[]>([]);
  const [editingNode, setEditingNode] = useState<KnowledgeNode | null>(null);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [formConcepto, setFormConcepto] = useState("");
  const [formModulo, setFormModulo] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/conocimiento/institutions", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { institutions: [] }))
      .then((d) => {
        const list = d.institutions ?? [];
        setInstitutions(list);
        if (list.length > 0 && !list.includes(institutionId)) setInstitutionId(list[0]);
      })
      .catch(() => {});
  }, []);

  const fetchNodes = useCallback(() => {
    if (!institutionId) return;
    setLoading(true);
    fetch(`/api/admin/conocimiento?institutionId=${encodeURIComponent(institutionId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { nodes: [] }))
      .then((d) => setNodes(d.nodes ?? []))
      .catch(() => setNodes([]))
      .finally(() => setLoading(false));
  }, [institutionId]);

  useEffect(() => {
    if (!institutionId) return;
    fetchNodes();
  }, [institutionId, fetchNodes]);

  const handleSaveNode = async () => {
    if (!formConcepto.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/conocimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          institutionId,
          conceptId: editingNode?.id,
          concepto: formConcepto.trim(),
          modulo: formModulo.trim(),
          relacionados: editingNode?.relacionados ?? [],
        }),
      });
      if (res.ok) {
        setEditingNode(null);
        setShowNodeForm(false);
        setFormConcepto("");
        setFormModulo("");
        fetchNodes();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNode = async (conceptId: string) => {
    if (!confirm("¿Eliminar este nodo?")) return;
    setDeleting(conceptId);
    try {
      const res = await fetch(
        `/api/admin/conocimiento?institutionId=${encodeURIComponent(institutionId)}&conceptId=${encodeURIComponent(conceptId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setSelectedNode(null);
        fetchNodes();
      }
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (selectedNode) {
      fetch(
        `/api/admin/conocimiento/learners?institutionId=${encodeURIComponent(institutionId)}&conceptId=${encodeURIComponent(selectedNode.id)}`,
        { credentials: "include" }
      )
        .then((r) => (r.ok ? r.json() : { learners: [] }))
        .then((d) => setLearners(d.learners ?? []))
        .catch(() => setLearners([]));
    } else {
      setLearners([]);
    }
  }, [selectedNode, institutionId]);

  const drawGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;
    const width = containerRef.current.clientWidth || 800;
    const height = 500;
    d3.select(svgRef.current).selectAll("*").remove();

    const idSet = new Set(nodes.map((n) => n.id));
    const links: { source: string; target: string }[] = [];
    nodes.forEach((n) => {
      (n.relacionados || []).forEach((r) => {
        const targetId = slug(r);
        if (targetId !== n.id && idSet.has(targetId)) links.push({ source: n.id, target: targetId });
      });
    });
    const nodeData = nodes.map((n) => ({ ...n, x: width / 2, y: height / 2 }));

    const simulation = d3
      .forceSimulation(nodeData as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(links).id((d) => (d as { id: string }).id).distance(80))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "var(--line)")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    const maxUsuarios = Math.max(1, ...nodes.map((n) => n.usuariosQueLoDominan));
    const scaleRadius = d3.scaleSqrt().domain([0, maxUsuarios]).range([8, 32]);

    const dragBehavior = d3
        .drag<SVGGElement, KnowledgeNode & { x?: number; y?: number }>()
        .on("start", (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        });
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .attr("cursor", "pointer")
      .call(dragBehavior as any);

    node
      .append("circle")
      .attr("r", (d) => scaleRadius(d.usuariosQueLoDominan))
      .attr("fill", (d) => {
        const n = d.nivelPromedio ?? 0;
        if (n >= 70) return "var(--success)";
        if (n >= 40) return "var(--primary)";
        return "var(--ink-muted)";
      })
      .attr("stroke", "var(--surface)")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d) => d.concepto.length > 12 ? d.concepto.slice(0, 11) + "…" : d.concepto)
      .attr("font-size", 10)
      .attr("dx", (d) => scaleRadius(d.usuariosQueLoDominan) + 4)
      .attr("dy", "0.35em")
      .attr("fill", "var(--ink)");

    node.append("title").text((d) => `${d.usuariosQueLoDominan} empleados dominan este concepto`);

    node.on("click", (_event, d) => setSelectedNode(d));

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as { x?: number }).x ?? 0)
        .attr("y1", (d) => (d.source as { y?: number }).y ?? 0)
        .attr("x2", (d) => (d.target as { x?: number }).x ?? 0)
        .attr("y2", (d) => (d.target as { y?: number }).y ?? 0);
      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });
  }, [nodes]);

  useEffect(() => {
    if (nodes.length === 0) return;
    drawGraph();
  }, [nodes, drawGraph]);

  const fortalezas = [...nodes].sort((a, b) => b.usuariosQueLoDominan - a.usuariosQueLoDominan).slice(0, 5);
  const brechas = [...nodes].sort((a, b) => a.usuariosQueLoDominan - b.usuariosQueLoDominan).slice(0, 5);
  const moduloMasDebil = brechas[0]?.modulo?.trim();
  const recomendacion = moduloMasDebil
    ? `Priorizar el módulo "${moduloMasDebil}" para cerrar brechas de conocimiento.`
    : "Completar más lecciones para enriquecer el mapa.";

  const exportAsImage = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const vw = svgEl.viewBox.baseVal.width;
    const vh = svgEl.viewBox.baseVal.height;
    canvas.width = vw;
    canvas.height = vh;
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = "#f0f2f5";
      ctx.fillRect(0, 0, vw, vh);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = `mapa-conocimiento-${institutionId}-${Date.now()}.png`;
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="heading-section mb-2">Mapa de conocimiento institucional</h1>
      <p className="text-[var(--ink-muted)] mb-6">
        Red neuronal del conocimiento colectivo. Se alimenta cuando los alumnos completan lecciones.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--ink)]">Institución</span>
          <select
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
          >
            <option value="default">default</option>
            {institutions.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </label>
        <SecondaryButton onClick={exportAsImage} disabled={nodes.length === 0}>
          Exportar como imagen
        </SecondaryButton>
      </div>

      {loading ? (
        <SurfaceCard padding="lg" clickable={false}>
          <p className="text-[var(--ink-muted)]">Cargando grafo…</p>
        </SurfaceCard>
      ) : nodes.length === 0 ? (
        <SurfaceCard padding="lg" clickable={false}>
          <p className="text-[var(--ink-muted)]">
            Aún no hay datos. El grafo se construye cuando los alumnos completan lecciones (Claude extrae conceptos clave).
          </p>
        </SurfaceCard>
      ) : (
        <>
          <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace" }}>
                Nodos del grafo · Aprendices
              </p>
              <button
                type="button"
                onClick={() => { setShowNodeForm(true); setEditingNode(null); setFormConcepto(""); setFormModulo(""); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                  color: "white",
                  boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
                }}
              >
                Agregar nodo
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#8892b0", fontWeight: 600 }}>Concepto</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#8892b0", fontWeight: 600 }}>Módulo</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#8892b0", fontWeight: 600 }}>Aprendices</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#8892b0", fontWeight: 600 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((n) => (
                    <tr
                      key={n.id}
                      style={{ cursor: "pointer", background: selectedNode?.id === n.id ? "rgba(20,40,212,0.08)" : "transparent" }}
                      onClick={() => setSelectedNode(n)}
                    >
                      <td style={{ padding: "10px 12px", color: "#0a0f8a", fontFamily: "'Syne', sans-serif" }}>{n.concepto}</td>
                      <td style={{ padding: "10px 12px", color: "#8892b0" }}>{n.modulo || "—"}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "'Space Mono', monospace", color: "#1428d4" }}>{n.usuariosQueLoDominan}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShowNodeForm(true); setEditingNode(n); setFormConcepto(n.concepto); setFormModulo(n.modulo); }}
                          style={{ marginRight: 8, padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, background: "#e8eaf0", boxShadow: "inset 2px 2px 4px #c2c8d6", color: "#0a0f8a" }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteNode(n.id); }}
                          disabled={deleting === n.id}
                          style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, background: "rgba(216,64,64,0.15)", color: "#d84040" }}
                        >
                          {deleting === n.id ? "…" : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(showNodeForm || editingNode !== null) && (
            <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>
                {editingNode ? "Editar nodo" : "Nuevo nodo"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
                <input
                  placeholder="Concepto"
                  value={formConcepto}
                  onChange={(e) => setFormConcepto(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#e8eaf0", boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff", color: "#0a0f8a", fontFamily: "'Syne', sans-serif" }}
                />
                <input
                  placeholder="Módulo"
                  value={formModulo}
                  onChange={(e) => setFormModulo(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#e8eaf0", boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff", color: "#0a0f8a", fontFamily: "'Syne', sans-serif" }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={handleSaveNode} disabled={saving} style={{ padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #1428d4, #0a0f8a)", color: "white", boxShadow: "4px 4px 10px rgba(10,15,138,0.3)" }}>
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                  <button type="button" onClick={() => { setShowNodeForm(false); setEditingNode(null); setFormConcepto(""); setFormModulo(""); }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: "#e8eaf0", boxShadow: "inset 3px 3px 8px #c2c8d6", color: "#0a0f8a" }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <SurfaceCard padding="md" clickable={false} className="mb-6">
            <div ref={containerRef} className="w-full overflow-hidden rounded-xl bg-[var(--surface-soft)]">
              <svg ref={svgRef} className="w-full" style={{ minHeight: 500 }} />
            </div>
            <p className="text-xs text-[var(--ink-muted)] mt-2">
              Tamaño = empleados que dominan el concepto. Verde = alto dominio, azul = medio, gris = bajo. Arrastra nodos. Clic para ver quiénes lo aprendieron.
            </p>
          </SurfaceCard>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <SurfaceCard padding="lg" clickable={false}>
              <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Fortalezas</h2>
              <p className="text-sm text-[var(--ink-muted)] mb-2">Conceptos más dominados</p>
              <ul className="space-y-1">
                {fortalezas.map((n) => (
                  <li key={n.id} className="text-sm text-[var(--ink)]">
                    {n.concepto} — {n.usuariosQueLoDominan} empleados
                  </li>
                ))}
              </ul>
            </SurfaceCard>
            <SurfaceCard padding="lg" clickable={false}>
              <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Brechas</h2>
              <p className="text-sm text-[var(--ink-muted)] mb-2">Conceptos a reforzar</p>
              <ul className="space-y-1">
                {brechas.map((n) => (
                  <li key={n.id} className="text-sm text-[var(--ink)]">
                    {n.concepto} — {n.usuariosQueLoDominan} empleados
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </div>

          <SurfaceCard padding="lg" clickable={false} className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">Recomendación</h2>
            <p className="text-[var(--ink)]">{recomendacion}</p>
          </SurfaceCard>

          {selectedNode && (
            <SurfaceCard padding="lg" clickable={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--ink)]">
                  Quiénes aprendieron: {selectedNode.concepto}
                </h2>
                <SecondaryButton onClick={() => setSelectedNode(null)}>Cerrar</SecondaryButton>
              </div>
              <ul className="space-y-2 text-sm">
                {learners.map((l) => (
                  <li key={l.userId + l.lessonId}>
                    {l.userName || l.userId} — lección {l.lessonId} — {l.completedAt ? new Date(l.completedAt).toLocaleDateString("es-MX") : ""}
                  </li>
                ))}
                {learners.length === 0 && <li className="text-[var(--ink-muted)]">Sin datos de aprendices</li>}
              </ul>
            </SurfaceCard>
          )}
        </>
      )}
    </div>
  );
}

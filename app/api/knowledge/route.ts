import { NextResponse } from "next/server";

export type NodeStatus = "completed" | "in-progress" | "pending";
export type NodeType = "modulo" | "concepto" | "habilidad";
export type HabilidadNivel = "basico" | "intermedio" | "avanzado";

export interface KnowledgeNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  x: number;
  y: number;
  nivel?: HabilidadNivel;
  descripcion?: string;
  moduloId?: string;
  moduloNombre?: string;
  dominioPercent?: number;
  lessonIds?: string[];
  connectedIds?: string[];
}

export interface KnowledgeLink {
  source: string;
  target: string;
  completed?: boolean;
}

export interface KnowledgeGraphResponse {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
}

const NODES: KnowledgeNode[] = [
  { id: "n1", label: "Ciberseguridad", type: "modulo", status: "completed", x: 200, y: 300, descripcion: "Protección de sistemas y datos del gobierno" },
  { id: "n2", label: "Cifrado E2E", type: "concepto", status: "completed", x: 100, y: 200, descripcion: "Encriptación de extremo a extremo AES-256" },
  { id: "n3", label: "Zero Trust", type: "concepto", status: "pending", x: 200, y: 150, descripcion: "Nunca confíes, siempre verifica" },
  { id: "n4", label: "LFPDPPP", type: "concepto", status: "pending", x: 300, y: 200, descripcion: "Ley de protección de datos personales MX" },
  { id: "n5", label: "Datos Abiertos", type: "modulo", status: "pending", x: 450, y: 300, descripcion: "Transparencia y acceso a la información" },
  { id: "n6", label: "Formatos Abiertos", type: "concepto", status: "pending", x: 450, y: 200, descripcion: "CSV, JSON, GeoJSON para datos públicos" },
  { id: "n7", label: "Innovación Pública", type: "modulo", status: "pending", x: 700, y: 300, descripcion: "Transformar servicios de gobierno" },
  { id: "n8", label: "Design Thinking", type: "concepto", status: "pending", x: 600, y: 200, descripcion: "5 etapas centradas en el ciudadano" },
  { id: "n9", label: "Metodologías Ágiles", type: "concepto", status: "pending", x: 800, y: 200, descripcion: "Scrum y Kanban para gobierno" },
];

const LINKS: KnowledgeLink[] = [
  { source: "n1", target: "n2" },
  { source: "n1", target: "n3" },
  { source: "n1", target: "n4" },
  { source: "n5", target: "n6" },
  { source: "n7", target: "n8" },
  { source: "n7", target: "n9" },
  { source: "n3", target: "n4" },
  { source: "n5", target: "n7" },
];

export async function GET() {
  return NextResponse.json({
    nodes: NODES,
    links: LINKS,
  } satisfies KnowledgeGraphResponse);
}

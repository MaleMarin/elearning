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
  {
    id: "ciberseguridad",
    label: "Ciberseguridad",
    type: "modulo",
    status: "completed",
    x: 400,
    y: 300,
    descripcion: "Fundamentos de ciberseguridad en el sector público.",
    moduloNombre: "Ciberseguridad",
    dominioPercent: 85,
    lessonIds: ["lec-1", "lec-2", "lec-3"],
    connectedIds: ["cifrado", "autenticacion", "zero-trust"],
  },
  {
    id: "cifrado",
    label: "Cifrado E2E",
    type: "concepto",
    status: "completed",
    x: 250,
    y: 200,
    descripcion: "Cifrado de extremo a extremo para proteger datos.",
    moduloId: "ciberseguridad",
    moduloNombre: "Ciberseguridad",
    dominioPercent: 90,
    lessonIds: ["lec-1"],
    connectedIds: ["aes256"],
  },
  {
    id: "autenticacion",
    label: "Autenticación",
    type: "concepto",
    status: "in-progress",
    x: 400,
    y: 150,
    descripcion: "Mecanismos de autenticación y autorización.",
    moduloId: "ciberseguridad",
    moduloNombre: "Ciberseguridad",
    dominioPercent: 60,
    lessonIds: ["lec-2"],
    connectedIds: ["jwt"],
  },
  {
    id: "zero-trust",
    label: "Zero Trust",
    type: "concepto",
    status: "pending",
    x: 550,
    y: 200,
    descripcion: "Modelo de seguridad Zero Trust.",
    moduloId: "ciberseguridad",
    moduloNombre: "Ciberseguridad",
    dominioPercent: 0,
    lessonIds: ["lec-3"],
    connectedIds: [],
  },
  {
    id: "aes256",
    label: "AES-256",
    type: "habilidad",
    status: "completed",
    x: 180,
    y: 130,
    nivel: "avanzado",
    descripcion: "Algoritmo de cifrado simétrico.",
    moduloId: "ciberseguridad",
    moduloNombre: "Ciberseguridad",
    dominioPercent: 80,
    lessonIds: ["lec-1"],
    connectedIds: ["cifrado"],
  },
  {
    id: "jwt",
    label: "JWT Tokens",
    type: "habilidad",
    status: "in-progress",
    x: 380,
    y: 80,
    nivel: "intermedio",
    descripcion: "Tokens JWT para sesiones.",
    moduloId: "ciberseguridad",
    moduloNombre: "Ciberseguridad",
    dominioPercent: 50,
    lessonIds: ["lec-2"],
    connectedIds: ["autenticacion"],
  },
  {
    id: "innovacion",
    label: "Innovación Pública",
    type: "modulo",
    status: "pending",
    x: 650,
    y: 350,
    descripcion: "Innovación y transformación digital en gobierno.",
    moduloNombre: "Innovación Pública",
    dominioPercent: 0,
    lessonIds: [],
    connectedIds: [],
  },
];

const LINKS: KnowledgeLink[] = [
  { source: "ciberseguridad", target: "cifrado", completed: true },
  { source: "ciberseguridad", target: "autenticacion", completed: true },
  { source: "ciberseguridad", target: "zero-trust", completed: false },
  { source: "cifrado", target: "aes256", completed: true },
  { source: "autenticacion", target: "jwt", completed: true },
];

export async function GET() {
  return NextResponse.json({
    nodes: NODES,
    links: LINKS,
  } satisfies KnowledgeGraphResponse);
}

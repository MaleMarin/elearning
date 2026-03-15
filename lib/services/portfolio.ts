/**
 * Portafolio de transformación — Firestore users/{uid}/portfolio/{projectId} (Brecha 5).
 */

import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { PortfolioProject, PortfolioProjectInput, EstadoProyecto } from "@/lib/types/portfolio";

const COLL = "portfolio";

function toIso(v: unknown): string {
  if (v == null) return "";
  if (typeof (v as { toDate?: () => Date }).toDate === "function") return (v as { toDate: () => Date }).toDate().toISOString();
  if (typeof v === "string") return v;
  return "";
}

function serialize(d: DocumentSnapshot): PortfolioProject | null {
  const data = d.data();
  if (!data) return null;
  return {
    id: d.id,
    titulo: String(data.titulo ?? ""),
    institucion: String(data.institucion ?? ""),
    problema: String(data.problema ?? ""),
    solucion: String(data.solucion ?? ""),
    resultado: String(data.resultado ?? ""),
    ciudadanosBeneficiados: Number(data.ciudadanosBeneficiados) || 0,
    modulos: Array.isArray(data.modulos) ? data.modulos.map(String) : [],
    evidencias: Array.isArray(data.evidencias) ? data.evidencias.map(String) : [],
    estadoProyecto: (["idea", "en_progreso", "implementado", "escalado"].includes(data.estadoProyecto)
      ? data.estadoProyecto
      : "en_progreso"),
    fechaInicio: String(data.fechaInicio ?? ""),
    evaluacionClaude: String(data.evaluacionClaude ?? ""),
    scoreImpacto: Number(data.scoreImpacto) || 0,
    publico: Boolean(data.publico),
    createdAt: toIso(data.createdAt) || new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) || undefined,
  };
}

export async function createProject(uid: string, input: PortfolioProjectInput): Promise<PortfolioProject> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("users").doc(uid).collection(COLL).doc();
  const now = new Date();
  const data = {
    titulo: input.titulo.trim(),
    institucion: input.institucion.trim(),
    problema: input.problema.trim(),
    solucion: input.solucion.trim(),
    resultado: input.resultado.trim(),
    ciudadanosBeneficiados: Math.max(0, input.ciudadanosBeneficiados),
    modulos: Array.isArray(input.modulos) ? input.modulos : [],
    evidencias: Array.isArray(input.evidencias) ? input.evidencias : [],
    estadoProyecto: input.estadoProyecto || "en_progreso",
    fechaInicio: input.fechaInicio.trim() || now.toISOString().slice(0, 10),
    evaluacionClaude: input.evaluacionClaude ?? "",
    scoreImpacto: input.scoreImpacto ?? 0,
    publico: input.publico ?? false,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(data);
  const snap = await ref.get();
  const out = serialize(snap);
  if (!out) throw new Error("Error al crear proyecto de portafolio");
  return out;
}

export async function getProject(uid: string, projectId: string): Promise<PortfolioProject | null> {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("users").doc(uid).collection(COLL).doc(projectId).get();
  if (!snap.exists) return null;
  return serialize(snap);
}

export async function listProjectsByUser(uid: string): Promise<PortfolioProject[]> {
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection(COLL)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map(serialize).filter(Boolean) as PortfolioProject[];
}

export async function updateProject(
  uid: string,
  projectId: string,
  updates: Partial<PortfolioProjectInput> & { evaluacionClaude?: string; scoreImpacto?: number }
): Promise<PortfolioProject | null> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("users").doc(uid).collection(COLL).doc(projectId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const now = new Date();
  const toSet: Record<string, unknown> = { updatedAt: now };
  if (updates.titulo !== undefined) toSet.titulo = updates.titulo.trim();
  if (updates.institucion !== undefined) toSet.institucion = updates.institucion.trim();
  if (updates.problema !== undefined) toSet.problema = updates.problema.trim();
  if (updates.solucion !== undefined) toSet.solucion = updates.solucion.trim();
  if (updates.resultado !== undefined) toSet.resultado = updates.resultado.trim();
  if (updates.ciudadanosBeneficiados !== undefined) toSet.ciudadanosBeneficiados = Math.max(0, updates.ciudadanosBeneficiados);
  if (updates.modulos !== undefined) toSet.modulos = updates.modulos;
  if (updates.evidencias !== undefined) toSet.evidencias = updates.evidencias;
  if (updates.estadoProyecto !== undefined) toSet.estadoProyecto = updates.estadoProyecto;
  if (updates.fechaInicio !== undefined) toSet.fechaInicio = updates.fechaInicio.trim();
  if (updates.evaluacionClaude !== undefined) toSet.evaluacionClaude = updates.evaluacionClaude;
  if (updates.scoreImpacto !== undefined) toSet.scoreImpacto = updates.scoreImpacto;
  if (updates.publico !== undefined) toSet.publico = updates.publico;
  await ref.update(toSet);
  const updated = await ref.get();
  return serialize(updated);
}

export interface GaleriaFilters {
  institucion?: string;
  modulo?: string;
  estadoProyecto?: EstadoProyecto;
}

/** Proyectos públicos para la galería (solo publico === true). */
export async function getPublicProjects(filters: GaleriaFilters = {}): Promise<PortfolioProject[]> {
  const db = getFirebaseAdminFirestore();
  let query = db.collectionGroup(COLL).where("publico", "==", true);
  const snapshot = await query.get();
  let list = snapshot.docs
    .map((d) => {
      const data = d.data();
      const createdAt = data.createdAt;
      return {
        id: d.id,
        userId: d.ref.parent.parent?.id,
        titulo: String(data.titulo ?? ""),
        institucion: String(data.institucion ?? ""),
        problema: String(data.problema ?? ""),
        solucion: String(data.solucion ?? ""),
        resultado: String(data.resultado ?? ""),
        ciudadanosBeneficiados: Number(data.ciudadanosBeneficiados) || 0,
        modulos: Array.isArray(data.modulos) ? data.modulos : [],
        evidencias: Array.isArray(data.evidencias) ? data.evidencias : [],
        estadoProyecto: data.estadoProyecto ?? "en_progreso",
        fechaInicio: String(data.fechaInicio ?? ""),
        evaluacionClaude: String(data.evaluacionClaude ?? ""),
        scoreImpacto: Number(data.scoreImpacto) || 0,
        publico: true,
        createdAt: toIso(data.createdAt),
      } as PortfolioProject & { userId?: string };
    })
    .filter((p) => p.titulo || p.problema);

  if (filters.institucion?.trim()) {
    const low = filters.institucion.trim().toLowerCase();
    list = list.filter((p) => p.institucion.toLowerCase().includes(low));
  }
  if (filters.modulo?.trim()) {
    const low = filters.modulo.trim().toLowerCase();
    list = list.filter((p) => p.modulos.some((m) => String(m).toLowerCase().includes(low)));
  }
  if (filters.estadoProyecto) {
    list = list.filter((p) => p.estadoProyecto === filters.estadoProyecto);
  }
  list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return list;
}

/** Proyecto principal del usuario para el certificado (el más reciente con mayor impacto o implementado/escalado). */
export async function getPrimaryProjectForCertificate(uid: string): Promise<PortfolioProject | null> {
  const list = await listProjectsByUser(uid);
  const preferido = list.find((p) => p.estadoProyecto === "implementado" || p.estadoProyecto === "escalado");
  return preferido ?? list[0] ?? null;
}

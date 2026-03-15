/**
 * Grafo de conocimiento institucional — Firestore institutions/{id}/knowledgeGraph (Brecha 6).
 * Se alimenta al completar lecciones: Claude extrae conceptos y se actualizan los nodos.
 */
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";
import type { KnowledgeNode } from "@/lib/types/knowledge-graph";

const COLL = "knowledgeGraph";
const LEARNERS = "learners";

function slug(concepto: string): string {
  return concepto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "concepto";
}

function toIso(v: unknown): string {
  if (v == null) return "";
  const d = v as { toDate?: () => Date };
  return typeof d?.toDate === "function" ? d.toDate().toISOString() : String(v);
}

/**
 * Extrae hasta 5 conceptos clave del texto de la lección usando Claude.
 */
export async function extractConcepts(lessonContent: string): Promise<string[]> {
  const text = lessonContent.substring(0, 4000).trim();
  if (!text) return [];
  try {
    const { model } = await getModelWithFallback("anthropic");
    const { text: out } = await generateText({
      model,
      ...({ maxTokens: 500 } as Record<string, unknown>),
      prompt: `Extrae exactamente 5 conceptos clave de esta lección de política pública o innovación gubernamental.
Responde ÚNICAMENTE con un JSON válido, sin markdown, sin texto antes o después:
{"conceptos": ["concepto1", "concepto2", "concepto3", "concepto4", "concepto5"]}
Si hay menos de 5 conceptos claros, devuelve los que identifiques.
Lección:
${text}`,
    });
    const cleaned = out.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
    const parsed = JSON.parse(cleaned) as { conceptos?: string[] };
    const list = Array.isArray(parsed.conceptos) ? parsed.conceptos.map((c) => String(c).trim()).filter(Boolean) : [];
    return list.slice(0, 5);
  } catch {
    return [];
  }
}

/**
 * Obtiene el id de institución para un usuario: tenantId (claim) o institution del perfil o "default".
 */
export async function getInstitutionIdForUser(userId: string): Promise<string> {
  const db = getFirebaseAdminFirestore();
  const profile = await db.collection("profiles").doc(userId).get();
  const data = profile.data();
  const institution = (data?.institution as string)?.trim();
  if (institution) return slug(institution).slice(0, 100) || "default";
  return "default";
}

/**
 * Actualiza el grafo de conocimiento con los conceptos extraídos de una lección completada.
 * institutionId: id de la institución (tenant o slug del perfil).
 */
export async function addConceptsToGraph(
  institutionId: string,
  conceptos: string[],
  options: { userId: string; lessonId: string; moduleTitle: string }
): Promise<void> {
  if (!institutionId.trim() || conceptos.length === 0) return;
  const db = getFirebaseAdminFirestore();
  const now = Timestamp.now();
  const instRef = db.collection("institutions").doc(institutionId.trim());
  const graphRef = instRef.collection(COLL);

  for (const concepto of conceptos) {
    const key = slug(concepto);
    if (!key) continue;
    const nodeRef = graphRef.doc(key);
    const snap = await nodeRef.get();
    const data = snap.data();
    const usuariosAntes = Number(data?.usuariosQueLoDominan ?? 0);
    const nivelAntes = Number(data?.nivelPromedio ?? 50);
    const nuevosUsuarios = usuariosAntes + 1;
    const nivelPromedio = Math.round((nivelAntes * usuariosAntes + 70) / nuevosUsuarios);
    const relacionados = Array.isArray(data?.relacionados) ? (data.relacionados as string[]) : [];
    await nodeRef.set({
      concepto: concepto.trim(),
      usuariosQueLoDominan: nuevosUsuarios,
      nivelPromedio: Math.min(100, Math.max(0, nivelPromedio)),
      relacionados,
      modulo: options.moduleTitle || (data?.modulo as string) || "",
      ultimaActualizacion: now,
    });
    await nodeRef.collection(LEARNERS).doc(options.userId).set({
      userId: options.userId,
      lessonId: options.lessonId,
      completedAt: now,
    });
  }
}

/**
 * Llamar tras completar una lección: extrae conceptos y actualiza el grafo de la institución del usuario.
 */
export async function extractConceptsAndUpdateGraph(
  lessonContent: string,
  userId: string,
  institutionId: string,
  lessonId: string,
  moduleTitle: string
): Promise<void> {
  const conceptos = await extractConcepts(lessonContent);
  if (conceptos.length === 0) return;
  await addConceptsToGraph(institutionId, conceptos, { userId, lessonId, moduleTitle });
}

/**
 * Lista todos los nodos del grafo de una institución (para admin).
 */
export async function getKnowledgeGraph(institutionId: string): Promise<KnowledgeNode[]> {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("institutions").doc(institutionId).collection(COLL).get();
  const list: KnowledgeNode[] = [];
  for (const d of snap.docs) {
    const data = d.data();
    list.push({
      id: d.id,
      concepto: String(data.concepto ?? d.id),
      usuariosQueLoDominan: Number(data.usuariosQueLoDominan) || 0,
      nivelPromedio: Number(data.nivelPromedio) || 0,
      relacionados: Array.isArray(data.relacionados) ? data.relacionados : [],
      modulo: String(data.modulo ?? ""),
      ultimaActualizacion: toIso(data.ultimaActualizacion),
    });
  }
  return list;
}

/**
 * Lista instituciones que tienen al menos un nodo (para selector en admin).
 */
export async function listInstitutionsWithKnowledge(): Promise<string[]> {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("institutions").get();
  const ids: string[] = [];
  for (const d of snap.docs) {
    const sub = await d.ref.collection(COLL).limit(1).get();
    if (!sub.empty) ids.push(d.id);
  }
  return ids;
}

/**
 * Learners de un concepto (quiénes lo aprendieron y en qué lección).
 */
export async function getLearnersForConcept(
  institutionId: string,
  conceptId: string
): Promise<{ userId: string; lessonId: string; completedAt: string; userName?: string }[]> {
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection("institutions")
    .doc(institutionId)
    .collection(COLL)
    .doc(conceptId)
    .collection(LEARNERS)
    .orderBy("completedAt", "desc")
    .limit(50)
    .get();
  const list: { userId: string; lessonId: string; completedAt: string; userName?: string }[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: String(data.userId ?? d.id),
      lessonId: String(data.lessonId ?? ""),
      completedAt: toIso(data.completedAt),
    };
  });
  for (const item of list) {
    const profile = await db.collection("profiles").doc(item.userId).get();
    item.userName = (profile.data()?.full_name as string) ?? undefined;
  }
  return list;
}

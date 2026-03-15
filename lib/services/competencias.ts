/**
 * Competencias SPC: catálogo en Firestore /competencias/{id}.
 * Listado, seed de las 8 competencias, reporte PDF y evidencia por módulo.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { Competencia, NivelCompetencia, LessonCompetencia } from "../types/competencias";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";

const COLLECTION = "competencias";
const FUENTE_OFICIAL = "Acuerdo SFP DOF 2025 · Servicio Profesional de Carrera";

const DEFAULT_COMPETENCIAS: Omit<Competencia, "id">[] = [
  { nombre: "Orientación a resultados", descripcion: "Establece metas claras y medibles, y evalúa el avance.", nivel: "basico", area: "gestion", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Establece metas medibles", "Monitorea avances", "Ajusta acciones según resultados"] },
  { nombre: "Trabajo en equipo", descripcion: "Colabora de forma efectiva con otros para lograr objetivos comunes.", nivel: "basico", area: "transversal", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Contribuye al objetivo del equipo", "Comunica con claridad", "Respeta y escucha a otros"] },
  { nombre: "Liderazgo", descripcion: "Influencia positiva para guiar a otros hacia metas compartidas.", nivel: "basico", area: "directiva", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Motiva e inspira", "Delega con claridad", "Asume responsabilidad"] },
  { nombre: "Visión estratégica", descripcion: "Anticipa escenarios y alinea acciones con objetivos de largo plazo.", nivel: "basico", area: "directiva", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Analiza tendencias", "Propone líneas de acción", "Prioriza recursos"] },
  { nombre: "Innovación", descripcion: "Propone y aplica ideas nuevas que agregan valor.", nivel: "basico", area: "tecnica", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Identifica oportunidades de mejora", "Prueba soluciones nuevas", "Documenta y comparte aprendizajes"] },
  { nombre: "Gestión del cambio", descripcion: "Adapta procesos y comportamientos ante nuevos contextos.", nivel: "basico", area: "gestion", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Acepta y promueve el cambio", "Comunica beneficios", "Acompaña la transición"] },
  { nombre: "Orientación al ciudadano", descripcion: "Coloca al ciudadano en el centro del diseño de servicios.", nivel: "basico", area: "transversal", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Conoce necesidades del usuario", "Simplifica trámites y servicios", "Evalúa la experiencia"] },
  { nombre: "Toma de decisiones", descripcion: "Analiza información y elige opciones con criterio y oportunidad.", nivel: "basico", area: "gestion", fuenteOficial: FUENTE_OFICIAL, indicadores: ["Recopila y analiza datos", "Evalúa riesgos y beneficios", "Decide y comunica"] },
];

function db() {
  return getFirebaseAdminFirestore();
}

export async function listCompetencias(): Promise<Competencia[]> {
  const snap = await db().collection(COLLECTION).orderBy("nombre").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Competencia));
}

export async function getCompetenciaById(id: string): Promise<Competencia | null> {
  const doc = await db().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Competencia;
}

/** Carga las 8 competencias SPC si la colección está vacía. */
export async function seedDefaultCompetencias(): Promise<{ created: number }> {
  const existing = await db().collection(COLLECTION).limit(1).get();
  if (!existing.empty) return { created: 0 };
  let created = 0;
  for (const c of DEFAULT_COMPETENCIAS) {
    const ref = db().collection(COLLECTION).doc();
    await ref.set({ ...c, id: ref.id });
    created++;
  }
  return { created };
}

export async function getLessonCompetencias(lessonId: string): Promise<LessonCompetencia[]> {
  const doc = await db().collection("lessons").doc(lessonId).get();
  if (!doc.exists) return [];
  const data = doc.data() as { competencias?: LessonCompetencia[] };
  return Array.isArray(data?.competencias) ? data.competencias : [];
}

/** Evidencia: por cada competencia, en qué módulos/lecciones se desarrolló. */
export async function getEvidenciaByUser(
  userId: string,
  courseId: string
): Promise<{ competenciaId: string; nombre: string; nivel: NivelCompetencia; modulos: string[] }[]> {
  const [course, modules, progress] = await Promise.all([
    firebaseContent.getCourse(courseId),
    firebaseContent.getPublishedModules(courseId),
    firebaseProgress.getProgress(userId, courseId),
  ]);
  if (!course || !modules.length) return [];
  const completedIds = new Set(progress?.completedLessonIds ?? []);
  const catalog = await listCompetencias();
  const byCompetencia = new Map<string, { nivel: NivelCompetencia; modulos: Set<string> }>();

  for (const mod of modules) {
    const lessons = await firebaseContent.getLessons(mod.id);
    for (const les of lessons) {
      if (!completedIds.has(les.id as string)) continue;
      const lessonDoc = await db().collection("lessons").doc(les.id as string).get();
      const comps = (lessonDoc.data()?.competencias as LessonCompetencia[] | undefined) ?? [];
      const moduleTitle = (mod as { title?: string }).title ?? mod.id;
      for (const { id: compId, nivel } of comps) {
        let entry = byCompetencia.get(compId);
        if (!entry) {
          entry = { nivel, modulos: new Set() };
          byCompetencia.set(compId, entry);
        }
        entry.modulos.add(moduleTitle);
        if (nivel === "avanzado" || (entry.nivel !== "avanzado" && nivel === "intermedio")) entry.nivel = nivel;
      }
    }
  }

  return catalog
    .filter((c) => byCompetencia.has(c.id))
    .map((c) => {
      const e = byCompetencia.get(c.id)!;
      return {
        competenciaId: c.id,
        nombre: c.nombre,
        nivel: e.nivel,
        modulos: Array.from(e.modulos),
      };
    });
}

export interface CompetenciasReportPdfInput {
  nombreAlumno: string;
  cursoNombre: string;
  evidencia: { competenciaId: string; nombre: string; nivel: NivelCompetencia; modulos: string[] }[];
  verifyUrl: string;
  idCert?: string;
}

/** Genera el PDF del reporte de competencias (logo, alumno, lista, evidencia, referencia SPC, QR). */
export async function buildCompetenciasReportPdf(input: CompetenciasReportPdfInput): Promise<Buffer> {
  const { nombreAlumno, cursoNombre, evidencia, verifyUrl, idCert } = input;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageRef = { current: doc.addPage([595, 842]) };
  const { width, height } = pageRef.current.getSize();
  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, size: number, bold = false, maxWidth?: number) => {
    const f = bold ? fontBold : font;
    const lines = maxWidth ? wrapText(text, maxWidth, size, f as unknown as { widthOfText: (t: string) => number }) : [text];
    for (const line of lines) {
      if (y < margin + 20) break;
      pageRef.current.drawText(line, { x: margin, y, size, font: f, color: rgb(0.02, 0.06, 0.59) });
      y -= size * 1.2;
    }
  };

  pageRef.current.drawText("Política Digital · Innovación Pública", { x: margin, y, size: 10, font, color: rgb(0.02, 0.06, 0.59) });
  y -= 14;
  pageRef.current.drawText("Reporte de competencias (SPC)", { x: margin, y, size: 16, font: fontBold, color: rgb(0.02, 0.06, 0.59) });
  y -= 24;

  drawText(`Alumno: ${nombreAlumno}`, 12, true);
  drawText(`Programa: ${cursoNombre}`, 11);
  drawText(`Fecha de emisión: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`, 10);
  y -= 16;

  pageRef.current.drawText("Competencias desarrolladas (nivel alcanzado)", { x: margin, y, size: 12, font: fontBold, color: rgb(0.02, 0.06, 0.59) });
  y -= 18;

  for (const e of evidencia) {
    if (y < margin + 60) {
      pageRef.current = doc.addPage([595, 842]);
      y = height - margin;
    }
    drawText(`${e.nombre} — ${e.nivel}`, 11, true, width - margin * 2);
    drawText(`Evidencia: ${e.modulos.join(", ")}`, 9, false, width - margin * 2);
    y -= 8;
  }

  y -= 16;
  pageRef.current.drawText(`Referencia: ${FUENTE_OFICIAL}`, { x: margin, y, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 12;
  pageRef.current.drawText(`Verificación: ${verifyUrl}`, { x: margin, y, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
  if (idCert) {
    y -= 10;
    pageRef.current.drawText(`ID: ${idCert}`, { x: margin, y, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

function wrapText(text: string, maxWidth: number, fontSize: number, font: { widthOfText: (t: string) => number }): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfText(next) * (fontSize / 12) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

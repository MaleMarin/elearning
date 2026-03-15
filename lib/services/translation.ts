/**
 * Traducción automática de cursos (EN/PT) con IA.
 * Guarda en Firestore: translations: { en: {}, pt: {} } en course, modules y lessons.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

const BATCH_SIZE = 5;
export type TranslationTarget = "en" | "pt";

const LANG_LABEL: Record<TranslationTarget, string> = { en: "English", pt: "Português" };

function db() {
  return getFirebaseAdminFirestore();
}

export async function translateCourse(courseId: string, targetLang: TranslationTarget): Promise<{ translated: number; errors: string[] }> {
  const course = await firebaseContent.getCourse(courseId);
  const modules = await firebaseContent.getModules(courseId);
  const allLessons: { id: string; moduleId: string; title: string; summary: string; content: string }[] = [];
  for (const mod of modules) {
    const lessons = await firebaseContent.getLessons(mod.id as string);
    for (const lec of lessons) {
      allLessons.push({
        id: lec.id as string,
        moduleId: mod.id as string,
        title: (lec.title as string) ?? "",
        summary: (lec.summary as string) ?? "",
        content: (lec.content as string) ?? "",
      });
    }
  }
  const errors: string[] = [];
  let translated = 0;
  const { model } = await getModelWithFallback("anthropic");

  const translateBatch = async (texts: { title: string; summary: string; content: string }[]): Promise<{ title: string; summary: string; content: string }[]> => {
    const input = texts.map((t, i) => `[${i}] Título: ${t.title}\nResumen: ${t.summary}\nContenido:\n${t.content.slice(0, 3000)}`).join("\n\n---\n\n");
    const prompt = `Traduce al ${LANG_LABEL[targetLang]}. Mantén el mismo formato y Markdown.
Responde ÚNICAMENTE un JSON array con un objeto por cada bloque, en orden: [{"title":"...","summary":"...","content":"..."}, ...]
Sin explicaciones. Solo el array JSON.\n\n${input}`;
    const { text } = await generateText({ model, prompt });
    const cleaned = text.replace(/^[\s\S]*?(\[[\s\S]*\])\s*$/m, "$1").trim();
    const arr = JSON.parse(cleaned) as { title: string; summary: string; content: string }[];
    return arr.slice(0, texts.length);
  };

  for (let i = 0; i < allLessons.length; i += BATCH_SIZE) {
    const batch = allLessons.slice(i, i + BATCH_SIZE);
    try {
      const translatedBatch = await translateBatch(batch.map((l) => ({ title: l.title, summary: l.summary, content: l.content })));
      for (let j = 0; j < batch.length; j++) {
        const lesson = batch[j];
        const t = translatedBatch[j];
        if (!t) continue;
        const ref = db().collection("lessons").doc(lesson.id);
        const snap = await ref.get();
        const existing = (snap.data()?.translations as Record<string, unknown>) ?? {};
        await ref.update({
          translations: { ...existing, [targetLang]: { title: t.title, summary: t.summary, content: t.content } },
          updated_at: new Date().toISOString(),
        });
        translated++;
      }
    } catch (e) {
      errors.push(`Batch ${i / BATCH_SIZE + 1}: ${e instanceof Error ? e.message : "Error"}`);
    }
  }

  const courseRef = db().collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();
  const existingCourse = courseSnap.data()?.translations as Record<string, unknown> | undefined;
  const courseTitle = (course.title as string) ?? "";
  const courseDesc = (course.description as string) ?? "";
  try {
    const { text } = await generateText({
      model,
      prompt: `Traduce al ${LANG_LABEL[targetLang]}. Responde solo JSON: {"title":"...","description":"..."}\nTítulo: ${courseTitle}\nDescripción: ${courseDesc}`,
    });
    const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})\s*$/m, "$1").trim();
    const t = JSON.parse(cleaned) as { title: string; description: string };
    const existing = existingCourse ?? {};
    await courseRef.update({
      translations: { ...existing, [targetLang]: { title: t.title, description: t.description } },
      updated_at: new Date().toISOString(),
    });
  } catch {
    errors.push("Curso: error al traducir");
  }

  for (const mod of modules) {
    const modRef = db().collection("modules").doc(mod.id as string);
    const title = (mod.title as string) ?? "";
    const desc = (mod.description as string) ?? "";
    try {
      const { text } = await generateText({
        model,
        prompt: `Traduce al ${LANG_LABEL[targetLang]}. Responde solo JSON: {"title":"...","description":"..."}\nTítulo: ${title}\nDescripción: ${desc}`,
      });
      const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})\s*$/m, "$1").trim();
      const t = JSON.parse(cleaned) as { title: string; description: string };
      const snap = await modRef.get();
      const existing = (snap.data()?.translations as Record<string, unknown>) ?? {};
      await modRef.update({
        translations: { ...existing, [targetLang]: { title: t.title, description: t.description } },
        updated_at: new Date().toISOString(),
      });
    } catch {
      errors.push(`Módulo ${title}: error`);
    }
  }

  return { translated, errors };
}

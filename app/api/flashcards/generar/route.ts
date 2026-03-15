import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { generateText } from "ai";
import { getModelWithFallback } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FLASHCARDS_PROMPT = (lessonContent: string, numCards: number) => `Eres un experto en diseño instruccional.

Basándote en este contenido de lección, genera exactamente ${numCards} flashcards para ayudar al alumno a memorizar los conceptos clave.

CONTENIDO:
${lessonContent.slice(0, 2000)}

INSTRUCCIONES:
- Cada flashcard tiene: frente (pregunta o concepto) y reverso (respuesta o definición)
- Las preguntas deben ser específicas y aplicadas al sector gobierno de México
- Máximo 15 palabras en el frente, máximo 30 en el reverso
- Responde SOLO con JSON válido, sin texto adicional

FORMATO JSON:
{
  "flashcards": [
    { "frente": "¿Qué es...?", "reverso": "Es..." },
    ...
  ]
}
`;

export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const lessonContent = (body.lessonContent as string) ?? "";
  const lessonId = (body.lessonId as string) ?? "";
  const numCards = Math.min(10, Math.max(1, Number(body.numCards) || 5));

  if (!lessonContent.trim() || !lessonId.trim()) {
    return NextResponse.json({ error: "Falta lessonContent o lessonId" }, { status: 400 });
  }

  try {
    const { model } = await getModelWithFallback("anthropic");
    const { text } = await generateText({
      model,
      prompt: FLASHCARDS_PROMPT(lessonContent, numCards),
    });

    const parsed = JSON.parse(text) as { flashcards?: { frente: string; reverso: string }[] };
    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];

    const db = getFirebaseAdminFirestore();
    if (db) {
      await db
        .collection("users")
        .doc(user.uid)
        .collection("flashcards")
        .doc(lessonId)
        .set({
          flashcards,
          generatedAt: new Date(),
          lessonId,
        });
    }

    return NextResponse.json({ flashcards });
  } catch (e) {
    console.error("Error generando flashcards:", e);
    return NextResponse.json({ error: "Error generando flashcards" }, { status: 500 });
  }
}

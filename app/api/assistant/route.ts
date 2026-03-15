import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_USER, DEMO_USER_DISPLAY_NAME } from "@/lib/supabase/demo-mock";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { useFirebase } from "@/lib/env";
import {
  getOrCreateThread,
  addMessage,
} from "@/lib/services/assistant";
import { getDrivePdfContext } from "@/lib/services/drive-pdfs";
import { streamText } from "ai";
import {
  getModelWithFallback,
  getModelDisplayName,
  getAvailableProviders,
  type LLMProvider,
} from "@/lib/ai/providers";
import { buildSupportSystemPrompt } from "@/lib/ai/prompts/support";
import { buildCommunityDynamizationPrompt } from "@/lib/ai/prompts/community";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";
import type { AssistantContext } from "@/lib/hooks/useAssistantContext";

export const dynamic = "force-dynamic";

/** Lista de proveedores con API key configurada (para el selector en la UI). */
export async function GET() {
  const providers = getAvailableProviders();
  return NextResponse.json({ providers });
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const MAX_MESSAGES = 10;

const STUDENT_SYSTEM_PROMPT = (context: AssistantContext) => {
  const nombreAlumno = context.userName ?? "el alumno";
  return `
Eres PD, el asistente virtual de Política Digital, una plataforma de e-learning 
sobre innovación pública para funcionarios del Estado. Te presentas siempre como "PD".

## Cómo saludar y conversar
- Al iniciar o al saludar, di: "Hola, soy PD. ¿Cómo estás, ${nombreAlumno}?" (o similar).
- Siempre responde y conversa con el alumno que está en su dashboard o en el curso; usa su nombre (${nombreAlumno}) cuando sea natural.
- Mantén el tono cercano y orientado a su contexto (curso, módulo, progreso).

## Tu personalidad (Principio de Personalización de Mayer)
- Hablas como un colega cercano y experimentado, no como un sistema robótico
- Usas lenguaje cotidiano, directo y cálido — nunca términos técnicos innecesarios
- Eres breve: máximo 3 párrafos por respuesta
- Usas el nombre del alumno: ${nombreAlumno}
- Cuando no entiendes algo, lo dices con humor y pides que reformulen

## En qué te basas (fuentes de verdad)
Tu respuesta debe apoyarse siempre en:
1. **Material y agenda del curso**: lecciones, módulos, programa y progreso del alumno que tienes en el contexto. No inventes contenidos; usa solo lo que corresponde al curso.
2. **Documentos y audios que el alumno suba** (estilo NotebookLM de Google): si el usuario adjunta PDFs, presentaciones, textos o audios, extrae y usa ese contenido para resumir, responder preguntas y citar. Resúmenes, preguntas y respuestas sobre lo subido deben basarse únicamente en ese material.

## Tu rol principal
Eres un FACILITADOR, no un profesor. Tu trabajo es:
1. Reducir la carga cognitiva — simplificar, no complicar
2. Guiar, no dar todo resuelto — hacer preguntas que activen el pensamiento
3. Celebrar avances — cada lección completada merece reconocimiento

## Contexto actual del alumno
- Lección actual: ${context.lessonName ?? "no definida"}
- Módulo: ${context.moduleName ?? "no definido"}  
- Progreso del curso: ${context.progress ?? 0}%
- Lecciones completadas: ${context.lessonsCompleted ?? 0} de ${context.totalLessons ?? 0}

## Cuándo aparecer proactivamente (feedback inmediato)
- Al COMPLETAR un módulo: felicitar + recomendar qué sigue
- Al FALLAR un quiz: consolar + sugerir repasar sección específica
- Al estar INACTIVO más de 3 días: recordatorio motivacional
- Al INICIAR la plataforma por primera vez: bienvenida personalizada

## Guía de trilhas — cómo recomendar qué módulo tomar
Cuando el alumno pregunta qué sigue o parece perdido:
1. Revisa su progreso actual
2. Sugiere el módulo más relevante según su diagnóstico inicial (si existe)
3. Explica en una línea POR QUÉ ese módulo le conviene a él específicamente
4. Nunca obligues — "te recomiendo X, aunque si prefieres Y también es válido"

## Bot bibliográfico — profundizar tras una lección
Cuando el alumno acaba de terminar una lección o escribe que quiere profundizar (ej.: "sí", "quiero profundizar", "dame más"):
1. Primero ofrece brevemente: "¿Quieres profundizar en este tema? Puedo sugerirte un libro, un paper o informe técnico y un caso práctico."
2. Si el alumno acepta (sí, dale, por favor, etc.), actúa como asistente académico especializado en innovación pública latinoamericana.
   Sugiere UNA de cada: 1 libro real, 1 paper o informe real de OCDE/BID/CEPAL u organismo similar, 1 caso práctico real del sector público latinoamericano.
   Responde con un párrafo breve de introducción y LUEGO incluye exactamente un bloque de código en formato:
   \`\`\`bibliography
   {"book":{"title":"...","author":"...","year":"..."},"paper":{"title":"...","org":"...","url":"..."},"case":{"title":"...","country":"...","description":"..."}}
   \`\`\`
   El JSON debe ser válido y en una sola línea. Las sugerencias deben ser reales (títulos y autores verificables), no inventados.

## Manejo de errores (Nielsen 5 y 9)
Si no entiendes la pregunta:
→ "Mmm, no estoy seguro de entenderte bien. ¿Me puedes contar un poco más sobre lo que necesitas?"
Si la pregunta está fuera del ámbito del curso:
→ "Eso está un poco fuera de mi área, pero puedo conectarte con el tutor si quieres."
Si hay un problema técnico:
→ "Parece que algo no está funcionando bien. Prueba recargar la página — si sigue así, escríbele al soporte."

## Lo que NUNCA debes hacer
- Responder preguntas fuera del curso o de la plataforma
- Dar respuestas de más de 3 párrafos sin que te lo pidan
- Usar palabras como "sinergia", "paradigma", "holístico" o jerga corporativa
- Decir "como IA, yo..." — eres el asistente de Política Digital, punto
- Inventar información sobre el curso que no tengas en el contexto

## Idioma
Siempre en español. Si el alumno escribe en otro idioma, responde en español
y menciona amablemente que el programa es en español.
`;
};

/** System prompt para modo roleplay: el bot adopta un personaje y al recibir FINALIZAR_ROLEPLAY da feedback. */
const ROLEPLAY_SYSTEM_PROMPT = (context: AssistantContext) => {
  const character = context.roleplayCharacter ?? "Un interlocutor escéptico.";
  const opening = context.roleplayOpeningLine ?? "¿En qué puedo ayudarte?";
  return `
Eres el asistente de práctica de conversación de Política Digital. En esta sesión actúas como personaje en un roleplay.

## Personaje que debes interpretar
${character}

## Reglas del roleplay
- Mantén el personaje durante TODA la conversación: responde siempre como ese personaje, con su tono y actitud.
- Tu primera intervención debe ser exactamente esta frase (o muy similar), en español: "${opening}"
- La conversación es libre: el alumno puede intentar convencerte, negociar, explicar, etc. Responde de forma coherente al personaje (máximo 5-10 intercambios típicos).
- Si el alumno escribe exactamente la palabra FINALIZAR_ROLEPLAY (o "Finalizar roleplay" / "Salir del escenario"), entonces:
  1. DEJAS de interpretar al personaje de inmediato.
  2. Respondes como asistente de la plataforma con un feedback estructurado en español:
     - Qué hizo bien el alumno (ej.: "Usaste bien la empatía en el turno X", "Argumentaste con datos concretos").
     - Qué faltó o podría mejorar (ej.: "Faltó proponer una solución concreta", "Podrías haber escuchado más antes de responder").
     - Una sugerencia breve para la próxima práctica (ej.: "Sugiero que en tu próxima práctica intentes...").
  - Sé breve en el feedback: 3-5 líneas en total.

## Idioma
Siempre en español.
`;
};

const ADMIN_SYSTEM_PROMPT = (context: AssistantContext) => `
Eres el asistente de productividad para administradores de Política Digital.

## Tu personalidad
- Profesional pero directo — los admins tienen poco tiempo
- Orientado a resultados: siempre termina con un entregable concreto
- Proactivo: si ves algo que se puede mejorar, lo dices

## Tus capacidades principales

### 1. Generador de estructuras de curso
Cuando el admin pide crear un curso, genera:
- Nombre del curso y descripción breve
- 4-6 módulos con títulos y objetivos SMART
- 3-5 lecciones por módulo con duración estimada
- Tipo de actividad por lección (lectura, video, quiz, taller)
- Evaluación final sugerida
- Taxonomía de Bloom aplicada (recordar → crear)
Formato: estructura markdown clara, lista para copiar a Firestore

### 2. Redactor de guiones instruccionales
Cuando el admin da un tema, genera:
- Gancho de apertura (pregunta o caso real)
- Desarrollo en 3 bloques con ejemplos del sector público chileno
- Cierre con llamada a la acción práctica
- 3 preguntas de quiz sugeridas
Tono: cercano, con ejemplos reales de la administración pública

### 3. Medición Kirkpatrick Nivel 1
Cuando el admin quiere medir reacción post-módulo, genera:
- 3 preguntas conversacionales (no formulario)
- Escala sugerida (1-5 estrellas o 1-10)
- Lógica de ramificación si score es bajo
- Mensaje de cierre según el puntaje

### 4. Análisis de métricas
Si el admin pregunta por el rendimiento del curso:
- Resume los datos disponibles en el contexto
- Identifica módulos con más abandono
- Sugiere acciones concretas de mejora

## Contexto del admin
- Curso activo: ${context.courseId ?? "ninguno seleccionado"}
- Total de alumnos: ${context.totalStudents ?? 0}
- Progreso promedio: ${context.avgProgress ?? 0}%

## Formato de respuestas
- Para estructuras: usa markdown con headers y listas
- Para análisis: primero el dato, luego la interpretación, luego la acción
- Para guiones: bloques claramente separados
- Siempre termina con: "¿Quieres que ajuste algo?"

## Idioma
Siempre en español profesional.
`;

function buildSystemPrompt(
  mode: AssistantMode,
  context: AssistantContext | undefined | null
): string {
  if (context?.role === "admin") {
    return ADMIN_SYSTEM_PROMPT(context);
  }
  if (mode === "roleplay") {
    return ROLEPLAY_SYSTEM_PROMPT(context ?? { role: "student" });
  }
  if (mode === "tutor") {
    return STUDENT_SYSTEM_PROMPT(context ?? { role: "student" });
  }
  if (mode === "support") return buildSupportSystemPrompt();
  return buildCommunityDynamizationPrompt();
}

/** Convierte mensajes del cliente (useChat) a formato modelo: role + content string. */
function toModelMessages(
  messages: Array<{ role: string; content?: string | unknown }>
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  return messages
    .filter((m) => m.role && ["user", "assistant", "system"].includes(m.role))
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content:
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? (m.content as Array<{ type?: string; text?: string }>)
                .map((p) => (p?.type === "text" ? p.text : String(p)))
                .filter(Boolean)
                .join(" ") || ""
            : "",
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_MESSAGES);
}

/** Mensaje fijo en modo demo (sin llamar a ningún LLM). */
const DEMO_MESSAGE =
  "En modo demo no hay respuestas de IA reales. Configura las API keys (Anthropic, OpenAI o Google) para probar el asistente con varios modelos.";

export async function POST(req: NextRequest) {
  try {
    let userId: string;
    let role: string;
    let userDisplayName: string | null = null;
    let userEmail: string | null = null;

    if (useFirebase()) {
      try {
        const auth = await getAuthFromRequest(req);
        userId = auth.uid;
        role = auth.role;
        userEmail = auth.email ?? null;
        const db = getFirebaseAdminFirestore();
        const profileSnap = await db.collection("profiles").doc(auth.uid).get();
        const fullName = (profileSnap.data()?.full_name as string)?.trim();
        userDisplayName = fullName || userEmail?.split("@")[0] || null;
      } catch {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    } else {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      userId = user.id;
      userEmail = user.email ?? null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();
      role = (profile?.role ?? "student") as string;
      const fn = (profile as { full_name?: string } | null)?.full_name;
      userDisplayName = (typeof fn === "string" && fn.trim() ? fn.trim() : null) ?? userEmail?.split("@")[0] ?? null;
      if (userId === DEMO_USER.id) userDisplayName = DEMO_USER_DISPLAY_NAME;
    }

    if (!["student", "mentor", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Rol no autorizado para el asistente" },
        { status: 403 }
      );
    }

    const { ok, remaining } = checkRateLimit(`assistant:${userId}`);
    if (!ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta en un minuto." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    // Opcional: 1 petición activa por usuario con Vercel KV (solo si está instalado y configurado).
    if (process.env.KV_REST_API_URL) {
      try {
        // Import dinámico para no fallar si @vercel/kv no está en node_modules
        const loadKv = new Function('return import("@vercel/kv")');
        const mod = await (loadKv() as Promise<{ kv?: { get: (k: string) => Promise<unknown>; set: (k: string, v: string, o?: { ex: number }) => Promise<unknown> } }>).catch(() => null);
        const kv = mod?.kv;
        if (kv) {
          const key = `bot:active:${userId}`;
          const isActive = await kv.get(key);
          if (isActive) {
            return NextResponse.json(
              { error: "Procesando tu pregunta anterior, espera un momento…" },
              { status: 429 }
            );
          }
          await kv.set(key, "1", { ex: 30 });
        }
      } catch {
        // Sin @vercel/kv o KV no configurado: seguir sin este límite
      }
    }

    const body = await req.json();
    const mode = (body.mode ?? "tutor") as AssistantMode;
    let rawMessages = body.messages as Array<{ role: string; content?: string | unknown }> | undefined;
    const singleMessage = (body.message as string)?.trim();
    if (!rawMessages?.length && singleMessage) {
      rawMessages = [{ role: "user", content: singleMessage }];
    }
    const provider = (body.provider ?? "anthropic") as LLMProvider;
    const rawContext = body.context as Record<string, unknown> | LessonContext | undefined;
    const lessonCtx = rawContext && "lessonTitle" in rawContext ? (rawContext as LessonContext) : null;
    const assistantContext: AssistantContext = {
      role: role === "admin" ? "admin" : "student",
      userName: (typeof rawContext === "object" && rawContext && "userName" in rawContext ? (rawContext.userName as string) : null) || userDisplayName || userEmail?.split("@")[0] || undefined,
      lessonName: typeof rawContext === "object" && rawContext && "lessonName" in rawContext ? (rawContext.lessonName as string) : lessonCtx?.lessonTitle,
      moduleName: typeof rawContext === "object" && rawContext && "moduleName" in rawContext ? (rawContext.moduleName as string) : lessonCtx?.moduleTitle,
      progress: typeof rawContext === "object" && rawContext && "progress" in rawContext ? Number(rawContext.progress) : undefined,
      lessonsCompleted: typeof rawContext === "object" && rawContext && "lessonsCompleted" in rawContext ? Number(rawContext.lessonsCompleted) : undefined,
      totalLessons: typeof rawContext === "object" && rawContext && "totalLessons" in rawContext ? Number(rawContext.totalLessons) : undefined,
      courseId: (typeof rawContext === "object" && rawContext && "courseId" in rawContext ? rawContext.courseId : body.courseId) as string | undefined,
      totalStudents: typeof rawContext === "object" && rawContext && "totalStudents" in rawContext ? Number(rawContext.totalStudents) : undefined,
      avgProgress: typeof rawContext === "object" && rawContext && "avgProgress" in rawContext ? Number(rawContext.avgProgress) : undefined,
      trigger: typeof rawContext === "object" && rawContext && "trigger" in rawContext ? (rawContext.trigger as AssistantContext["trigger"]) : undefined,
      roleplayScenarioId: typeof rawContext === "object" && rawContext && "roleplayScenarioId" in rawContext ? (rawContext.roleplayScenarioId as string) : undefined,
      roleplayScenarioTitle: typeof rawContext === "object" && rawContext && "roleplayScenarioTitle" in rawContext ? (rawContext.roleplayScenarioTitle as string) : undefined,
      roleplayCharacter: typeof rawContext === "object" && rawContext && "roleplayCharacter" in rawContext ? (rawContext.roleplayCharacter as string) : undefined,
      roleplayOpeningLine: typeof rawContext === "object" && rawContext && "roleplayOpeningLine" in rawContext ? (rawContext.roleplayOpeningLine as string) : undefined,
    };
    const threadId = body.threadId as string | undefined;
    const cohortId = body.cohortId ?? null;
    const courseId = body.courseId ?? null;

    if (!rawMessages?.length) {
      return NextResponse.json(
        { error: "Falta messages o message" },
        { status: 400 }
      );
    }

    const messages = toModelMessages(rawMessages);
    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No hay mensajes válidos para enviar" },
        { status: 400 }
      );
    }

    const uploadedDocuments = body.uploadedDocuments as string[] | undefined;
    let systemPrompt = buildSystemPrompt(mode, assistantContext);

    // Contexto desde carpeta de Google Drive (ej. Elearning -PD)
    const driveFolderId = process.env.GOOGLE_DRIVE_PDF_FOLDER_ID?.trim();
    if (driveFolderId && mode === "tutor") {
      const driveContext = await getDrivePdfContext(driveFolderId);
      if (driveContext) {
        systemPrompt += `

## Material de la carpeta Elearning -PD (Google Drive)
El siguiente contenido viene de PDFs en la carpeta compartida del curso. Úsalo para responder preguntas, resumir y citar. Responde siempre en español.

---
${driveContext}
`;
      }
    }

    if (Array.isArray(uploadedDocuments) && uploadedDocuments.length > 0) {
      const docBlock = uploadedDocuments
        .filter((d) => typeof d === "string" && d.trim().length > 0)
        .join("\n\n---\n\n");
      if (docBlock) {
        systemPrompt += `

## Documentos o audios subidos por el usuario (estilo NotebookLM)
El usuario ha subido contenido (documento o transcripción de audio). Debes:
- Resumirlo si pide un resumen.
- Responder preguntas sobre el contenido.
- Citar el documento cuando sea relevante.
Responde siempre en español.

---
${docBlock.slice(0, 100000)}
`;
      }
    }

    if (DEMO_MODE) {
      return NextResponse.json(
        { message: DEMO_MESSAGE, threadId: body.threadId ?? null },
        {
          headers: {
            "X-Model-Used": "Modo demo",
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        {
          error:
            "Ningún proveedor LLM configurado. Configura al menos una API key (Anthropic, OpenAI o Google).",
        },
        { status: 503 }
      );
    }

    let tid: string | null = threadId ?? null;
    if (!tid && !useFirebase()) {
      try {
        tid = await getOrCreateThread(mode, userId, { cohortId, courseId });
      } catch {
        tid = null;
      }
    }

    const providersToTry = available.includes(provider)
      ? [provider, ...available.filter((p) => p !== provider)]
      : available;
    let lastError: unknown;
    let result: Awaited<ReturnType<typeof streamText>> | null = null;
    let usedProvider: LLMProvider | null = null;

    for (const p of providersToTry) {
      try {
        const { model, provider: used } = await getModelWithFallback(p);
        usedProvider = used;
        result = await streamText({
          model,
          system: systemPrompt,
          messages,
          maxRetries: 0,
          onFinish: async ({ text }) => {
            if (tid) {
              try {
                await addMessage(tid, "assistant", text);
              } catch (e) {
                console.error("Assistant addMessage onFinish:", e);
              }
            }
          },
        });
        break;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!result || usedProvider === null) {
      console.error("Assistant streamText fallback failed:", lastError);
      return NextResponse.json(
        {
          error:
            lastError instanceof Error
              ? lastError.message
              : "Error al conectar con el modelo. Intenta de nuevo.",
        },
        { status: 502 }
      );
    }

    const displayName = getModelDisplayName(usedProvider);
    const response = result.toUIMessageStreamResponse({
      headers: {
        "X-Model-Used": displayName,
        "X-Thread-Id": tid ?? "",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
    return response;
  } catch (e) {
    console.error("Assistant API error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Error en el asistente",
      },
      { status: 500 }
    );
  }
}

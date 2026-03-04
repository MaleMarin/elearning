import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getOrCreateThread,
  getThreadMessages,
  addMessage,
} from "@/lib/services/assistant";
import { chat } from "@/lib/ai/model-client";
import { buildTutorSystemPrompt } from "@/lib/ai/prompts/tutor";
import { buildSupportSystemPrompt } from "@/lib/ai/prompts/support";
import { buildCommunityDynamizationPrompt } from "@/lib/ai/prompts/community";
import { createTicket } from "@/lib/services/support";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "student";
    if (!["student", "mentor", "admin"].includes(role)) {
      return NextResponse.json({ error: "Rol no autorizado para el asistente" }, { status: 403 });
    }

    const { ok, remaining } = checkRateLimit(`assistant:${user.id}`);
    if (!ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta en un minuto." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    const body = await req.json();
    const mode = (body.mode ?? "tutor") as AssistantMode;
    const threadId = body.threadId as string | undefined;
    const message = (body.message as string)?.trim();
    const context = body.context as LessonContext | undefined;

    if (!message) {
      return NextResponse.json({ error: "Falta message" }, { status: 400 });
    }

    const cohortId = body.cohortId ?? null;
    const courseId = body.courseId ?? null;

    const tid = threadId ?? (await getOrCreateThread(mode, user.id, { cohortId, courseId }));
    const history = await getThreadMessages(tid);
    const messagesForModel = history.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    }));

    let systemPrompt: string;
    if (mode === "tutor") {
      systemPrompt = buildTutorSystemPrompt(context ?? null);
    } else if (mode === "support") {
      systemPrompt = buildSupportSystemPrompt();
    } else {
      systemPrompt = buildCommunityDynamizationPrompt();
    }

    if (!messagesForModel.some((m) => m.role === "system")) {
      messagesForModel.unshift({ role: "system", content: systemPrompt });
    }

    messagesForModel.push({ role: "user", content: message });
    await addMessage(tid, "user", message);

    const response = await chat(messagesForModel);

    let finalContent = response.content;

    if (mode === "support" && shouldCreateTicket(response.content, message)) {
      const category = inferCategory(message);
      try {
        const ticket = await createTicket(user.id, {
          category,
          summary: message.slice(0, 200),
          details: message,
          cohortId,
        });
        finalContent += `\n\nHe creado un ticket de soporte (#${ticket.id.slice(0, 8)}). Un mentor o el equipo te responderá pronto.`;
      } catch {
        // ignore
      }
    }

    await addMessage(tid, "assistant", finalContent);

    return NextResponse.json(
      { threadId: tid, message: finalContent },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (e) {
    console.error("Assistant API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en el asistente" },
      { status: 500 }
    );
  }
}

function shouldCreateTicket(assistantReply: string, userMessage: string): boolean {
  const lower = assistantReply.toLowerCase();
  const wantsTicket =
    lower.includes("ticket") ||
    lower.includes("soporte") ||
    lower.includes("revisaremos") ||
    userMessage.toLowerCase().includes("crear ticket");
  return wantsTicket;
}

function inferCategory(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("contraseña") || m.includes("password")) return "contraseña";
  if (m.includes("verificación") || m.includes("email")) return "verificación";
  if (m.includes("acceso") || m.includes("curso") || m.includes("cohorte")) return "acceso";
  if (m.includes("video") || m.includes("reproductor") || m.includes("contenido")) return "contenido";
  return "técnico";
}

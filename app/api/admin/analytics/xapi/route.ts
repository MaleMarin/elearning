/**
 * GET /api/admin/analytics/xapi
 * Agregados desde el LRS para el dashboard de analytics (solo admin).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import xapi, { isXAPIEnabled } from "@/lib/xapi/client";

export const dynamic = "force-dynamic";

const ACTIVITY_BASE = "https://politicadigital.gob.mx/elearning/";
const VERB_EXPERIENCED = "http://adlnet.gov/expapi/verbs/experienced";
const VERB_COMPLETED = "http://adlnet.gov/expapi/verbs/completed";
const VERB_ANSWERED = "http://adlnet.gov/expapi/verbs/answered";
const VERB_PAUSED = "https://w3id.org/xapi/dod-isd/verbs/paused";
const EXT_SECONDS = "https://politicadigital.gob.mx/expapi/seconds";

async function fetchStatements(verb: string, limit = 500): Promise<import("@xapi/xapi").Statement[]> {
  if (!xapi) return [];
  const res = await xapi.getStatements({ verb, limit } as import("@xapi/xapi").GetStatementsParams) as { statements?: import("@xapi/xapi").Statement[] };
  return res?.statements ?? [];
}

function lessonIdFromObject(obj: { id?: string }): string | null {
  const id = obj?.id ?? "";
  if (!id.startsWith(ACTIVITY_BASE + "lesson/")) return null;
  return id.slice((ACTIVITY_BASE + "lesson/").length).split("/")[0] || null;
}

function questionIdFromObject(obj: { id?: string }): string | null {
  const id = obj?.id ?? "";
  if (!id.startsWith(ACTIVITY_BASE + "question/")) return null;
  return id.slice((ACTIVITY_BASE + "question/").length) || null;
}

function agentIdFromActor(actor: { account?: { name?: string } }): string {
  return actor?.account?.name ?? "unknown";
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isXAPIEnabled() || !xapi) {
    return NextResponse.json({
      error: "xAPI no configurado",
      roi: null,
      completionByLesson: [],
      videoAbandonBySecond: [],
      questionsByErrors: [],
      avgTimePerModule: null,
      atRisk: [],
    });
  }

  try {
    const [experienced, completed, answered, paused] = await Promise.all([
      fetchStatements(VERB_EXPERIENCED),
      fetchStatements(VERB_COMPLETED),
      fetchStatements(VERB_ANSWERED),
      fetchStatements(VERB_PAUSED),
    ]);

    const objectId = (s: import("@xapi/xapi").Statement) =>
      (s.object as { id?: string })?.id ?? "";

    const completionByLesson: { lessonId: string; title: string; started: number; completed: number; rate: number }[] = [];
    const startedByLesson = new Map<string, number>();
    const completedByLesson = new Map<string, number>();
    const lessonTitles = new Map<string, string>();

    for (const s of experienced) {
      const lid = lessonIdFromObject(s.object as { id?: string });
      if (!lid) continue;
      startedByLesson.set(lid, (startedByLesson.get(lid) ?? 0) + 1);
      const name = (s.object as { definition?: { name?: { es?: string[] } } })?.definition?.name?.es?.[0];
      if (name) lessonTitles.set(lid, name);
    }
    for (const s of completed) {
      const lid = lessonIdFromObject(s.object as { id?: string });
      if (!lid) continue;
      completedByLesson.set(lid, (completedByLesson.get(lid) ?? 0) + 1);
    }
    for (const [lid, started] of Array.from(startedByLesson.entries())) {
      const completed = completedByLesson.get(lid) ?? 0;
      completionByLesson.push({
        lessonId: lid,
        title: lessonTitles.get(lid) ?? lid,
        started,
        completed,
        rate: started > 0 ? Math.round((completed / started) * 100) : 0,
      });
    }
    completionByLesson.sort((a, b) => b.started - a.started);

    const videoAbandonBySecond: { second: number; count: number }[] = [];
    const secondCounts = new Map<number, number>();
    for (const s of paused) {
      const ext = (s.result as { extensions?: Record<string, unknown> })?.extensions;
      const sec = typeof ext?.[EXT_SECONDS] === "number" ? Math.floor(ext[EXT_SECONDS] as number) : 0;
      secondCounts.set(sec, (secondCounts.get(sec) ?? 0) + 1);
    }
    for (const [second, count] of Array.from(secondCounts.entries())) {
      videoAbandonBySecond.push({ second, count });
    }
    videoAbandonBySecond.sort((a, b) => b.count - a.count);

    const questionsByErrors: { questionId: string; errors: number; total: number }[] = [];
    const questionErrors = new Map<string, number>();
    const questionTotal = new Map<string, number>();
    for (const s of answered) {
      const qid = questionIdFromObject(s.object as { id?: string });
      if (!qid) continue;
      questionTotal.set(qid, (questionTotal.get(qid) ?? 0) + 1);
      const success = (s.result as { success?: boolean })?.success;
      if (success === false) {
        questionErrors.set(qid, (questionErrors.get(qid) ?? 0) + 1);
      }
    }
    for (const [qid, total] of Array.from(questionTotal.entries())) {
      questionsByErrors.push({
        questionId: qid,
        errors: questionErrors.get(qid) ?? 0,
        total,
      });
    }
    questionsByErrors.sort((a, b) => b.errors - a.errors);

    const agentsWithCompleted = new Set<string>();
    const agentsWithExperienced = new Map<string, string>();
    for (const s of completed) {
      agentsWithCompleted.add(agentIdFromActor(s.actor as { account?: { name?: string } }));
    }
    for (const s of experienced) {
      const aid = agentIdFromActor(s.actor as { account?: { name?: string } });
      const stored = agentsWithExperienced.get(aid);
      const ts = (s.stored ?? s.timestamp) ?? "";
      if (!stored || ts > stored) agentsWithExperienced.set(aid, ts);
    }
    const atRisk: { userId: string; lastActivity: string }[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();
    for (const [userId, last] of Array.from(agentsWithExperienced.entries())) {
      if (agentsWithCompleted.has(userId)) continue;
      if (last < cutoff) {
        atRisk.push({ userId, lastActivity: last });
      }
    }
    atRisk.sort((a, b) => a.lastActivity.localeCompare(b.lastActivity));

    const totalStarts = Array.from(startedByLesson.values()).reduce((s, n) => s + n, 0);
    const totalCompletions = Array.from(completedByLesson.values()).reduce((s, n) => s + n, 0);
    const uniqueLearners = new Set([
      ...Array.from(agentsWithExperienced.keys()),
      ...Array.from(agentsWithCompleted),
    ]).size;

    return NextResponse.json({
      roi: {
        totalStarts,
        totalCompletions,
        uniqueLearners,
        completionRate: totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0,
      },
      completionByLesson,
      videoAbandonBySecond: videoAbandonBySecond.slice(0, 50),
      questionsByErrors: questionsByErrors.slice(0, 30),
      avgTimePerModule: null,
      atRisk: atRisk.slice(0, 20),
    });
  } catch (e) {
    console.error("[admin/analytics/xapi]", e);
    return NextResponse.json(
      { error: "Error al consultar el LRS" },
      { status: 500 }
    );
  }
}

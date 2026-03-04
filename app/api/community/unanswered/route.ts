import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chat } from "@/lib/ai/model-client";
import { buildUnansweredAnalysisPrompt } from "@/lib/ai/prompts/community";
import { getUnansweredPosts, notifyMentorsUnanswered } from "@/lib/services/community";
import { auditLog, getClientIp } from "@/lib/services/audit";

const DEFAULT_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role ?? "student";
    if (role !== "mentor" && role !== "admin") {
      return NextResponse.json({ error: "Solo mentor o admin" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const cohortId = body.cohortId as string;
    const olderThanHours = Number(body.olderThanHours) || DEFAULT_HOURS;

    if (!cohortId) {
      return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    }

    const posts = await getUnansweredPosts(cohortId, olderThanHours);

    const summaries = posts.map(
      (p) => `- "${p.title}" (${new Date(p.created_at).toLocaleDateString()}): ${p.body.slice(0, 150)}...`
    );

    if (summaries.length === 0) {
      return NextResponse.json({
        count: 0,
        summary: "No hay posts sin respuesta en el período indicado.",
      });
    }

    const prompt = buildUnansweredAnalysisPrompt();
    const analysis = await chat([
      { role: "system", content: prompt },
      { role: "user", content: `Lista de posts:\n\n${summaries.join("\n")}` },
    ]);

    await notifyMentorsUnanswered(cohortId, summaries);

    await auditLog({
      userId: user.id,
      role,
      action: "community.unanswered.run",
      resourceType: "cohort",
      resourceId: cohortId,
      payload: { count: posts.length, olderThanHours },
      ip: getClientIp(req),
    });

    return NextResponse.json({
      count: posts.length,
      postIds: posts.map((p) => p.id),
      summary: analysis.content,
    });
  } catch (e) {
    console.error("Unanswered error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

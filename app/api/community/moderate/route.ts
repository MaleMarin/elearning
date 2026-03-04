import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chat } from "@/lib/ai/model-client";
import { buildCommunityModerationPrompt } from "@/lib/ai/prompts/community";
import { createFlag } from "@/lib/services/community";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const postId = body.postId as string;
    const postContent = (body.postContent as string) ?? "";

    if (!postId || !postContent) {
      return NextResponse.json(
        { error: "Faltan postId o postContent" },
        { status: 400 }
      );
    }

    const systemPrompt = buildCommunityModerationPrompt();
    const analysis = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiza este post:\n\n${postContent.slice(0, 4000)}` },
      ]
    );

    let shouldFlag = false;
    let reason = "";
    let severity = 0;
    try {
      const json = analysis.content.replace(/```json?\s*/g, "").trim();
      const parsed = JSON.parse(json) as { shouldFlag?: boolean; reason?: string; severity?: number };
      shouldFlag = !!parsed.shouldFlag;
      reason = String(parsed.reason ?? "").slice(0, 500);
      severity = Math.min(5, Math.max(0, Number(parsed.severity) || 0));
    } catch {
      // Si no es JSON válido, no marcar
    }

    if (shouldFlag && reason && severity >= 1) {
      await createFlag(postId, user.id, reason, severity);
      return NextResponse.json({
        flagged: true,
        reason,
        severity,
      });
    }

    return NextResponse.json({ flagged: false });
  } catch (e) {
    console.error("Community moderate error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

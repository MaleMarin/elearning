import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chat } from "@/lib/ai/model-client";
import { buildDigestSystemPrompt } from "@/lib/ai/prompts/community";
import { createDigest } from "@/lib/services/community";
import { auditLog, getClientIp } from "@/lib/services/audit";

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
    const input = body.input as {
      topics?: string[];
      highlightedPosts?: string[];
      commonQuestions?: string[];
      upcomingMilestones?: string[];
    };

    if (!cohortId) {
      return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    }

    const prompt = buildDigestSystemPrompt();
    const userContent = [
      "Temas de la semana:",
      (input.topics ?? []).join(", ") || "(no especificados)",
      "Posts destacados:",
      (input.highlightedPosts ?? []).join("\n") || "(ninguno)",
      "Dudas comunes:",
      (input.commonQuestions ?? []).join("\n") || "(ninguna)",
      "Próximos hitos:",
      (input.upcomingMilestones ?? []).join("\n") || "(ninguno)",
    ].join("\n");

    const response = await chat([
      { role: "system", content: prompt },
      { role: "user", content: userContent },
    ]);

    const digest = await createDigest(cohortId, response.content);

    const admin = createAdminClient();
    const { data: members } = await admin
      .from("cohort_members")
      .select("user_id")
      .eq("cohort_id", cohortId);
    const memberCount = (members ?? []).length;
    for (const m of members ?? []) {
      await admin.from("notifications").insert({
        user_id: m.user_id,
        type: "weekly_digest",
        title: "Resumen semanal",
        body: response.content.slice(0, 200) + (response.content.length > 200 ? "…" : ""),
        link: "/comunidad?digest=" + digest.id,
      });
    }

    await auditLog({
      userId: user.id,
      role,
      action: "community.digest.create",
      resourceType: "weekly_digest",
      resourceId: digest.id,
      payload: { cohortId, notified: memberCount },
      ip: getClientIp(req),
    });

    return NextResponse.json({ digest, notified: memberCount });
  } catch (e) {
    console.error("Digest error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

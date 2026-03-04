import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AssistantMode } from "@/lib/types/database";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") as AssistantMode | null;

    let q = supabase
      .from("assistant_threads")
      .select("id, mode, cohort_id, course_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (mode) q = q.eq("mode", mode);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return NextResponse.json({ threads: data ?? [] });
  } catch (e) {
    console.error("Threads GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFlagsForCohort } from "@/lib/services/community";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");
    if (!cohortId) {
      return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    }

    const flags = await getFlagsForCohort(cohortId);
    return NextResponse.json({ flags });
  } catch (e) {
    console.error("Flags GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

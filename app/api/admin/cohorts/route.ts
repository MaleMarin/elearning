import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Lista cohortes: admin todas; mentor solo las que tiene como mentor. */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "student";
    if (role !== "admin" && role !== "mentor") return NextResponse.json({ error: "Solo admin o mentor" }, { status: 403 });

    if (role === "admin") {
      const { data, error } = await supabase.from("cohorts").select("id, name").order("name");
      if (error) throw new Error(error.message);
      return NextResponse.json({ cohorts: data ?? [] });
    }
    const { data: members } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("user_id", user.id)
      .eq("role", "mentor");
    const cohortIds = (members ?? []).map((m) => m.cohort_id);
    if (cohortIds.length === 0) return NextResponse.json({ cohorts: [] });
    const { data, error } = await supabase
      .from("cohorts")
      .select("id, name")
      .in("id", cohortIds)
      .order("name");
    if (error) throw new Error(error.message);
    return NextResponse.json({ cohorts: data ?? [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

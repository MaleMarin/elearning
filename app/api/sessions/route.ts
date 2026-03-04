import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export async function GET() {
  if (getDemoMode()) return NextResponse.json({ sessions: demoApiData.sessions });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await supabase
    .from("sessions")
    .select("id, cohort_id, title, scheduled_at, meeting_url")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(50);
  if (error) throw new Error(error.message);
  return NextResponse.json({ sessions: data ?? [] });
}

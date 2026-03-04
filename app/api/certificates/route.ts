import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export async function GET() {
  if (getDemoMode()) return NextResponse.json({ certificates: demoApiData.certificates });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await supabase
    .from("certificates")
    .select("id, user_id, cohort_id, course_id, issued_at")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });
  if (error) throw new Error(error.message);
  return NextResponse.json({ certificates: data ?? [] });
}

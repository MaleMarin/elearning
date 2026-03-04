import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export async function GET() {
  if (getDemoMode()) return NextResponse.json({ tasks: demoApiData.tasks });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_at, completed_at, cohort_id, instructions")
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });
  if (error) throw new Error(error.message);
  return NextResponse.json({ tasks: data ?? [] });
}

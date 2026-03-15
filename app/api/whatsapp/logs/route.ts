import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET: message_logs. Usuario: solo los suyos. Mentor: ?cohortId= para su grupo. Admin: todos o ?cohortId= */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "student";
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");

    if (role === "student") {
      const { data, error } = await supabase
        .from("message_logs")
        .select("*")
        .eq("recipient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return NextResponse.json({ logs: data ?? [] });
    }

    if (role === "mentor" && cohortId) {
      const { data, error } = await supabase
        .from("message_logs")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return NextResponse.json({ logs: data ?? [] });
    }

    if (role === "admin") {
      let q = supabase.from("message_logs").select("*").order("created_at", { ascending: false }).limit(500);
      if (cohortId) q = q.eq("cohort_id", cohortId);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return NextResponse.json({ logs: data ?? [] });
    }

    return NextResponse.json({ logs: [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

/**
 * GET /api/community/posts?cohortId=uuid
 * Posts de la cohorte (solo si el usuario es miembro). Sin cohortId devuelve posts de la primera cohorte del usuario.
 */
export async function GET(request: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ posts: demoApiData.posts, cohortId: demoApiData.cohortId });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  let cohortId = searchParams.get("cohortId");

  if (!cohortId) {
    const { data: members } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("user_id", user.id)
      .limit(1);
    cohortId = members?.[0]?.cohort_id ?? null;
  }

  if (!cohortId) {
    return NextResponse.json({ posts: [], pinned: [] });
  }

  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id, cohort_id, user_id, title, body, pinned, created_at")
    .eq("cohort_id", cohortId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = posts ?? [];
  const pinned = list.filter((p) => p.pinned);
  const rest = list.filter((p) => !p.pinned);

  return NextResponse.json({ posts: [...pinned, ...rest], cohortId });
}

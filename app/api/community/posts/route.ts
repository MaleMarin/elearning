import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";
import { moderarContenido } from "@/lib/services/moderacion";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/community/posts?cohortId=uuid
 * Posts de la cohorte (solo si el usuario es miembro). Oculta los que tienen ≥3 reportes.
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

  let list = posts ?? [];
  if (useFirebase() && list.length > 0) {
    const hidden = await modStore.getHiddenContentIds("comunidad_post", list.map((p) => p.id));
    list = list.filter((p) => !hidden.has(p.id));
  }
  const pinned = list.filter((p) => p.pinned);
  const rest = list.filter((p) => !p.pinned);

  return NextResponse.json({ posts: [...pinned, ...rest], cohortId });
}

/**
 * POST /api/community/posts — Crear post. Moderación automática: bloqueado rechaza, revision publica y marca para revisión, seguro publica.
 */
export async function POST(request: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      id: "demo-post",
      cohort_id: demoApiData.cohortId,
      user_id: "demo-user",
      title: "Demo",
      body: "Contenido demo",
      created_at: new Date().toISOString(),
      moderationStatus: "seguro",
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let cohortId: string | null = null;
  const { data: members } = await supabase
    .from("cohort_members")
    .select("cohort_id")
    .eq("user_id", user.id)
    .limit(1);
  cohortId = members?.[0]?.cohort_id ?? null;
  if (!cohortId) return NextResponse.json({ error: "Sin cohorte asignada" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const title = (body.title as string)?.trim() ?? "";
  const postBody = (body.body as string)?.trim() ?? "";
  if (!title && !postBody) return NextResponse.json({ error: "Falta title o body" }, { status: 400 });

  if (useFirebase()) {
    const banned = await modStore.isUserBanned(user.id);
    if (banned) return NextResponse.json({ error: "Tu cuenta está temporalmente restringida" }, { status: 403 });

    const texto = `${title}\n${postBody}`;
    const mod = await moderarContenido(texto);

    if (mod.nivel === "bloqueado") {
      await modStore.addToModerationHistory({
        source: "comunidad_post",
        contentId: "",
        authorId: user.id,
        texto,
        nivel: mod.nivel,
        razon: mod.razon,
        decision: "bloqueado",
        decidedBy: "sistema",
      });
      return NextResponse.json(
        { error: "El contenido no cumple las normas de la comunidad.", razon: mod.razon },
        { status: 403 }
      );
    }

    const { data: post, error } = await supabase
      .from("community_posts")
      .insert({ cohort_id: cohortId, user_id: user.id, title: title || "Sin título", body: postBody || "" })
      .select("id, cohort_id, user_id, title, body, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (mod.nivel === "revision") {
      await modStore.addToModerationQueue({
        source: "comunidad_post",
        contentId: post.id,
        authorId: user.id,
        authorEmail: user.email ?? undefined,
        texto,
        nivel: mod.nivel,
        razon: mod.razon,
      });
    }

    return NextResponse.json({ ...post, moderationStatus: mod.nivel });
  }

  const { data: post, error } = await supabase
    .from("community_posts")
    .insert({ cohort_id: cohortId, user_id: user.id, title: title || "Sin título", body: postBody || "" })
    .select("id, cohort_id, user_id, title, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(post);
}

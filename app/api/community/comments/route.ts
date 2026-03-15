/**
 * GET /api/community/comments?postId=uuid — Lista comentarios del post.
 * POST /api/community/comments — Crea comentario (body: postId, body). Moderación automática.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { moderarContenido } from "@/lib/services/moderacion";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "Falta postId" }, { status: 400 });

  if (getDemoMode()) return NextResponse.json({ comments: [] });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: comments, error } = await supabase
    .from("community_comments")
    .select("id, post_id, user_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: comments ?? [] });
}

export async function POST(request: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      id: "demo-comment",
      post_id: "",
      user_id: "demo-user",
      body: "Comentario demo",
      created_at: new Date().toISOString(),
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const postId = (body.postId as string)?.trim();
  const commentBody = (body.body as string)?.trim() ?? "";
  if (!postId || !commentBody) return NextResponse.json({ error: "Falta postId o body" }, { status: 400 });

  if (useFirebase()) {
    const banned = await modStore.isUserBanned(user.id);
    if (banned) return NextResponse.json({ error: "Tu cuenta está temporalmente restringida" }, { status: 403 });

    const mod = await moderarContenido(commentBody);

    if (mod.nivel === "bloqueado") {
      await modStore.addToModerationHistory({
        source: "comunidad_comment",
        contentId: "",
        authorId: user.id,
        texto: commentBody,
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

    const { data: comment, error } = await supabase
      .from("community_comments")
      .insert({ post_id: postId, user_id: user.id, body: commentBody })
      .select("id, post_id, user_id, body, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (mod.nivel === "revision") {
      await modStore.addToModerationQueue({
        source: "comunidad_comment",
        contentId: comment.id,
        authorId: user.id,
        authorEmail: user.email ?? undefined,
        texto: commentBody,
        nivel: mod.nivel,
        razon: mod.razon,
      });
    }

    return NextResponse.json({ ...comment, moderationStatus: mod.nivel });
  }

  const { data: comment, error } = await supabase
    .from("community_comments")
    .insert({ post_id: postId, user_id: user.id, body: commentBody })
    .select("id, post_id, user_id, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(comment);
}

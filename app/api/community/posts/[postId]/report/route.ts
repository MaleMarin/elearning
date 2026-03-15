/**
 * POST /api/community/posts/[postId]/report — Reportar un post. 3 reportes = auto-ocultar.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ reportCount: 0, hidden: false });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { postId } = await params;
  if (!postId) return NextResponse.json({ error: "Falta postId" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const reason = (body.reason as string)?.trim() ?? "Reporte de la comunidad";

  if (!useFirebase()) return NextResponse.json({ reportCount: 0, hidden: false });

  const { reportCount, hidden } = await modStore.addReport("comunidad_post", postId, user.id, reason);
  return NextResponse.json({ reportCount, hidden });
}

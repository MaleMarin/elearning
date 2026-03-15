/**
 * GET: lista posts Show & Tell de la cohorte del usuario.
 * POST: crea post (body: type "video" | "text", videoUrl?, textContent?). Moderación en textContent.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as showTell from "@/lib/services/showTell";
import { moderarContenido } from "@/lib/services/moderacion";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("profiles").doc(uid).get();
    const name = (snap.data()?.full_name as string)?.trim();
    if (name) return name;
  } catch {
    // ignore
  }
  return "Alumno";
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      posts: [
        { id: "st1", userName: "María G.", type: "text", textContent: "Apliqué el marco en mi equipo y en 2 semanas ya teníamos un backlog priorizado.", weekLabel: "2025-W12", createdAt: new Date().toISOString(), isHighlighted: true },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ posts: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ posts: [], cohortId: null });
    const posts = await showTell.listPosts(enrollment.cohort_id);
    return NextResponse.json({ posts, cohortId: enrollment.cohort_id });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ id: "demo-st", userName: "Tú", type: "text", weekLabel: "2025-W12", createdAt: new Date().toISOString(), isHighlighted: false });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "Sin cohorte activa" }, { status: 403 });
    const body = await req.json();
    const type = body.type === "video" ? "video" : "text";
    if (type === "video") {
      const videoUrl = (body.videoUrl as string)?.trim();
      if (!videoUrl) return NextResponse.json({ error: "Falta videoUrl" }, { status: 400 });
      const userName = await getDisplayName(auth.uid);
      const post = await showTell.createPost(enrollment.cohort_id, auth.uid, userName, { type: "video", videoUrl });
      return NextResponse.json(post);
    }
    const textContent = (body.textContent as string)?.trim();
    if (!textContent) return NextResponse.json({ error: "Falta textContent" }, { status: 400 });

    const banned = await modStore.isUserBanned(auth.uid);
    if (banned) return NextResponse.json({ error: "Tu cuenta está temporalmente restringida" }, { status: 403 });

    const mod = await moderarContenido(textContent);
    if (mod.nivel === "bloqueado") {
      await modStore.addToModerationHistory({
        source: "showntell_submission",
        contentId: "",
        authorId: auth.uid,
        texto: textContent,
        nivel: mod.nivel,
        razon: mod.razon,
        decision: "bloqueado",
        decidedBy: "sistema",
      });
      return NextResponse.json(
        { error: "El contenido no cumple las normas.", razon: mod.razon },
        { status: 403 }
      );
    }

    const userName = await getDisplayName(auth.uid);
    const post = await showTell.createPost(enrollment.cohort_id, auth.uid, userName, { type: "text", textContent });

    if (mod.nivel === "revision") {
      await modStore.addToModerationQueue({
        source: "showntell_submission",
        contentId: post.id,
        authorId: auth.uid,
        texto: textContent,
        nivel: mod.nivel,
        razon: mod.razon,
      });
    }
    return NextResponse.json({ ...post, moderationStatus: mod.nivel });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

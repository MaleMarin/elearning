/**
 * GET: lista términos del glosario del curso (público para alumnos del curso).
 * POST (admin): crea término. Moderación automática sobre term + officialDefinition.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as glossary from "@/lib/services/glossary";
import { moderarContenido } from "@/lib/services/moderacion";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  if (!courseId) return NextResponse.json({ error: "Falta courseId" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      terms: [
        { id: "t1", term: "Innovación pública", officialDefinition: "Cambio que genera valor para la ciudadanía desde el sector público." },
        { id: "t2", term: "Cohorte", officialDefinition: "Grupo de alumnos que cursan juntos el programa." },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ terms: [] });
  try {
    const terms = await glossary.listTerms(courseId);
    return NextResponse.json({ terms });
  } catch {
    return NextResponse.json({ terms: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  if (!courseId) return NextResponse.json({ error: "Falta courseId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-t", term: "Término demo" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const canEdit = await firebaseContent.getEditableCourseIds(auth.uid, auth.role).then((ids) => ids.includes(courseId));
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const body = await req.json();
    const term = (body.term as string)?.trim();
    const officialDefinition = (body.officialDefinition as string)?.trim() ?? "";
    if (!term) return NextResponse.json({ error: "Falta term" }, { status: 400 });

    if (useFirebase()) {
      const banned = await modStore.isUserBanned(auth.uid);
      if (banned) return NextResponse.json({ error: "Tu cuenta está temporalmente restringida" }, { status: 403 });

      const texto = `${term} ${officialDefinition}`;
      const mod = await moderarContenido(texto);

      if (mod.nivel === "bloqueado") {
        await modStore.addToModerationHistory({
          source: "glosario_term",
          contentId: "",
          authorId: auth.uid,
          texto,
          nivel: mod.nivel,
          razon: mod.razon,
          decision: "bloqueado",
          decidedBy: "sistema",
        });
        return NextResponse.json(
          { error: "El contenido no cumple las normas del glosario.", razon: mod.razon },
          { status: 403 }
        );
      }

      const created = await glossary.createTerm(courseId, term, officialDefinition, body.order);

      if (mod.nivel === "revision") {
        await modStore.addToModerationQueue({
          source: "glosario_term",
          contentId: created.id,
          authorId: auth.uid,
          texto,
          nivel: mod.nivel,
          razon: mod.razon,
        });
      }
      return NextResponse.json({ ...created, moderationStatus: mod.nivel });
    }

    const created = await glossary.createTerm(courseId, term, officialDefinition, body.order);
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as enrollmentRules from "@/lib/services/enrollment-rules";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updates: Partial<Pick<enrollmentRules.EnrollmentRule, "name" | "trigger" | "conditions" | "action" | "active">> = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (body.trigger != null) updates.trigger = body.trigger as enrollmentRules.EnrollmentRuleTrigger;
    if (body.conditions != null) updates.conditions = body.conditions as enrollmentRules.EnrollmentRuleConditions;
    if (body.action != null) {
      const action = body.action as enrollmentRules.EnrollmentRuleAction;
      if (action.enrollInCourseId?.trim()) {
        const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
        if (!editableIds.includes(action.enrollInCourseId.trim())) {
          return NextResponse.json({ error: "No tienes permiso sobre el curso de destino" }, { status: 403 });
        }
      }
      updates.action = action;
    }
    if (typeof body.active === "boolean") updates.active = body.active;
    const rule = await enrollmentRules.updateEnrollmentRule(id, updates);
    if (!rule) return NextResponse.json({ error: "Regla no encontrada" }, { status: 404 });
    return NextResponse.json({ rule });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }
  try {
    const auth = await getAuthFromRequest(_req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await enrollmentRules.deleteEnrollmentRule(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

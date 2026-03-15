import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as enrollmentRules from "@/lib/services/enrollment-rules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ rules: [] });
  }
  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rules = await enrollmentRules.listEnrollmentRules(false);
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ error: "Demo: no se pueden crear reglas" }, { status: 400 });
  }
  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim() || "Regla sin nombre";
    const trigger = (body.trigger as enrollmentRules.EnrollmentRuleTrigger) ?? "course_completed";
    const conditions = (body.conditions as enrollmentRules.EnrollmentRuleConditions) ?? {};
    const action = (body.action as enrollmentRules.EnrollmentRuleAction) ?? { enrollInCourseId: "" };
    if (!action.enrollInCourseId?.trim()) {
      return NextResponse.json({ error: "Falta enrollInCourseId en action" }, { status: 400 });
    }
    const enrollCourseId = action.enrollInCourseId.trim();
    if (!editableIds.includes(enrollCourseId)) {
      return NextResponse.json({ error: "No tienes permiso sobre el curso de destino" }, { status: 403 });
    }
    const active = Boolean(body.active !== false);
    const rule = await enrollmentRules.createEnrollmentRule({
      name,
      trigger,
      conditions,
      action: { ...action, enrollInCourseId: enrollCourseId },
      active,
    });
    return NextResponse.json({ rule });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

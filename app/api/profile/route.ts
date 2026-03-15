import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as profileService from "@/lib/services/profile";
import * as learningPaths from "@/lib/services/learning-paths";

export const dynamic = "force-dynamic";

const DEMO_PROFILE: profileService.UserProfile = {
  fullName: "Estudiante Demo",
  photoURL: null,
  institution: "Ministerio de Educación",
  position: "Jefe de División",
  country: "CL",
  region: "Metropolitana",
  linkedIn: null,
  preferredLanguage: "es",
  reminderFrequency: "weekly",
  contentMode: "leer",
  totalMinutesOnPlatform: 120,
  lastActivityDate: new Date().toISOString().slice(0, 10),
  streakDays: 2,
};

/** GET: perfil del usuario (datos personales + preferencias de aprendizaje) */
export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json(DEMO_PROFILE);
    }
    const auth = await getAuthFromRequest(req);
    if (!useFirebase()) {
      return NextResponse.json(DEMO_PROFILE);
    }
    const profile = await profileService.getProfile(auth.uid);
    const data = profile ?? {
      fullName: null,
      photoURL: null,
      institution: null,
      position: null,
      country: null,
      region: null,
      linkedIn: null,
      preferredLanguage: "es" as const,
      reminderFrequency: "weekly" as const,
      totalMinutesOnPlatform: 0,
      lastActivityDate: null,
      streakDays: 0,
      contentMode: "leer",
    };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

/** PUT: actualizar perfil (datos personales y/o preferencias) */
export async function PUT(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ ok: true, message: "Modo demo: no se guardan cambios." });
    }
    const auth = await getAuthFromRequest(req);
    if (!useFirebase()) {
      return NextResponse.json({ ok: true });
    }
    const body = await req.json();
    const updates: Parameters<typeof profileService.updateProfile>[1] = {};
    if (body.fullName !== undefined) updates.fullName = body.fullName;
    if (body.photoURL !== undefined) updates.photoURL = body.photoURL;
    if (body.institution !== undefined) updates.institution = body.institution;
    if (body.position !== undefined) updates.position = body.position;
    if (body.country !== undefined) updates.country = body.country;
    if (body.region !== undefined) updates.region = body.region;
    if (body.linkedIn !== undefined) updates.linkedIn = body.linkedIn;
    if (body.preferredLanguage !== undefined && (body.preferredLanguage === "es" || body.preferredLanguage === "en")) {
      updates.preferredLanguage = body.preferredLanguage;
    }
    if (
      body.reminderFrequency !== undefined &&
      ["daily", "weekly", "live_only", "never"].includes(body.reminderFrequency)
    ) {
      updates.reminderFrequency = body.reminderFrequency;
    }
    if (body.accessibilityFontSize !== undefined && (body.accessibilityFontSize === "normal" || body.accessibilityFontSize === "large")) {
      updates.accessibilityFontSize = body.accessibilityFontSize;
    }
    if (typeof body.accessibilityReduceMotion === "boolean") updates.accessibilityReduceMotion = body.accessibilityReduceMotion;
    if (typeof body.accessibilityHighContrast === "boolean") updates.accessibilityHighContrast = body.accessibilityHighContrast;
    if (body.contentMode !== undefined && ["leer", "escuchar", "ver"].includes(body.contentMode)) {
      updates.contentMode = body.contentMode as profileService.ContentMode;
    }
    await profileService.updateProfile(auth.uid, updates);
    if (updates.institution !== undefined || updates.position !== undefined) {
      const profile = await profileService.getProfile(auth.uid);
      const institution = (profile?.institution ?? "").trim();
      const cargo = (profile?.position ?? "").trim();
      if (institution || cargo) {
        try {
          await learningPaths.assignLearningPath(auth.uid, cargo, institution);
        } catch {
          // No bloquear la respuesta si falla la asignación de ruta
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar" },
      { status: 401 }
    );
  }
}

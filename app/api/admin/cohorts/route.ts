import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdminSupabase() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado", status: 401 as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Solo administradores", status: 403 as const };
  return { supabase, user };
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json([
      {
        id: "demo-cohort-id",
        name: "Grupo demo",
        description: null,
        starts_at: null,
        ends_at: null,
        timezone: "UTC",
        capacity: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
      const cohorts = await firebaseContent.listCohorts();
      const toDate = (v: unknown): string | null => {
        if (typeof v === "string") return v;
        const d = v as { toDate?: () => Date };
        return d?.toDate?.()?.toISOString?.() ?? null;
      };
      return NextResponse.json(
        cohorts.map((c) => ({
          id: c.id,
          name: (c.nombre as string) ?? c.name,
          nombre: c.nombre ?? c.name,
          description: c.description ?? null,
          starts_at: c.starts_at ?? null,
          ends_at: c.ends_at ?? null,
          fechaInicio: toDate(c.fechaInicio),
          fechaFin: toDate(c.fechaFin),
          timezone: (c.timezone as string) ?? "UTC",
          capacity: (c.configuracion as { maxAlumnos?: number })?.maxAlumnos ?? (c.capacity as number) ?? 0,
          is_active: c.is_active !== false,
          courseId: c.courseId ?? null,
          facilitadorId: c.facilitadorId ?? null,
          estado: c.estado ?? null,
          alumnos: (c.alumnos as string[]) ?? [],
          codigoInvitacion: c.codigoInvitacion ?? null,
          configuracion: c.configuracion ?? null,
          created_at: typeof c.created_at === "string" ? c.created_at : (c.created_at as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updated_at: typeof c.updated_at === "string" ? c.updated_at : (c.updated_at as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        }))
      );
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const auth = await requireAdminSupabase();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase
    .from("cohorts")
    .select("id, name, description, starts_at, ends_at, timezone, capacity, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (getDemoMode()) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      id: "demo-cohort-id",
      name: body.name ?? "Grupo demo",
      description: body.description ?? null,
      starts_at: body.startsAt ?? null,
      ends_at: body.endsAt ?? null,
      timezone: "UTC",
      capacity: body.capacity ?? 0,
      is_active: body.isActive !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(request);
      if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
      const body = await request.json().catch(() => ({}));
      const name = (typeof body.nombre === "string" ? body.nombre.trim() : "") || (typeof body.name === "string" ? body.name.trim() : "");
      if (!name) return NextResponse.json({ error: "Falta el nombre del grupo" }, { status: 400 });

      const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";
      const facilitadorId = typeof body.facilitadorId === "string" ? body.facilitadorId.trim() : "";
      const fechaInicioStr = typeof body.fechaInicio === "string" ? body.fechaInicio : null;
      const fechaFinStr = typeof body.fechaFin === "string" ? body.fechaFin : null;

      if (courseId && facilitadorId && fechaInicioStr && fechaFinStr) {
        const cohort = await firebaseContent.createCohortV2({
          nombre: name,
          courseId,
          facilitadorId,
          fechaInicio: new Date(fechaInicioStr),
          fechaFin: new Date(fechaFinStr),
          configuracion: {
            permitirAutoInscripcion: body.permitirAutoInscripcion === true,
            maxAlumnos: typeof body.maxAlumnos === "number" ? body.maxAlumnos : 0,
            esPrivada: body.esPrivada !== false,
          },
        });
        const c = cohort as Record<string, unknown>;
        const toDate = (v: unknown): string | null =>
          v == null ? null : typeof v === "string" ? v : (v as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? null;
        return NextResponse.json({
          id: cohort.id,
          name: c.nombre ?? c.name,
          nombre: c.nombre,
          courseId: c.courseId,
          facilitadorId: c.facilitadorId,
          fechaInicio: toDate(c.fechaInicio),
          fechaFin: toDate(c.fechaFin),
          estado: c.estado,
          alumnos: c.alumnos ?? [],
          codigoInvitacion: c.codigoInvitacion,
          configuracion: c.configuracion,
          created_at: typeof c.created_at === "string" ? c.created_at : new Date().toISOString(),
          updated_at: typeof c.updated_at === "string" ? c.updated_at : new Date().toISOString(),
        });
      }

      const cohort = await firebaseContent.createCohort({
        name,
        description: body.description?.trim() || null,
        starts_at: body.startsAt || null,
        ends_at: body.endsAt || null,
        timezone: "UTC",
        capacity: typeof body.capacity === "number" ? body.capacity : 0,
        is_active: body.isActive !== false,
      });
      return NextResponse.json({
        id: cohort.id,
        name: cohort.name,
        description: cohort.description ?? null,
        starts_at: cohort.starts_at ?? null,
        ends_at: cohort.ends_at ?? null,
        timezone: (cohort.timezone as string) ?? "UTC",
        capacity: (cohort.capacity as number) ?? 0,
        is_active: cohort.is_active !== false,
        created_at: typeof cohort.created_at === "string" ? cohort.created_at : new Date().toISOString(),
        updated_at: typeof cohort.updated_at === "string" ? cohort.updated_at : new Date().toISOString(),
      });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 401 });
    }
  }
  const auth = await requireAdminSupabase();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  let body: { name?: string; description?: string; startsAt?: string; endsAt?: string; capacity?: number; isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Falta el nombre del grupo" }, { status: 400 });
  const { data, error } = await auth.supabase
    .from("cohorts")
    .insert({
      name,
      description: body.description?.trim() || null,
      starts_at: body.startsAt || null,
      ends_at: body.endsAt || null,
      timezone: "UTC",
      capacity: typeof body.capacity === "number" ? body.capacity : 0,
      is_active: body.isActive !== false,
    })
    .select("id, name, description, starts_at, ends_at, timezone, capacity, is_active, created_at, updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

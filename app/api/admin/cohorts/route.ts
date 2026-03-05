import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado", status: 401 as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Solo administradores", status: 403 as const };
  return { supabase, user };
}

export async function GET() {
  if (getDemoMode()) {
    return NextResponse.json([
      {
        id: "demo-cohort-id",
        name: "Cohorte demo",
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

  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("cohorts")
    .select("id, name, description, starts_at, ends_at, timezone, capacity, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (getDemoMode()) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      id: "demo-cohort-id",
      name: body.name ?? "Cohorte demo",
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

  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    name?: string;
    description?: string;
    startsAt?: string;
    endsAt?: string;
    capacity?: number;
    isActive?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Falta el nombre de la cohorte" }, { status: 400 });
  }

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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

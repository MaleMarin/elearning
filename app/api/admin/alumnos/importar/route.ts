/**
 * POST /api/admin/alumnos/importar
 * Requiere sesión de administrador. Misma lógica que v1 pero sin API key.
 * Body: JSON { alumnos: [{ nombre, email, institucion, cargo? }] }
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function randomPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ creados: 0, mensaje: "Modo demo: importación deshabilitada" });
  }
  if (!useFirebase()) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const alumnos = Array.isArray(body.alumnos) ? body.alumnos : [];
    if (alumnos.length === 0) {
      return NextResponse.json({ error: "No hay filas válidas (alumnos con nombre, email, institucion)" }, { status: 400 });
    }
    if (alumnos.length > 500) {
      return NextResponse.json({ error: "Máximo 500 alumnos por importación" }, { status: 400 });
    }

    const authAdmin = getFirebaseAdminAuth();
    const db = getFirebaseAdminFirestore();
    const results: { email: string; uid?: string; error?: string; password?: string }[] = [];

    for (const a of alumnos) {
      const email = (a.email ?? "").trim().toLowerCase();
      if (!email) {
        results.push({ email: "", error: "Email vacío" });
        continue;
      }
      try {
        const password = randomPassword();
        const user = await authAdmin.createUser({
          email,
          password,
          displayName: (a.nombre ?? "").trim() || email,
        });
        await db.collection("users").doc(user.uid).set(
          {
            fullName: (a.nombre ?? "").trim() || email,
            institution: (a.institucion ?? "").trim() || null,
            position: (a.cargo ?? "").trim() || null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        await db.collection("profiles").doc(user.uid).set(
          { email, role: "student", updatedAt: new Date() },
          { merge: true }
        );
        results.push({ email, uid: user.uid, password });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ email, error: msg });
      }
    }

    const creados = results.filter((r) => r.uid).length;
    return NextResponse.json({
      creados,
      total: alumnos.length,
      resultados: results,
      mensaje: `Importados ${creados} de ${alumnos.length}. Distribuye las contraseñas temporales de forma segura.`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/**
 * POST /api/v1/alumnos/importar
 * Requiere API key con permiso "admin".
 * Body: CSV (text/csv o multipart) o JSON { alumnos: [{ nombre, email, institucion, cargo? }] }
 * Crea usuarios en Firebase Auth + perfil en Firestore. Opcional: enviar email con contraseña temporal.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { requireApiKey } from "@/lib/auth/api-key-request";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseCsv(csv: string): { nombre: string; email: string; institucion: string; cargo: string }[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase();
  const nameCol = header.includes("nombre") ? header.split(",").indexOf("nombre") : 0;
  const emailCol = header.includes("email") ? header.split(",").indexOf("email") : 1;
  const instCol = header.includes("institucion") ? header.split(",").indexOf("institucion") : 2;
  const cargoCol = header.includes("cargo") ? header.split(",").indexOf("cargo") : 3;
  const rows: { nombre: string; email: string; institucion: string; cargo: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
    const email = (parts[emailCol] ?? "").trim();
    if (!email) continue;
    rows.push({
      nombre: (parts[nameCol] ?? "").trim(),
      email,
      institucion: (parts[instCol] ?? "").trim(),
      cargo: (parts[cargoCol] ?? "").trim(),
    });
  }
  return rows;
}

function randomPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req, "admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (getDemoMode()) {
    return NextResponse.json({ creados: 0, mensaje: "Modo demo: importación deshabilitada" });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  try {
    let alumnos: { nombre: string; email: string; institucion: string; cargo?: string }[] = [];
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      alumnos = Array.isArray(body.alumnos) ? body.alumnos : [];
    } else {
      const text = await req.text();
      alumnos = parseCsv(text);
    }
    if (alumnos.length === 0) {
      return NextResponse.json({ error: "No hay filas válidas (nombre, email, institucion)" }, { status: 400 });
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
      mensaje: `Importados ${creados} de ${alumnos.length}. Las contraseñas temporales aparecen en resultados; distribúyelas de forma segura o envía invitaciones por email.`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

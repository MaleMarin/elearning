/**
 * POST /api/admin/seed/simulations
 * Carga los 3 escenarios del Simulador de Política Pública en Firestore /simulations.
 * Solo administradores. Requiere Firebase.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getSimulationsWithIds } from "@/lib/data/simulations-seed";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }
    if (!useFirebase()) {
      return NextResponse.json(
        { error: "Firestore no está habilitado. No se pueden cargar escenarios." },
        { status: 503 }
      );
    }

    const db = getFirebaseAdminFirestore();
    const simulations = getSimulationsWithIds();
    const coll = db.collection("simulations");

    for (const sim of simulations) {
      const { id, ...data } = sim;
      await coll.doc(id).set({
        titulo: data.titulo,
        contexto: data.contexto,
        presupuesto: data.presupuesto,
        tiempo: data.tiempo,
        equipo: data.equipo,
        modulo: data.modulo,
        criterios: data.criterios,
        dificultad: data.dificultad,
        duracionMinutos: data.duracionMinutos,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "3 escenarios del simulador cargados en Firestore.",
      count: simulations.length,
    });
  } catch (e) {
    console.error("Seed simulations:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al cargar escenarios" },
      { status: 500 }
    );
  }
}

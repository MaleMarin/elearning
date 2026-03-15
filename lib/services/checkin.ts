/**
 * Check-in cognitivo diario (Brecha 4).
 * Firestore: /users/{uid}/checkins/{fecha} con fecha = YYYY-MM-DD.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export interface Checkin {
  fecha: string;
  energia: 1 | 2 | 3;
  foco: 1 | 2 | 3;
  tiempoDisponible: 5 | 15 | 30 | 60;
  recomendacion: "micro" | "normal" | "profundo";
}

export interface Recomendacion {
  tipo: "micro" | "normal" | "profundo";
  mensaje: string;
  accion: string;
}

const COLLECTION = "checkins";
const USERS = "users";

function db() {
  return getFirebaseAdminFirestore();
}

export function calcularRecomendacion(checkin: Checkin): Recomendacion {
  const score = checkin.energia + checkin.foco;

  if (checkin.tiempoDisponible <= 5 || score <= 3) {
    return {
      tipo: "micro",
      mensaje: "Hoy hacemos algo pequeño pero poderoso.",
      accion: "Ver el resumen de la última lección (2 min)",
    };
  }
  if (checkin.tiempoDisponible <= 15 || score <= 4) {
    return {
      tipo: "micro",
      mensaje: "Perfecto para una micro-lección.",
      accion: "Completar 1 lección corta",
    };
  }
  if (score >= 5 && checkin.tiempoDisponible >= 30) {
    return {
      tipo: "profundo",
      mensaje: "Hoy es un buen día para ir a fondo.",
      accion: "Módulo completo + quiz",
    };
  }
  return {
    tipo: "normal",
    mensaje: "Empecemos con lo que sigue.",
    accion: "Continuar donde lo dejaste",
  };
}

export async function getCheckin(uid: string, fecha: string): Promise<Checkin | null> {
  const snap = await db()
    .collection(USERS)
    .doc(uid)
    .collection(COLLECTION)
    .doc(fecha)
    .get();
  if (!snap.exists) return null;
  return snap.data() as Checkin;
}

export async function setCheckin(uid: string, data: Omit<Checkin, "recomendacion">): Promise<Checkin> {
  const recomendacion = calcularRecomendacion(data as Checkin);
  const checkin: Checkin = {
    ...data,
    recomendacion: recomendacion.tipo,
  };
  const ref = db().collection(USERS).doc(uid).collection(COLLECTION).doc(data.fecha);
  await ref.set(checkin);
  return checkin;
}

/** Últimas N semanas de checkins para gráfica en perfil. */
export async function getCheckinsLastWeeks(uid: string, weeks: number): Promise<Checkin[]> {
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7);
  const startStr = start.toISOString().slice(0, 10);
  const snap = await db()
    .collection(USERS)
    .doc(uid)
    .collection(COLLECTION)
    .where("fecha", ">=", startStr)
    .orderBy("fecha", "desc")
    .get();
  return snap.docs.map((d) => d.data() as Checkin);
}

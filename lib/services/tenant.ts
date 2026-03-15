/**
 * Multitenancy: instituciones por subdominio.
 * Firestore: /tenants/{tenantId}
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export type TenantPlan = "basico" | "pro" | "enterprise";

export interface Tenant {
  tenantId: string;
  nombre: string;
  subdominio: string;
  logo: string;
  colorPrimario: string;
  colorSecundario: string;
  fraseBienvenida: string;
  plan: TenantPlan;
  adminIds: string[];
  alumnos: number;
  creadoAt: Date;
}

const COLLECTION = "tenants";
const DEFAULT_PRIMARY = "#021097";
const DEFAULT_SECONDARY = "#0168EF";

function db() {
  return getFirebaseAdminFirestore();
}

function toDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function") return (v as { toDate: () => Date }).toDate();
  if (typeof v === "string") return new Date(v);
  return v instanceof Date ? v : null;
}

function docToTenant(id: string, data: FirebaseFirestore.DocumentData): Tenant {
  return {
    tenantId: id,
    nombre: (data.nombre as string) ?? "",
    subdominio: (data.subdominio as string) ?? id,
    logo: (data.logo as string) ?? "",
    colorPrimario: (data.colorPrimario as string) ?? DEFAULT_PRIMARY,
    colorSecundario: (data.colorSecundario as string) ?? DEFAULT_SECONDARY,
    fraseBienvenida: (data.fraseBienvenida as string) ?? "",
    plan: (data.plan as TenantPlan) ?? "basico",
    adminIds: Array.isArray(data.adminIds) ? data.adminIds : [],
    alumnos: typeof data.alumnos === "number" ? data.alumnos : 0,
    creadoAt: toDate(data.creadoAt) ?? new Date(),
  };
}

/** Obtiene un tenant por id (subdominio). Devuelve null si no existe. */
export async function getTenant(tenantId: string | null | undefined): Promise<Tenant | null> {
  if (!tenantId || !tenantId.trim()) return null;
  const id = tenantId.trim().toLowerCase();
  const doc = await db().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToTenant(doc.id, doc.data()!);
}

/** Lista todos los tenants (para superadmin). */
export async function listTenants(): Promise<Tenant[]> {
  const snap = await db().collection(COLLECTION).orderBy("creadoAt", "desc").get();
  return snap.docs.map((d) => docToTenant(d.id, d.data()));
}

/** Crea un nuevo tenant. El tenantId debe ser el subdominio (lowercase, sin espacios). */
export async function createTenant(params: {
  tenantId: string;
  nombre: string;
  subdominio: string;
  logo?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  fraseBienvenida?: string;
  plan?: TenantPlan;
  adminIds?: string[];
}): Promise<Tenant> {
  const id = params.subdominio.trim().toLowerCase().replace(/\s+/g, "");
  if (!id) throw new Error("subdominio requerido");

  const ref = db().collection(COLLECTION).doc(id);
  const exists = (await ref.get()).exists;
  if (exists) throw new Error("Ya existe un tenant con ese subdominio");

  const now = new Date();
  const data = {
    nombre: (params.nombre ?? "").trim() || id,
    subdominio: id,
    logo: (params.logo ?? "").trim(),
    colorPrimario: (params.colorPrimario ?? DEFAULT_PRIMARY).trim(),
    colorSecundario: (params.colorSecundario ?? DEFAULT_SECONDARY).trim(),
    fraseBienvenida: (params.fraseBienvenida ?? "").trim(),
    plan: params.plan ?? "basico",
    adminIds: Array.isArray(params.adminIds) ? params.adminIds : [],
    alumnos: 0,
    creadoAt: now,
  };
  await ref.set(data);
  return docToTenant(id, data);
}

/** Actualiza un tenant (solo campos enviados). */
export async function updateTenant(
  tenantId: string,
  updates: Partial<Omit<Tenant, "tenantId" | "creadoAt" | "alumnos">>
): Promise<void> {
  const ref = db().collection(COLLECTION).doc(tenantId.trim().toLowerCase());
  const clean: Record<string, unknown> = {};
  if (updates.nombre !== undefined) clean.nombre = updates.nombre;
  if (updates.subdominio !== undefined) clean.subdominio = updates.subdominio;
  if (updates.logo !== undefined) clean.logo = updates.logo;
  if (updates.colorPrimario !== undefined) clean.colorPrimario = updates.colorPrimario;
  if (updates.colorSecundario !== undefined) clean.colorSecundario = updates.colorSecundario;
  if (updates.fraseBienvenida !== undefined) clean.fraseBienvenida = updates.fraseBienvenida;
  if (updates.plan !== undefined) clean.plan = updates.plan;
  if (updates.adminIds !== undefined) clean.adminIds = updates.adminIds;
  if (Object.keys(clean).length === 0) return;
  await ref.update(clean);
}

/** Incrementa el contador de alumnos del tenant (al inscribir). */
export async function incrementTenantAlumnos(tenantId: string, delta = 1): Promise<void> {
  const ref = db().collection(COLLECTION).doc(tenantId.trim().toLowerCase());
  const snap = await ref.get();
  const current = (snap.data()?.alumnos as number) ?? 0;
  await ref.update({ alumnos: current + delta });
}

/**
 * GET: lista tenants. POST: crea tenant. Solo superadmin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getSuperadminUids, getSuperadminEmail, getDemoMode, useFirebase } from "@/lib/env";
import * as tenantService from "@/lib/services/tenant";

export const dynamic = "force-dynamic";

function isSuperadmin(uid: string, email: string | null): boolean {
  const uids = getSuperadminUids();
  const adminEmail = getSuperadminEmail();
  if (uids.length > 0 && uids.includes(uid)) return true;
  if (adminEmail && email?.toLowerCase() === adminEmail.toLowerCase()) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ tenants: [] });
  if (!useFirebase()) return NextResponse.json({ tenants: [] });
  try {
    const auth = await getAuthFromRequest(req);
    if (!isSuperadmin(auth.uid, auth.email)) return NextResponse.json({ error: "Solo superadmin" }, { status: 403 });
    const tenants = await tenantService.listTenants();
    return NextResponse.json({ tenants });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      tenantId: "demo",
      nombre: "Demo",
      subdominio: "demo",
      plan: "basico",
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (!isSuperadmin(auth.uid, auth.email)) return NextResponse.json({ error: "Solo superadmin" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const nombre = (body.nombre as string)?.trim() ?? "";
    const subdominio = (body.subdominio as string)?.trim().toLowerCase().replace(/\s+/g, "") ?? "";
    const plan = ["basico", "pro", "enterprise"].includes(body.plan) ? body.plan : "basico";
    const adminEmail = (body.adminEmail as string)?.trim();
    if (!subdominio) return NextResponse.json({ error: "Falta subdominio" }, { status: 400 });

    const tenant = await tenantService.createTenant({
      tenantId: subdominio,
      nombre: nombre || subdominio,
      subdominio,
      plan,
      logo: body.logo ?? "",
      colorPrimario: body.colorPrimario ?? "#021097",
      colorSecundario: body.colorSecundario ?? "#0168EF",
      fraseBienvenida: body.fraseBienvenida ?? "",
      adminIds: adminEmail ? [] : [], // TODO: resolver admin por email a uid y poner en adminIds
    });
    return NextResponse.json(tenant);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

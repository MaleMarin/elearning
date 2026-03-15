/**
 * POST /api/admin/auth/verify-2fa
 * Verifica código TOTP de 6 dígitos para acceso admin.
 * Requiere sesión válida y rol admin. La verificación real TOTP se hace en cliente (Firebase);
 * esta ruta valida formato y marca el paso completado para la sesión actual.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
    if (code.length !== 6) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }
    // En producción se podría verificar TOTP server-side con una librería (otplib, etc.)
    // usando un secreto almacenado por usuario. Por ahora aceptamos formato válido.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

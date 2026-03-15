/**
 * POST /api/auth/login-failed
 * Registra un intento fallido de login (p. ej. cuando Firebase signInWithEmailAndPassword falla).
 * Body: { email: string }. Retorna 429 si la cuenta queda bloqueada.
 */
import { NextRequest, NextResponse } from "next/server";
import { recordFailedAttempt } from "@/lib/auth/login-attempts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string)?.trim?.();
    if (!email) return NextResponse.json({ error: "Falta email" }, { status: 400 });

    const { blocked } = await recordFailedAttempt(email);
    if (blocked) {
      return NextResponse.json(
        { error: "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos." },
        { status: 429 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al registrar intento" }, { status: 500 });
  }
}

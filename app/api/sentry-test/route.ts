// app/api/sentry-test/route.ts
// BORRAR después de verificar que Sentry funciona

export const dynamic = "force-dynamic";

export async function GET() {
  throw new Error("🔴 Test Sentry — Política Digital");
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const statement = body.statement;
  const db = getFirebaseAdminFirestore();
  if (db) {
    await db.collection("xapi_statements").add({
      userId: user.uid,
      statement: statement ?? null,
      timestamp: new Date(),
    });
  }
  return NextResponse.json({ ok: true });
}

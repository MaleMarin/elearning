import { NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.uid) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { subscription: PushSubscriptionJSON; userId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { subscription } = body;
  if (!subscription || typeof subscription !== "object") {
    return new Response(JSON.stringify({ error: "subscription requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getFirebaseAdminFirestore();
  await db.collection("pushSubscriptions").doc(auth.uid).set({
    subscription,
    updatedAt: new Date(),
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

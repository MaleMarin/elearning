import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const VERB_PAUSED = "https://w3id.org/xapi/video/verbs/paused";
const VERB_TERMINATED = "https://w3id.org/xapi/video/verbs/terminated";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("xapi_statements").orderBy("timestamp", "desc").limit(500).get();

  const segundos: Record<number, number> = {};
  snap.docs.forEach((doc) => {
    const data = doc.data();
    const statement = data?.statement as { result?: { extensions?: Record<string, number> }; verb?: { id?: string } } | undefined;
    const verbId = statement?.verb?.id;
    if (verbId !== VERB_PAUSED && verbId !== VERB_TERMINATED) return;
    const tiempo = Math.floor(statement?.result?.extensions?.["https://w3id.org/xapi/video/extensions/time"] ?? 0);
    if (tiempo > 0) segundos[tiempo] = (segundos[tiempo] || 0) + 1;
  });

  const datos = Object.entries(segundos)
    .map(([segundo, abandonos]) => ({ segundo: Number(segundo), abandonos }))
    .sort((a, b) => a.segundo - b.segundo)
    .slice(0, 30);

  return NextResponse.json({ datos });
}

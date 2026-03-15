import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDueReviews, updateAfterReview } from "@/lib/services/spaced-repetition";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const reviews = await getDueReviews(user.uid);
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const conceptId = body.conceptId as string;
  const remembered = body.remembered as boolean;
  if (!conceptId || typeof remembered !== "boolean") {
    return NextResponse.json({ error: "Falta conceptId o remembered" }, { status: 400 });
  }
  await updateAfterReview(user.uid, conceptId, remembered);
  return NextResponse.json({ success: true });
}

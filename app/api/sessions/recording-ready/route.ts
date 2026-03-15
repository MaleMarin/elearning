/**
 * Webhook de Daily.co cuando la grabación está lista.
 * POST llamado por Daily con payload del evento recording.completed.
 * Se puede vincular la grabación al módulo en Firestore (liveRecording).
 */
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomName = body.room?.name ?? body.payload?.room_name;
    const recordingUrl = body.recording?.mp4_url ?? body.payload?.mp4_url ?? body.url;
    if (!roomName) return NextResponse.json({ ok: false }, { status: 400 });
    const db = getFirebaseAdminFirestore();
    await db.collection("sessionRecordings").add({
      roomName,
      recordingUrl: recordingUrl ?? null,
      receivedAt: new Date().toISOString(),
      payload: body,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

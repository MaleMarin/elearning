import webpush from "web-push";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:admin@politicadigital.gob.mx";

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!vapidPublic || !vapidPrivate) return;

  const db = getFirebaseAdminFirestore();
  const doc = await db.collection("pushSubscriptions").doc(userId).get();
  if (!doc.exists) return;

  const data = doc.data();
  const subscription = data?.subscription;
  if (!subscription || typeof subscription !== "object") return;

  await webpush.sendNotification(
    subscription as webpush.PushSubscription,
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: { url: payload.url ?? "/inicio" },
    })
  );
}

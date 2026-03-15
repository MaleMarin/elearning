/**
 * Firebase Admin SDK para API routes y middleware.
 * Requiere FIREBASE_SERVICE_ACCOUNT_JSON en env (JSON del service account).
 */

import * as admin from "firebase-admin";
import { getFirebaseServiceAccount } from "./config";

let app: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
  if (app) return app;
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;
  const cred = getFirebaseServiceAccount();
  if (!cred) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON no está definido. Descarga la clave desde Firebase Console > Configuración > Cuentas de servicio."
    );
  }
  const projectId = (cred as { project_id?: string }).project_id;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.appspot.com` : undefined);
  app = admin.initializeApp({
    credential: admin.credential.cert(cred as admin.ServiceAccount),
    ...(storageBucket && { storageBucket }),
  });
  return app;
}

export function getFirebaseAdminAuth(): admin.auth.Auth {
  return admin.auth(getAdminApp());
}

export function getFirebaseAdminFirestore(): admin.firestore.Firestore {
  return admin.firestore(getAdminApp());
}

export function getFirebaseAdminStorage() {
  const { getStorage } = require("firebase-admin/storage");
  return getStorage(getAdminApp());
}

/** Asegura que exista un documento en profiles/{uid} con role por defecto. */
export async function ensureFirebaseProfile(uid: string, email: string | null): Promise<void> {
  const db = getFirebaseAdminFirestore();
  const ref = db.collection("profiles").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      email: email ?? null,
      role: "student",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Configuración Firebase desde env.
 * Cliente: NEXT_PUBLIC_FIREBASE_*
 * Servidor (Admin): FIREBASE_SERVICE_ACCOUNT_JSON (JSON string o base64).
 */

function env(key: string): string | undefined {
  return typeof process !== "undefined" ? process.env[key] : undefined;
}

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

/** Config para el cliente (NEXT_PUBLIC_*). */
export function getFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = env("NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = env("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = env("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = env("NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket || `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId || "",
    appId,
  };
}

/** Service account para Admin SDK. Puede ser JSON string o base64. */
export function getFirebaseServiceAccount(): object | null {
  const raw = env("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!raw || !raw.trim()) return null;
  try {
    const decoded = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded) as object;
  } catch {
    return null;
  }
}

export function hasFirebaseConfig(): boolean {
  return getFirebaseClientConfig() !== null;
}

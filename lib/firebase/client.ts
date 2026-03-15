"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirebaseClientConfig } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (app) return app;
  const config = getFirebaseClientConfig();
  if (!config) return null;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0] as FirebaseApp;
    return app;
  }
  app = initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (auth) return auth;
  const a = getApp();
  if (!a) return null;
  auth = getAuth(a);
  return auth;
}

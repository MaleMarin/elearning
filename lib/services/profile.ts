/**
 * Perfil de usuario en Firestore: /users/{userId}
 * Subcolección badges: /users/{userId}/badges
 * Solo usar cuando useFirebase() === true. En demo no persistir.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const USERS = "users";
const BADGES = "badges";

/** Preferencias de accesibilidad (Brecha 2). */
export type AccessibilityFontSize = "normal" | "large";
export interface AccessibilityPrefs {
  fontSize?: AccessibilityFontSize;
  reduceMotion?: boolean;
  highContrast?: boolean;
}

/** Modo de contenido preferido en lecciones (leer texto, escuchar audio, ver video). */
export type ContentMode = "leer" | "escuchar" | "ver";

export interface UserProfile {
  fullName?: string | null;
  photoURL?: string | null;
  institution?: string | null;
  position?: string | null;
  country?: string | null;
  region?: string | null;
  linkedIn?: string | null;
  preferredLanguage?: "es" | "en";
  reminderFrequency?: "daily" | "weekly" | "live_only" | "never";
  /** Modo de contenido preferido: leer, escuchar o ver. */
  contentMode?: ContentMode;
  totalMinutesOnPlatform?: number;
  lastActivityDate?: string | null;
  streakDays?: number;
  /** Puntos de gamificación por actividad (ítem 79). */
  totalPoints?: number;
  updatedAt?: string;
  /** Preferencias de accesibilidad (obligación legal). */
  accessibilityFontSize?: AccessibilityFontSize;
  accessibilityReduceMotion?: boolean;
  accessibilityHighContrast?: boolean;
}

export type BadgeId =
  | "first_lesson"
  | "streak_3"
  | "module_complete"
  | "halfway"
  | "certificate"
  | "learning_team"
  | "experto_contribuidor"
  | "estratega";

export interface UserBadge {
  id: BadgeId;
  earnedAt: string;
}

const BADGE_IDS: BadgeId[] = [
  "first_lesson",
  "streak_3",
  "module_complete",
  "halfway",
  "certificate",
  "learning_team",
  "experto_contribuidor",
  "estratega",
];

function db() {
  return getFirebaseAdminFirestore();
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await db().collection(USERS).doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown> | undefined;
  if (!d) return null;
  return {
    fullName: (d.fullName as string) ?? null,
    photoURL: (d.photoURL as string) ?? null,
    institution: (d.institution as string) ?? null,
    position: (d.position as string) ?? null,
    country: (d.country as string) ?? null,
    region: (d.region as string) ?? null,
    linkedIn: (d.linkedIn as string) ?? null,
    preferredLanguage: (d.preferredLanguage as "es" | "en") ?? "es",
    reminderFrequency: (d.reminderFrequency as UserProfile["reminderFrequency"]) ?? "weekly",
    totalMinutesOnPlatform: (d.totalMinutesOnPlatform as number) ?? 0,
    lastActivityDate: (d.lastActivityDate as string) ?? null,
    streakDays: (d.streakDays as number) ?? 0,
    totalPoints: (d.totalPoints as number) ?? 0,
    updatedAt: d.updatedAt as string | undefined,
    accessibilityFontSize: (d.accessibilityFontSize as AccessibilityFontSize) ?? "normal",
    accessibilityReduceMotion: (d.accessibilityReduceMotion as boolean) ?? false,
    accessibilityHighContrast: (d.accessibilityHighContrast as boolean) ?? false,
    contentMode: (d.contentMode as UserProfile["contentMode"]) ?? "leer",
  };
}

export async function updateProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "updatedAt" | "totalMinutesOnPlatform" | "lastActivityDate" | "streakDays">>
): Promise<UserProfile> {
  const ref = db().collection(USERS).doc(uid);
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: now,
  };
  await ref.set(payload, { merge: true });
  const snap = await ref.get();
  const d = snap.data() as Record<string, unknown>;
  return {
    fullName: (d?.fullName as string) ?? null,
    photoURL: (d?.photoURL as string) ?? null,
    institution: (d?.institution as string) ?? null,
    position: (d?.position as string) ?? null,
    country: (d?.country as string) ?? null,
    region: (d?.region as string) ?? null,
    linkedIn: (d?.linkedIn as string) ?? null,
    preferredLanguage: (d?.preferredLanguage as "es" | "en") ?? "es",
    reminderFrequency: (d?.reminderFrequency as UserProfile["reminderFrequency"]) ?? "weekly",
    totalMinutesOnPlatform: (d?.totalMinutesOnPlatform as number) ?? 0,
    lastActivityDate: (d?.lastActivityDate as string) ?? null,
    streakDays: (d?.streakDays as number) ?? 0,
    totalPoints: (d?.totalPoints as number) ?? 0,
    updatedAt: d?.updatedAt as string,
    accessibilityFontSize: (d?.accessibilityFontSize as AccessibilityFontSize) ?? "normal",
    accessibilityReduceMotion: (d?.accessibilityReduceMotion as boolean) ?? false,
    accessibilityHighContrast: (d?.accessibilityHighContrast as boolean) ?? false,
    contentMode: (d?.contentMode as UserProfile["contentMode"]) ?? "leer",
  };
}

export async function getBadges(uid: string): Promise<UserBadge[]> {
  const snap = await db().collection(USERS).doc(uid).collection(BADGES).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: data.id as BadgeId, earnedAt: data.earnedAt as string };
  });
}

export async function setBadge(uid: string, badgeId: BadgeId): Promise<void> {
  const ref = db().collection(USERS).doc(uid).collection(BADGES).doc(badgeId);
  const snap = await ref.get();
  if (snap.exists) return;
  await ref.set({ id: badgeId, earnedAt: new Date().toISOString() });
  const { trackBadgeEarned } = await import("@/lib/xapi/statements");
  trackBadgeEarned(uid, badgeId);
}

export function getAllBadgeIds(): BadgeId[] {
  return [...BADGE_IDS];
}

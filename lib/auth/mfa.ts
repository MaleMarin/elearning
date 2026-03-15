/**
 * Helpers para MFA TOTP (Firebase Auth) en el cliente.
 * Requiere Firebase con Identity Platform y TOTP habilitado en el proyecto.
 */

import { getFirebaseAuth } from "@/lib/firebase/client";
import type { User, MultiFactorResolver } from "firebase/auth";

/** Objeto TotpSecret devuelto por generateSecret; se debe pasar a enrollTotpWithSecret. */
export type TotpSecretHandle = { secretKey: string; qrCodeUrl: string; _totpSecret: unknown };

/** Devuelve si el usuario tiene al menos un factor MFA inscrito. */
export async function hasMfaEnrolled(user: User): Promise<boolean> {
  const { multiFactor } = await import("firebase/auth");
  const factors = multiFactor(user).enrolledFactors;
  return factors.length > 0;
}

/** Genera secreto TOTP y URL para QR. Guarda _totpSecret para pasarlo a enrollTotpWithSecret. */
export async function getTotpSecretForEnrollment(user: User): Promise<TotpSecretHandle> {
  const { multiFactor, TotpMultiFactorGenerator } = await import("firebase/auth");
  const session = await multiFactor(user).getSession();
  const totpSecret = await TotpMultiFactorGenerator.generateSecret(session);
  const qrCodeUrl = totpSecret.generateQrCodeUrl(user.email ?? "user", "Política Digital E-learning");
  return { secretKey: totpSecret.secretKey, qrCodeUrl, _totpSecret: totpSecret };
}

/** Completa la inscripción TOTP con el código de 6 dígitos. Usar el handle de getTotpSecretForEnrollment. */
export async function enrollTotpWithSecret(user: User, handle: TotpSecretHandle, verificationCode: string): Promise<void> {
  const { multiFactor, TotpMultiFactorGenerator } = await import("firebase/auth");
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(handle._totpSecret as import("firebase/auth").TotpSecret, verificationCode);
  await multiFactor(user).enroll(assertion, "Authenticator");
}

/** Elimina el factor MFA con el uid dado. */
export async function unenrollTotp(user: User, factorUid: string): Promise<void> {
  const { multiFactor } = await import("firebase/auth");
  await multiFactor(user).unenroll(factorUid);
}

/** Lista los factores inscritos (uid y displayName). */
export async function listEnrolledFactors(user: User): Promise<{ uid: string; displayName?: string }[]> {
  const { multiFactor } = await import("firebase/auth");
  return multiFactor(user).enrolledFactors.map((info) => ({
    uid: info.uid,
    displayName: info.displayName ?? undefined,
  }));
}

/**
 * Obtiene el resolver MFA a partir del error de signIn (auth/multi-factor-auth-required).
 * Luego usar resolveSignInWithTotp con el código del usuario.
 */
export async function getMfaResolverFromError(error: unknown): Promise<MultiFactorResolver | null> {
  const code = (error as { code?: string })?.code;
  if (code !== "auth/multi-factor-auth-required") return null;
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const { getMultiFactorResolver } = await import("firebase/auth");
  return getMultiFactorResolver(auth, error as Parameters<typeof getMultiFactorResolver>[1]);
}

/** Resuelve el sign-in con un código TOTP de 6 dígitos. Devuelve UserCredential. */
export async function resolveSignInWithTotp(
  resolver: MultiFactorResolver,
  verificationCode: string
): Promise<import("firebase/auth").UserCredential> {
  const { TotpMultiFactorGenerator } = await import("firebase/auth");
  const totpHint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  if (!totpHint) throw new Error("No se encontró factor TOTP");
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(totpHint.uid, verificationCode);
  return resolver.resolveSignIn(assertion);
}

/**
 * Cifrado E2E para datos sensibles (Brecha 1 — Cifrado E2E en datos sensibles).
 *
 * La llave se deriva del uid del usuario con PBKDF2; nunca sale del dispositivo
 * cuando el cifrado/descifrado se hace en cliente. El servidor almacena solo
 * ciphertext; solo el usuario con su uid puede descifrar.
 *
 * AES: CryptoJS.AES usa IV aleatorio por defecto en cada encrypt(), por lo que
 * el mismo texto produce distinto ciphertext cada vez (buena práctica).
 */

import CryptoJS from "crypto-js";

const PBKDF2_SALT = "politica-digital-salt-mx-2025";
const PBKDF2_ITERATIONS = 10000;
const KEY_SIZE_32 = 256 / 32;

function deriveKey(uid: string): string {
  return CryptoJS.PBKDF2(uid, PBKDF2_SALT, {
    keySize: KEY_SIZE_32,
    iterations: PBKDF2_ITERATIONS,
  }).toString();
}

/**
 * Cifra texto en claro con la llave derivada del uid. Solo el mismo usuario puede descifrar.
 */
export function encrypt(text: string, uid: string): string {
  if (!text) return "";
  const key = deriveKey(uid);
  return CryptoJS.AES.encrypt(text, key).toString();
}

/**
 * Descifra un ciphertext producido por encrypt(text, uid). Devuelve "" si falla.
 */
export function decrypt(ciphertext: string, uid: string): string {
  if (!ciphertext) return "";
  try {
    const key = deriveKey(uid);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

/**
 * Cifra cada valor de un objeto (valores como string). Útil para payloads estructurados.
 */
export function encryptObject<T extends object>(obj: T, uid: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, encrypt(String(v ?? ""), uid)])
  );
}

/**
 * Descifra un objeto producido por encryptObject. Valores no cifrados o inválidos devuelven "".
 */
export function decryptObject(
  encrypted: Record<string, string>,
  uid: string
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(encrypted).map(([k, v]) => [k, decrypt(v, uid)])
  );
}

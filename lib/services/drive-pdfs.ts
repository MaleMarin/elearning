/**
 * Lee el texto de todos los PDFs en una carpeta de Google Drive (Service Account).
 * Usado por el asistente PD para tener contexto del material "Elearning -PD".
 */

import { readFileSync } from "fs";
import path from "path";
import { extractTextFromPdf } from "./documentParser";

const DEFAULT_CREDENTIALS_PATH = path.join(
  process.cwd(),
  "service-account-drive.json"
);
const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_CREDENTIALS_PATH;

/** Máximo de caracteres totales a inyectar en el prompt desde Drive. */
const MAX_DRIVE_CONTEXT_CHARS = 100_000;

/** Cache en memoria: folderId -> { text, expires }. TTL 5 min. */
const cache = new Map<
  string,
  { text: string; expires: number }
>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(folderId: string): string | null {
  const entry = cache.get(folderId);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(folderId);
    return null;
  }
  return entry.text;
}

function setCached(folderId: string, text: string): void {
  cache.set(folderId, { text, expires: Date.now() + CACHE_TTL_MS });
}

/**
 * Lista PDFs en una carpeta de Drive y devuelve el texto extraído de todos (concatenado).
 * Usa cache de 5 min. Si no hay credenciales o la carpeta no está configurada, devuelve "".
 */
export async function getDrivePdfContext(folderId: string): Promise<string> {
  if (!folderId.trim()) return "";

  const cached = getCached(folderId);
  if (cached !== null) return cached;

  try {
    const { google } = await import("googleapis");
    let credentials: unknown;
    try {
      credentials = JSON.parse(
        readFileSync(CREDENTIALS_PATH, "utf8")
      );
    } catch {
      return "";
    }

    const auth = new google.auth.GoogleAuth({
      credentials: credentials as object,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
    });
    const files = listRes.data.files || [];
    if (files.length === 0) {
      setCached(folderId, "");
      return "";
    }

    const parts: string[] = [];
    let totalChars = 0;

    for (const file of files) {
      if (totalChars >= MAX_DRIVE_CONTEXT_CHARS) break;
      try {
        const res = await drive.files.get(
          { fileId: file.id!, alt: "media" },
          { responseType: "arraybuffer" }
        );
        const buffer = Buffer.from(res.data as ArrayBuffer);
        const text = await extractTextFromPdf(buffer);
        if (text) {
          const chunk = `[${file.name}]\n${text}`;
          const remaining = MAX_DRIVE_CONTEXT_CHARS - totalChars;
          parts.push(chunk.slice(0, remaining));
          totalChars += chunk.length;
        }
      } catch (e) {
        console.warn("[drive-pdfs] Error leyendo", file.name, e);
      }
    }

    const out = parts.join("\n\n---\n\n");
    setCached(folderId, out);
    return out;
  } catch (err) {
    console.warn("[drive-pdfs] Error:", err);
    return "";
  }
}

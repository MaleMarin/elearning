/**
 * Extracción de texto desde PDF y PPTX para generación de lecciones con IA.
 * Archivos subidos se procesan en memoria; no se guardan en Firestore (Storage sí si se suben).
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_FILE_SIZE) throw new Error("Archivo demasiado grande (máx 10 MB)");
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result?.text && typeof result.text === "string" ? result.text : "").trim();
  } finally {
    await parser.destroy();
  }
}

/**
 * PPTX es un ZIP con ppt/slides/slideN.xml. Extraemos texto de elementos <a:t>.
 */
export async function extractTextFromPptx(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_FILE_SIZE) throw new Error("Archivo demasiado grande (máx 10 MB)");
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const slides: string[] = [];
  const slideNames = Object.keys(zip.files).filter((n) => n.match(/^ppt\/slides\/slide\d+\.xml$/i)).sort();
  for (const name of slideNames) {
    const file = zip.files[name];
    if (file.dir) continue;
    const xml = await file.async("string");
    const text = extractTextFromSlideXml(xml);
    if (text) slides.push(text);
  }
  return slides.join("\n\n");
}

function extractTextFromSlideXml(xml: string): string {
  const segments: string[] = [];
  const regex = /<a:t>([^<]*)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    if (m[1]) segments.push(m[1].trim());
  }
  return segments.join(" ");
}

export type DocumentKind = "pdf" | "pptx";

export async function extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const lower = (filename || "").toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    return extractTextFromPdf(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    lower.endsWith(".pptx")
  ) {
    return extractTextFromPptx(buffer);
  }
  throw new Error("Formato no soportado. Usa PDF o PPTX.");
}

/**
 * Markdown muy simple para contenido de lecciones: párrafos y negrita.
 * Escapa HTML para evitar XSS.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c] ?? c);
}

/** Convierte **texto** a <strong> y párrafos (doble salto) a <p>. */
export function simpleMarkdownToHtml(md: string): string {
  if (!md || !md.trim()) return "";
  const escaped = escapeHtml(md);
  const withStrong = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const paragraphs = withStrong.split(/\n\n+/).filter((p) => p.trim());
  return paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`).join("");
}

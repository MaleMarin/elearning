/**
 * GET /api/portafolio/export-pdf — genera PDF del portafolio de transformación del alumno.
 * Requiere auth. Descarga: portafolio-transformacion.pdf
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const COLL = "portafolio_entradas";

export const dynamic = "force-dynamic";

/** Divide texto en líneas que caben en maxWidth (aprox. con 6pt por carácter para Helvetica 11). */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n/);
  for (const p of paragraphs) {
    let remaining = p.trim();
    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        lines.push(remaining);
        break;
      }
      const slice = remaining.slice(0, maxCharsPerLine);
      const lastSpace = slice.lastIndexOf(" ");
      const breakAt = lastSpace > maxCharsPerLine * 0.5 ? lastSpace : maxCharsPerLine;
      lines.push(remaining.slice(0, breakAt).trim());
      remaining = remaining.slice(breakAt).trim();
    }
  }
  return lines;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);
    const db = getFirebaseAdminFirestore();
    const snap = await db
      .collection("users")
      .doc(user.uid)
      .collection(COLL)
      .get();

    const entradas = snap.docs
      .map((d) => {
        const data = d.data();
        const updatedAt = data.updatedAt?.toDate?.() ?? data.updatedAt;
        return {
          moduloId: d.id,
          moduloTitulo: String(data.moduloTitulo ?? ""),
          aprendizaje: String(data.aprendizaje ?? ""),
          reflexion: String(data.reflexion ?? ""),
          aplicacion: String(data.aplicacion ?? ""),
          mood: String(data.mood ?? ""),
          updatedAt: updatedAt ? new Date(updatedAt).getTime() : 0,
        };
      })
      .sort((a, b) => a.updatedAt - b.updatedAt);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 50;
    const lineHeight = 14;
    const maxCharsPerLine = 72;

    const coverPage = pdfDoc.addPage([595, 842]);
    coverPage.drawText("Portafolio de Transformación", {
      x: margin,
      y: 750,
      size: 28,
      font: fontBold,
      color: rgb(0.08, 0.06, 0.54),
    });
    coverPage.drawText("Política Digital — Gobierno de México", {
      x: margin,
      y: 710,
      size: 14,
      font,
      color: rgb(0.29, 0.33, 0.5),
    });
    coverPage.drawText(
      new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long" }),
      {
        x: margin,
        y: 680,
        size: 12,
        font,
        color: rgb(0.53, 0.57, 0.69),
      }
    );

    for (const entrada of entradas) {
      const page = pdfDoc.addPage([595, 842]);
      let y = 780;

      page.drawText(entrada.moduloTitulo || "Módulo", {
        x: margin,
        y,
        size: 18,
        font: fontBold,
        color: rgb(0.08, 0.06, 0.54),
      });
      y -= 30;

      if (entrada.aprendizaje) {
        page.drawText("Aprendizaje clave:", {
          x: margin,
          y,
          size: 12,
          font: fontBold,
          color: rgb(0.29, 0.33, 0.5),
        });
        y -= 18;
        const learnLines = wrapText(entrada.aprendizaje, maxCharsPerLine);
        for (const line of learnLines) {
          if (y < 80) break;
          page.drawText(line, {
            x: margin,
            y,
            size: 11,
            font,
            color: rgb(0.29, 0.33, 0.5),
          });
          y -= lineHeight;
        }
        y -= 24;
      }

      if (entrada.reflexion) {
        page.drawText("Mi reflexión:", {
          x: margin,
          y,
          size: 12,
          font: fontBold,
          color: rgb(0.29, 0.33, 0.5),
        });
        y -= 18;
        const reflLines = wrapText(entrada.reflexion, maxCharsPerLine);
        for (const line of reflLines) {
          if (y < 80) break;
          page.drawText(line, {
            x: margin,
            y,
            size: 11,
            font,
            color: rgb(0.29, 0.33, 0.5),
          });
          y -= lineHeight;
        }
        y -= 24;
      }

      if (entrada.aplicacion) {
        page.drawText("Cómo lo apliqué:", {
          x: margin,
          y,
          size: 12,
          font: fontBold,
          color: rgb(0.29, 0.33, 0.5),
        });
        y -= 18;
        const applLines = wrapText(entrada.aplicacion, maxCharsPerLine);
        for (const line of applLines) {
          if (y < 80) break;
          page.drawText(line, {
            x: margin,
            y,
            size: 11,
            font,
            color: rgb(0.29, 0.33, 0.5),
          });
          y -= lineHeight;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="portafolio-transformacion.pdf"',
      },
    });
  } catch (e) {
    if (String(e).includes("No autorizado")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

/**
 * Genera el PDF del certificado con pdf-lib (una hoja; opcional segunda hoja con proyecto de transformación — Brecha 5).
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CertificatePdfData {
  nombre: string;
  curso: string;
  fecha: string;
  calificacion: string;
  idCert: string;
  /** Si se proporciona, se añade una segunda página al PDF con el proyecto documentado. */
  portfolioProject?: {
    titulo: string;
    ciudadanosBeneficiados: number;
    institucion: string;
  };
}

export async function buildCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin - 80;

  page.drawText("Política Digital", {
    x: margin,
    y,
    size: 24,
    font: bold,
    color: rgb(0.1, 0.2, 0.5),
  });
  y -= 28;

  page.drawText("Certificado de finalización", {
    x: margin,
    y,
    size: 18,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 50;

  page.drawText("Se certifica que", {
    x: margin,
    y,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 24;

  page.drawText(data.nombre, {
    x: margin,
    y,
    size: 20,
    font: bold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 32;

  page.drawText("ha completado el programa", {
    x: margin,
    y,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 24;

  page.drawText(data.curso, {
    x: margin,
    y,
    size: 16,
    font: bold,
    color: rgb(0.1, 0.2, 0.5),
  });
  y -= 40;

  page.drawText(`Fecha de emisión: ${data.fecha}`, {
    x: margin,
    y,
    size: 11,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 20;

  page.drawText(`Calificación: ${data.calificacion}`, {
    x: margin,
    y,
    size: 11,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 28;

  page.drawText(`ID de verificación: ${data.idCert}`, {
    x: margin,
    y,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 40;

  page.drawText("Innovación Pública · México", {
    x: margin,
    y: margin + 20,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  if (data.portfolioProject && (data.portfolioProject.titulo || data.portfolioProject.institucion)) {
    const page2 = doc.addPage([595, 842]);
    const { width: w2, height: h2 } = page2.getSize();
    let y2 = h2 - margin - 60;
    page2.drawText("Proyecto de transformación documentado", {
      x: margin,
      y: y2,
      size: 16,
      font: bold,
      color: rgb(0.1, 0.2, 0.5),
    });
    y2 -= 32;
    page2.drawText(`Título: ${data.portfolioProject.titulo || "—"}`, {
      x: margin,
      y: y2,
      size: 12,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y2 -= 22;
    page2.drawText(`Impacto: ${data.portfolioProject.ciudadanosBeneficiados} ciudadanos beneficiados`, {
      x: margin,
      y: y2,
      size: 12,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y2 -= 22;
    page2.drawText(`Institución: ${data.portfolioProject.institucion || "—"}`, {
      x: margin,
      y: y2,
      size: 12,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page2.drawText("Innovación Pública · México", {
      x: margin,
      y: margin + 20,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

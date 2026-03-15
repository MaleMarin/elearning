/**
 * Envío de email de notificación cuando el certificado está listo.
 * Integrable con Resend/Nodemailer vía env (RESEND_API_KEY, etc.).
 */

const env = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env[key] : undefined;

export interface CertificateEmailParams {
  toEmail: string;
  nombre: string;
  curso: string;
  certificadoUrl: string;
  idCert: string;
  verifyUrl: string;
}

export async function sendCertificateReadyEmail(params: CertificateEmailParams): Promise<void> {
  const { toEmail, nombre, curso, certificadoUrl, idCert, verifyUrl } = params;
  const apiKey = env("RESEND_API_KEY");
  if (!apiKey?.trim()) {
    console.info("[certificate-email] RESEND_API_KEY no configurado; no se envía email a", toEmail);
    return;
  }
  const from = env("EMAIL_FROM") ?? "Política Digital <noreply@precisar.local>";
  const subject = "Tu certificado de Política Digital está listo 🎓";
  const body = `
Hola ${nombre},

¡Felicitaciones! Has completado el programa ${curso}.

Tu certificado está disponible para descargar en:
${certificadoUrl}

ID de verificación: ${idCert}
Cualquier empleador puede verificar tu certificado en:
${verifyUrl}

Política Digital · Innovación Pública · México
`.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[certificate-email] Resend error:", res.status, err);
    }
  } catch (e) {
    console.error("[certificate-email]", e);
  }
}
